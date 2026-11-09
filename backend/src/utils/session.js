const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { COOKIE_NAME } = require('./constants');

const baseOptions = () => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: '/',
});

// Creates a JWT (stored in an HttpOnly cookie). The token also carries a random CSRF value.
// The same value is returned in the JSON body and must be sent back in the X-CSRF-Token header
// for every state-changing request, so other websites cannot forge requests.
function issueSession(res, user) {
  const csrf = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign({ sub: String(user._id), csrf }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  const { exp } = jwt.decode(token);
  res.cookie(COOKIE_NAME, token, { ...baseOptions(), maxAge: Math.max(exp * 1000 - Date.now(), 0) });
  return csrf;
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, baseOptions());
}

module.exports = { issueSession, clearSession };
