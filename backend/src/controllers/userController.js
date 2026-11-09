const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ExchangeRequest = require('../models/ExchangeRequest');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { publicUser, privateUser } = require('../utils/serializers');
const { escapeRegex, normalizeSkillName, buildPagination } = require('../utils/helpers');
const { clearSession } = require('../utils/session');
const { prepareSkillList } = require('../services/skillService');
const { computeOverlap } = require('../services/matchingService');
const { notify } = require('../services/notificationService');

exports.getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: privateUser(req.user) });
});

// Only approved fields are copied from the validated body (prevents mass assignment).
exports.updateMe = asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const user = req.user;

  ['name', 'city', 'bio', 'avatar', 'learningMode', 'availability'].forEach((field) => {
    if (body[field] !== undefined) user[field] = body[field];
  });
  if (body.offeredSkills) user.offeredSkills = await prepareSkillList(body.offeredSkills, user._id, 'offered');
  if (body.wantedSkills) user.wantedSkills = await prepareSkillList(body.wantedSkills, user._id, 'wanted');

  await user.save();
  sendSuccess(res, { user: privateUser(user) }, 'Profile updated');
});

exports.deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const account = await User.findById(userId).select('+passwordHash');
  const passwordOk = await bcrypt.compare(req.validated.body.password, account.passwordHash);
  if (!passwordOk) throw new ApiError(403, 'Incorrect password');

  const requests = await ExchangeRequest.find({ $or: [{ sender: userId }, { receiver: userId }] }).select('_id sender receiver status');
  const requestIds = requests.map((r) => r._id);

  await Message.deleteMany({ request: { $in: requestIds } });
  await Notification.deleteMany({ $or: [{ recipient: userId }, { relatedRequest: { $in: requestIds } }] });
  await ExchangeRequest.deleteMany({ _id: { $in: requestIds } });
  await User.deleteOne({ _id: userId });

  // Let people with open exchanges know why they disappeared.
  const affected = requests.filter((r) => ['pending', 'accepted'].includes(r.status));
  await Promise.all(
    affected.map((r) =>
      notify({
        recipient: String(r.sender) === String(userId) ? r.receiver : r.sender,
        type: 'request_cancelled',
        message: `${account.name} deleted their account, so your exchange was cancelled.`,
      })
    )
  );

  clearSession(res);
  sendSuccess(res, {}, 'Your account and related data have been deleted');
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-email');
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, { user: publicUser(user) });
});

// Find Skills page: search + filters + sorting + pagination, all executed in MongoDB.
exports.listUsers = asyncHandler(async (req, res) => {
  const q = req.validated.query;
  const me = req.user;
  const and = [{ _id: { $ne: me._id } }];

  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    and.push({ $or: [{ name: rx }, { 'offeredSkills.normalized': rx }, { 'wantedSkills.normalized': rx }] });
  }
  if (q.city) and.push({ cityNormalized: new RegExp(escapeRegex(normalizeSkillName(q.city))) });
  if (q.category) and.push({ $or: [{ 'offeredSkills.category': q.category }, { 'wantedSkills.category': q.category }] });
  if (q.mode) and.push({ learningMode: { $in: q.mode === 'either' ? ['either'] : [q.mode, 'either'] } });

  const offeredElem = {};
  if (q.offers) offeredElem.normalized = new RegExp(escapeRegex(normalizeSkillName(q.offers)));
  if (q.level) offeredElem.level = q.level;
  if (Object.keys(offeredElem).length) and.push({ offeredSkills: { $elemMatch: offeredElem } });
  if (q.wants) and.push({ 'wantedSkills.normalized': new RegExp(escapeRegex(normalizeSkillName(q.wants))) });

  const match = { $and: and };
  const myWanted = me.wantedSkills.map((s) => s.normalized);
  const myOffered = me.offeredSkills.map((s) => s.normalized);

  const pipeline = [{ $match: match }];
  if (q.sort === 'relevance') {
    pipeline.push(
      {
        $addFields: {
          _theyTeach: { $size: { $setIntersection: [{ $ifNull: ['$offeredSkills.normalized', []] }, { $literal: myWanted }] } },
          _iTeach: { $size: { $setIntersection: [{ $ifNull: ['$wantedSkills.normalized', []] }, { $literal: myOffered }] } },
        },
      },
      {
        $addFields: {
          _relevance: {
            $add: ['$_theyTeach', '$_iTeach', { $cond: [{ $and: [{ $gt: ['$_theyTeach', 0] }, { $gt: ['$_iTeach', 0] }] }, 10, 0] }],
          },
        },
      },
      { $sort: { _relevance: -1, updatedAt: -1, _id: 1 } }
    );
  } else {
    pipeline.push({ $sort: { updatedAt: -1, _id: 1 } });
  }
  pipeline.push(
    { $skip: (q.page - 1) * q.limit },
    { $limit: q.limit },
    // Explicit allow-list: email and password hash can never leak into search results.
    {
      $project: {
        name: 1, city: 1, bio: 1, avatar: 1, offeredSkills: 1, wantedSkills: 1,
        learningMode: 1, availability: 1, createdAt: 1, updatedAt: 1,
      },
    }
  );

  const [total, docs] = await Promise.all([User.countDocuments(match), User.aggregate(pipeline)]);
  const items = docs.map((doc) => ({ ...publicUser(doc), overlap: computeOverlap(me, doc) }));
  sendSuccess(res, { items, pagination: buildPagination(q.page, q.limit, total) });
});
