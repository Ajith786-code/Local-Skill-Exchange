const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { privateUser } = require('../utils/serializers');
const { issueSession, clearSession } = require('../utils/session');

const ROUNDS = config.isTest ? 4 : 12;
// Used to keep response time similar when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', ROUNDS);

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, city } = req.validated.body;
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, ROUNDS);
  const user = await User.create({ name, email, passwordHash, city });
  const csrfToken = issueSession(res, user);
  sendSuccess(res, { user: privateUser(user), csrfToken }, 'Registration successful', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) throw new ApiError(401, 'Invalid email or password');

  const csrfToken = issueSession(res, user);
  sendSuccess(res, { user: privateUser(user), csrfToken }, 'Login successful');
});

exports.logout = asyncHandler(async (req, res) => {
  clearSession(res);
  sendSuccess(res, {}, 'Logged out');
});

exports.me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: privateUser(req.user), csrfToken: req.auth.csrf }, 'Current user');
});
