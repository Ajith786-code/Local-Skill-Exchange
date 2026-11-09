const mongoose = require('mongoose');
const ExchangeRequest = require('../models/ExchangeRequest');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { messageTextSchema } = require('../validators/schemas');
const { serializeMessage } = require('../utils/serializers');
const { otherParticipant } = require('../utils/helpers');
const { getIO } = require('../sockets/io');
const { notify } = require('./notificationService');

// Loads an exchange request and makes sure `userId` may use its chat.
// Reading history: accepted or completed exchanges. Sending: accepted exchanges only.
async function getAccessibleRequest(requestId, userId, { forSending = false } = {}) {
  if (!/^[a-f\d]{24}$/i.test(String(requestId || ''))) throw new ApiError(400, 'Invalid request id');
  const request = await ExchangeRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Exchange request not found');

  const isParticipant = [request.sender, request.receiver].some((p) => String(p) === String(userId));
  if (!isParticipant) throw new ApiError(403, 'You do not have access to this conversation');

  const allowed = forSending ? ['accepted'] : ['accepted', 'completed'];
  if (!allowed.includes(request.status)) {
    throw new ApiError(
      403,
      forSending && request.status === 'completed'
        ? 'This exchange is completed, so the chat is read-only'
        : 'Chat is only available for accepted exchanges'
    );
  }
  return request;
}

async function sendMessage({ requestId, userId, text }) {
  const request = await getAccessibleRequest(requestId, userId, { forSending: true });

  const parsed = messageTextSchema.safeParse({ text });
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({ field: 'text', message: i.message }));
    throw new ApiError(422, errors[0].message, errors);
  }

  const message = await Message.create({ request: request._id, sender: userId, text: parsed.data.text });
  await message.populate('sender', 'name city avatar');
  const payload = serializeMessage(message);

  const recipientId = otherParticipant(request, userId);
  const io = getIO();
  let recipientIsViewing = false;
  if (io) {
    const room = `request:${request._id}`;
    io.to(room).emit('message:new', payload);
    const sockets = await io.in(room).fetchSockets();
    recipientIsViewing = sockets.some((s) => s.data.userId === recipientId);
  }

  if (!recipientIsViewing) {
    // Keep one unread "new message" notification per conversation instead of spamming.
    await Notification.deleteMany({ recipient: recipientId, type: 'new_message', relatedRequest: request._id, read: false });
    await notify({
      recipient: recipientId,
      type: 'new_message',
      message: `New message from ${payload.sender.name || 'your exchange partner'}`,
      relatedRequest: request._id,
    });
  }
  return payload;
}

async function listMessages({ requestId, userId, before, limit }) {
  const request = await getAccessibleRequest(requestId, userId);
  const filter = { request: request._id };
  if (before) filter._id = { $lt: new mongoose.Types.ObjectId(before) };
  const docs = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate('sender', 'name city avatar');
  const hasMore = docs.length > limit;
  const items = docs.slice(0, limit).reverse().map(serializeMessage);
  return { items, hasMore };
}

module.exports = { getAccessibleRequest, sendMessage, listMessages };
