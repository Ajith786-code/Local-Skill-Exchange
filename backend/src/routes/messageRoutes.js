const router = require('express').Router();
const { getMessages, postMessage, listConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { writeLimiter } = require('../middleware/rateLimitMiddleware');
const { messageTextSchema, messageHistoryQuerySchema } = require('../validators/schemas');

// Mounted at /api/v1
router.get('/conversations', protect, listConversations);
router.get(
  '/requests/:requestId/messages',
  protect,
  validateObjectId('requestId'),
  validate(messageHistoryQuerySchema, 'query'),
  getMessages
);
router.post('/requests/:requestId/messages', protect, writeLimiter, validateObjectId('requestId'), validate(messageTextSchema), postMessage);

module.exports = router;
