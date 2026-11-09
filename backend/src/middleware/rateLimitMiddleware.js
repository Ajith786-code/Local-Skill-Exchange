const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => config.isTest,
    handler: (req, res) => res.status(429).json({ success: false, message, errors: [] }),
  });

// General limit for the whole API.
const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests. Please slow down and try again later.');
// Strict limit for login / registration (brute-force protection).
const authLimiter = make(15 * 60 * 1000, 30, 'Too many login attempts. Please try again in a few minutes.');
// Limit for actions that create data (requests, messages).
const writeLimiter = make(60 * 1000, 40, 'You are doing that too quickly. Please wait a moment.');

module.exports = { apiLimiter, authLimiter, writeLimiter };
