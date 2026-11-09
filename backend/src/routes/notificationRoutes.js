const router = require('express').Router();
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { notificationListQuerySchema } = require('../validators/schemas');

router.use(protect);
router.get('/', validate(notificationListQuerySchema, 'query'), listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:notificationId/read', validateObjectId('notificationId'), markRead);

module.exports = router;
