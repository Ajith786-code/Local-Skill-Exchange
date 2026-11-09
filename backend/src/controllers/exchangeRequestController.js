const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { serializeRequest } = require('../utils/serializers');
const { normalizeSkillName, buildPagination, refId } = require('../utils/helpers');
const { notify } = require('../services/notificationService');

const populateUsers = [
  { path: 'sender', select: 'name city avatar' },
  { path: 'receiver', select: 'name city avatar' },
];

const isParticipant = (request, userId) => [request.sender, request.receiver].some((p) => refId(p) === String(userId));

// Loads a request and checks the caller is allowed to act on it.
// actor: 'sender' | 'receiver' | 'participant'
async function loadForAction(requestId, user, actor) {
  const request = await ExchangeRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Exchange request not found');
  if (!isParticipant(request, user._id)) throw new ApiError(403, 'You are not part of this exchange request');
  if (actor === 'sender' && refId(request.sender) !== String(user._id)) {
    throw new ApiError(403, 'Only the sender can do this');
  }
  if (actor === 'receiver' && refId(request.receiver) !== String(user._id)) {
    throw new ApiError(403, 'Only the receiver can do this');
  }
  return request;
}

const requireStatus = (request, status, action) => {
  if (request.status !== status) {
    throw new ApiError(409, `Cannot ${action} a request that is ${request.status}`);
  }
};

const raceConflict = () => new ApiError(409, 'This request was just changed. Please refresh and try again.');
const respond = async (res, doc, userId, message, status = 200) => {
  await doc.populate(populateUsers);
  sendSuccess(res, { request: serializeRequest(doc, userId) }, message, status);
};

exports.createRequest = asyncHandler(async (req, res) => {
  const { receiverId, offeredSkill, requestedSkill, message } = req.validated.body;
  const me = req.user;

  if (String(me._id) === receiverId) throw new ApiError(400, 'You cannot send an exchange request to yourself');
  const receiver = await User.findById(receiverId);
  if (!receiver) throw new ApiError(404, 'User not found');

  const offeredNorm = normalizeSkillName(offeredSkill);
  const requestedNorm = normalizeSkillName(requestedSkill);
  const myOffered = me.offeredSkills.find((s) => s.normalized === offeredNorm);
  if (!myOffered) throw new ApiError(422, `You do not offer "${offeredSkill}". Add it to your profile first.`);
  const theirOffered = receiver.offeredSkills.find((s) => s.normalized === requestedNorm);
  if (!theirOffered) throw new ApiError(422, `${receiver.name} does not offer "${requestedSkill}".`);

  const duplicate = await ExchangeRequest.findOne({
    isActive: true,
    $or: [
      { sender: me._id, receiver: receiver._id, offeredSkillNormalized: offeredNorm, requestedSkillNormalized: requestedNorm },
      { sender: receiver._id, receiver: me._id, offeredSkillNormalized: requestedNorm, requestedSkillNormalized: offeredNorm },
    ],
  });
  if (duplicate) throw new ApiError(409, 'An active request for this exchange already exists');

  const request = await ExchangeRequest.create({
    sender: me._id,
    receiver: receiver._id,
    offeredSkill: myOffered.name,
    offeredSkillNormalized: offeredNorm,
    requestedSkill: theirOffered.name,
    requestedSkillNormalized: requestedNorm,
    message: message || '',
  });

  await notify({
    recipient: receiver._id,
    type: 'request_received',
    message: `${me.name} wants to exchange ${myOffered.name} for your ${theirOffered.name}`,
    relatedRequest: request._id,
  });
  await respond(res, request, me._id, 'Exchange request sent', 201);
});

