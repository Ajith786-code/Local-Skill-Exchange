const mongoose = require('mongoose');
const { CATEGORIES } = require('../utils/constants');

const skillSchema = new mongoose.Schema(
  {
    normalized: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    category: { type: String, enum: CATEGORIES, default: 'Other', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
