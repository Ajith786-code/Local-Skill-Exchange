const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    relatedRequest: { type: ObjectId, ref: 'ExchangeRequest' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ relatedRequest: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
