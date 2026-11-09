const ExchangeRequest = require('../models/ExchangeRequest');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { userSummary, serializeMessage } = require('../utils/serializers');
const { listMessages, sendMessage } = require('../services/chatService');

exports.getMessages = asyncHandler(async (req, res) => {
  const { before, limit } = req.validated.query;
  const result = await listMessages({ requestId: req.params.requestId, userId: req.user._id, before, limit });
  sendSuccess(res, result);
});

exports.postMessage = asyncHandler(async (req, res) => {
  const message = await sendMessage({ requestId: req.params.requestId, userId: req.user._id, text: req.validated.body.text });
  sendSuccess(res, { message }, 'Message sent', 201);
});

// Conversation list: every accepted/completed exchange the user takes part in.
exports.listConversations = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const requests = await ExchangeRequest.find({
    status: { $in: ['accepted', 'completed'] },
    $or: [{ sender: me }, { receiver: me }],
  })
    .sort({ updatedAt: -1 })
    .limit(100)
    .populate('sender receiver', 'name city avatar');

  const ids = requests.map((r) => r._id);
  const lastMessages = await Message.aggregate([
    { $match: { request: { $in: ids } } },
    { $sort: { _id: -1 } },
    { $group: { _id: '$request', last: { $first: '$$ROOT' } } },
  ]);
  const lastByRequest = new Map(lastMessages.map((m) => [String(m._id), m.last]));

  const items = requests
    .map((r) => {
      const partner = String(r.sender._id) === String(me) ? r.receiver : r.sender;
      const last = lastByRequest.get(String(r._id));
      return {
        requestId: String(r._id),
        status: r.status,
        partner: userSummary(partner),
        offeredSkill: r.offeredSkill,
        requestedSkill: r.requestedSkill,
        lastMessage: last ? serializeMessage({ ...last, sender: String(last.sender) }) : null,
        sortTime: last ? new Date(last.createdAt).getTime() : new Date(r.updatedAt).getTime(),
      };
    })
    .sort((a, b) => b.sortTime - a.sortTime)
    .map(({ sortTime, ...rest }) => rest);

  sendSuccess(res, { items });
});
