// Runs before every test file. Forces an isolated test database and test-only secrets.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_that_is_long_enough_for_jwt_signing_123456';
process.env.MONGODB_URI =
  process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/local_skill_exchange_test';
process.env.FRONTEND_URL = 'http://localhost:5173';
