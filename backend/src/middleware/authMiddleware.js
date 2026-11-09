const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../utils/constants');
const { clearSession } = require('../utils/session');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ''));
  const bufB = Buffer.from(String(b || ''));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// Requires a valid JWT cookie. For state-changing requests it also verifies the CSRF header.
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Authentication required. Please log in.');

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    clearSession(res);
    throw new ApiError(
      401,
      err.name === 'TokenExpiredError' ? 'Your session has expired. Please log in again.' : 'Invalid authentication token. Please log in again.'
    );
  }

  if (!SAFE_METHODS.includes(req.method) && !safeEqual(req.get('x-csrf-token'), payload.csrf)) {
    throw new ApiError(403, 'Invalid or missing CSRF token. Please refresh the page and try again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    clearSession(res);
    throw new ApiError(401, 'Account no longer exists. Please register again.');
  }

  req.user = user;
  req.auth = { csrf: payload.csrf };
  return next();
});

// Only lets the account owner continue (used for /users/:userId write routes).
const ownerOnly = (req, res, next) => {
  if (String(req.params.userId) !== String(req.user._id)) {
    return next(new ApiError(403, 'You can only modify your own account.'));
  }
  return next();
};

module.exports = { protect, ownerOnly };
