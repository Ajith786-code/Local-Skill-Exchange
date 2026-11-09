const router = require('express').Router();
const { listMatches, matchWithUser } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { paginationQuerySchema } = require('../validators/schemas');

router.use(protect);
router.get('/', validate(paginationQuerySchema, 'query'), listMatches);
router.get('/:userId', validateObjectId('userId'), matchWithUser);

module.exports = router;
