const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { publicUser } = require('../utils/serializers');
const { getMutualMatches, computeOverlap } = require('../services/matchingService');

exports.listMatches = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const result = await getMutualMatches(req.user, { page, limit });
  sendSuccess(res, result);
});

// How well I match one specific user (works for one-sided matches too).
exports.matchWithUser = asyncHandler(async (req, res) => {
  const other = await User.findById(req.params.userId).select('-email');
  if (!other) throw new ApiError(404, 'User not found');
  const overlap = computeOverlap(req.user, other);
  sendSuccess(res, {
    user: publicUser(other),
    theyCanTeachYou: overlap.theyCanTeachYou,
    youCanTeachThem: overlap.youCanTeachThem,
    isMutual: overlap.isMutual,
  });
});