exports.listRequests = asyncHandler(async (req, res) => {
  const { box, status, page, limit } = req.validated.query;
  const me = req.user._id;
  const scope = box === 'incoming' ? { receiver: me } : box === 'outgoing' ? { sender: me } : { $or: [{ sender: me }, { receiver: me }] };
  const filter = status ? { $and: [scope, { status }] } : scope;

  const [total, docs, grouped] = await Promise.all([
    ExchangeRequest.countDocuments(filter),
    ExchangeRequest.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populateUsers),
    ExchangeRequest.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = { pending: 0, accepted: 0, rejected: 0, cancelled: 0, completed: 0 };
  grouped.forEach((g) => {
    counts[g._id] = g.count;
  });
  sendSuccess(res, {
    items: docs.map((d) => serializeRequest(d, me)),
    pagination: buildPagination(page, limit, total),
    counts,
  });
});

exports.getRequest = asyncHandler(async (req, res) => {
  const request = await loadForAction(req.params.requestId, req.user, 'participant');
  await request.populate(populateUsers);
  sendSuccess(res, { request: serializeRequest(request, req.user._id) });
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  const request = await loadForAction(req.params.requestId, req.user, 'receiver');
  requireStatus(request, 'pending', 'accept');
  const updated = await ExchangeRequest.findOneAndUpdate(
    { _id: request._id, status: 'pending' },
    { $set: { status: 'accepted', respondedAt: new Date() } },
    { new: true }
  );
  if (!updated) throw raceConflict();
  await notify({
    recipient: updated.sender,
    type: 'request_accepted',
    message: `${req.user.name} accepted your exchange request. You can now chat!`,
    relatedRequest: updated._id,
  });
  await respond(res, updated, req.user._id, 'Request accepted');
});

exports.rejectRequest = asyncHandler(async (req, res) => {
  const request = await loadForAction(req.params.requestId, req.user, 'receiver');
  requireStatus(request, 'pending', 'reject');
  const updated = await ExchangeRequest.findOneAndUpdate(
    { _id: request._id, status: 'pending' },
    { $set: { status: 'rejected', isActive: false, respondedAt: new Date() } },
    { new: true }
  );
  if (!updated) throw raceConflict();
  await notify({
    recipient: updated.sender,
    type: 'request_rejected',
    message: `${req.user.name} declined your exchange request`,
    relatedRequest: updated._id,
  });
  await respond(res, updated, req.user._id, 'Request rejected');
});

exports.cancelRequest = asyncHandler(async (req, res) => {
  const request = await loadForAction(req.params.requestId, req.user, 'sender');
  requireStatus(request, 'pending', 'cancel');
  const updated = await ExchangeRequest.findOneAndUpdate(
    { _id: request._id, status: 'pending' },
    { $set: { status: 'cancelled', isActive: false, respondedAt: new Date() } },
    { new: true }
  );
  if (!updated) throw raceConflict();
  await notify({
    recipient: updated.receiver,
    type: 'request_cancelled',
    message: `${req.user.name} cancelled their exchange request`,
    relatedRequest: updated._id,
  });
  await respond(res, updated, req.user._id, 'Request cancelled');
});

// Completion rule: an accepted exchange becomes "completed" only after BOTH participants
// have marked it as completed.
exports.completeRequest = asyncHandler(async (req, res) => {
  const me = req.user;
  const request = await loadForAction(req.params.requestId, me, 'participant');
  requireStatus(request, 'accepted', 'complete');
  if (request.completedBy.some((id) => String(id) === String(me._id))) {
    throw new ApiError(409, 'You already marked this exchange as completed. Waiting for the other person.');
  }

  let updated = await ExchangeRequest.findOneAndUpdate(
    { _id: request._id, status: 'accepted' },
    { $addToSet: { completedBy: me._id } },
    { new: true }
  );
  if (!updated) throw raceConflict();

  const otherId = refId(updated.sender) === String(me._id) ? updated.receiver : updated.sender;
  const bothDone = [updated.sender, updated.receiver].every((p) => updated.completedBy.some((c) => String(c) === String(p)));

  if (bothDone) {
    updated = (await ExchangeRequest.findOneAndUpdate(
      { _id: request._id, status: 'accepted' },
      { $set: { status: 'completed', isActive: false } },
      { new: true }
    )) || updated;
    await Promise.all(
      [updated.sender, updated.receiver].map((recipient) =>
        notify({
          recipient,
          type: 'request_completed',
          message: `Your exchange of ${updated.offeredSkill} and ${updated.requestedSkill} is completed. Great job!`,
          relatedRequest: updated._id,
        })
      )
    );
    return respond(res, updated, me._id, 'Exchange completed');
  }

  await notify({
    recipient: otherId,
    type: 'completion_requested',
    message: `${me.name} marked your exchange as completed. Confirm it to finish.`,
    relatedRequest: updated._id,
  });
  return respond(res, updated, me._id, 'Marked as completed. Waiting for the other person to confirm.');
});
