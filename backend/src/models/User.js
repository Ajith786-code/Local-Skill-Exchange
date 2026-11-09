const mongoose = require('mongoose');
const { CATEGORIES, LEVELS, LEARNING_MODES } = require('../utils/constants');

const skillEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    normalized: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    level: { type: String, enum: LEVELS, default: 'beginner' },
  },
  { _id: false }
);

const maxTwenty = [(list) => list.length <= 20, 'You can list at most 20 skills in each list'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    city: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    cityNormalized: { type: String, index: true },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    avatar: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
      validate: [(v) => !v || /^https?:\/\//i.test(v), 'Avatar must be an http(s) image URL'],
    },
    offeredSkills: { type: [skillEntrySchema], default: [], validate: maxTwenty },
    wantedSkills: { type: [skillEntrySchema], default: [], validate: maxTwenty },
    learningMode: { type: String, enum: LEARNING_MODES, default: 'either' },
    availability: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true }
);

userSchema.index({ 'offeredSkills.normalized': 1 });
userSchema.index({ 'wantedSkills.normalized': 1 });
userSchema.index({ name: 1 });
userSchema.index({ updatedAt: -1 });

userSchema.pre('validate', function setCityNormalized(next) {
  if (this.city) this.cityNormalized = this.city.trim().toLowerCase();
  next();
});

module.exports = mongoose.model('User', userSchema);
