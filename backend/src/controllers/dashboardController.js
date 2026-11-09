const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { serializeNotification } = require('../utils/serializers');
const { getProfileCompletion } = require('../utils/profile');
const { countMutualMatches, getMutualMatches } = require('../services/matchingService');

// Every number here is calculated from real database data.
exports.getDashboard = asyncHandler(async (req, res) => {
  const me = req.user;
  const [mutualMatches, pendingIncoming, acceptedExchanges, notifications, unreadNotifications, suggested] = await Promise.all([
    countMutualMatches(me),
    ExchangeRequest.countDocuments({ receiver: me._id, status: 'pending' }),
    ExchangeRequest.countDocuments({ status: 'accepted', $or: [{ sender: me._id }, { receiver: me._id }] }),
    Notification.find({ recipient: me._id }).sort({ createdAt: -1 }).limit(5),
    Notification.countDocuments({ recipient: me._id, read: false }),
    getMutualMatches(me, { page: 1, limit: 3 }),
  ]);

  sendSuccess(res, {
    stats: {
      offeredSkills: me.offeredSkills.length,
      wantedSkills: me.wantedSkills.length,
      mutualMatches,
      pendingIncoming,
      acceptedExchanges,
      unreadNotifications,
    },
    profileCompletion: getProfileCompletion(me),
    recentNotifications: notifications.map(serializeNotification),
    suggestedMatches: suggested.items,
  });
});
