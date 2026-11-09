const mongoose = require('mongoose');
const { MAX_MESSAGE_LENGTH } = require('../utils/constants');

const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    request: { type: ObjectId, ref: 'ExchangeRequest', required: true },
    sender: { type: ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: MAX_MESSAGE_LENGTH },
  },
  { timestamps: true }
);

messageSchema.index({ request: 1, _id: -1 });

module.exports = mongoose.model('Message', messageSchema);
