const router = require('express').Router();
const ctrl = require('../controllers/exchangeRequestController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { writeLimiter } = require('../middleware/rateLimitMiddleware');
const { createRequestSchema, listRequestsQuerySchema } = require('../validators/schemas');

router.use(protect);
router.post('/', writeLimiter, validate(createRequestSchema), ctrl.createRequest);
router.get('/', validate(listRequestsQuerySchema, 'query'), ctrl.listRequests);
router.get('/:requestId', validateObjectId('requestId'), ctrl.getRequest);
router.patch('/:requestId/accept', validateObjectId('requestId'), ctrl.acceptRequest);
router.patch('/:requestId/reject', validateObjectId('requestId'), ctrl.rejectRequest);
router.patch('/:requestId/cancel', validateObjectId('requestId'), ctrl.cancelRequest);
router.patch('/:requestId/complete', validateObjectId('requestId'), ctrl.completeRequest);

module.exports = router;
