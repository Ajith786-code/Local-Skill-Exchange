const mongoose = require('mongoose');
const { REQUEST_STATUSES } = require('../utils/constants');

const { ObjectId } = mongoose.Schema.Types;

const exchangeRequestSchema = new mongoose.Schema(
  {
    sender: { type: ObjectId, ref: 'User', required: true },
    receiver: { type: ObjectId, ref: 'User', required: true },
    offeredSkill: { type: String, required: true, trim: true, maxlength: 50 },
    offeredSkillNormalized: { type: String, required: true, lowercase: true },
    requestedSkill: { type: String, required: true, trim: true, maxlength: 50 },
    requestedSkillNormalized: { type: String, required: true, lowercase: true },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending' },
    // true while the request is pending or accepted. Used by the unique index below.
    isActive: { type: Boolean, default: true },
    completedBy: { type: [{ type: ObjectId, ref: 'User' }], default: [] },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

exchangeRequestSchema.index({ sender: 1, status: 1, createdAt: -1 });
exchangeRequestSchema.index({ receiver: 1, status: 1, createdAt: -1 });
// Database-level protection against duplicate active requests for the same exchange.
exchangeRequestSchema.index(
  { sender: 1, receiver: 1, offeredSkillNormalized: 1, requestedSkillNormalized: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
