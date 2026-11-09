const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { serializeNotification } = require('../utils/serializers');
const { buildPagination } = require('../utils/helpers');

exports.listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.validated.query;
  const me = req.user._id;
  const filter = { recipient: me };
  if (unread === 'true') filter.read = false;

  const [total, docs, unreadCount] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments({ recipient: me, read: false }),
  ]);
  sendSuccess(res, { items: docs.map(serializeNotification), pagination: buildPagination(page, limit, total), unreadCount });
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);
  if (!notification) throw new ApiError(404, 'Notification not found');
  if (String(notification.recipient) !== String(req.user._id)) throw new ApiError(403, 'This notification does not belong to you');
  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  sendSuccess(res, { notification: serializeNotification(notification), unreadCount }, 'Notification marked as read');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  sendSuccess(res, { updated: result.modifiedCount, unreadCount: 0 }, 'All notifications marked as read');
});
