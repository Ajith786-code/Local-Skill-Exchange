const router = require('express').Router();
const { register, login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { registerSchema, loginSchema } = require('../validators/schemas');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
