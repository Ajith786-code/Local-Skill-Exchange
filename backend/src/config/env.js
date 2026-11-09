const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`\n[config] Missing required environment variable(s): ${missing.join(', ')}`);
  console.error('[config] Run "npm run env" in the project root (or copy backend/.env.example to backend/.env).\n');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 16) {
  console.error('\n[config] JWT_SECRET is too short. Use at least 32 random characters.\n');
  process.exit(1);
}

const sameSite = (process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax')).toLowerCase();
const secure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd;

module.exports = {
  nodeEnv,
  isProd,
  isTest,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
  cookie: { sameSite, secure: secure || sameSite === 'none' },
};
