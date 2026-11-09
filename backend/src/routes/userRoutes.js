const router = require('express').Router();
const { getMe, updateMe, deleteMe, listUsers, getUser } = require('../controllers/userController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { updateProfileSchema, deleteAccountSchema, discoverQuerySchema } = require('../validators/schemas');

router.use(protect);

router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.delete('/me', validate(deleteAccountSchema), deleteMe);

router.get('/', validate(discoverQuerySchema, 'query'), listUsers);

// Writing to another user's profile is always refused.
router.patch('/:userId', validateObjectId('userId'), ownerOnly, validate(updateProfileSchema), updateMe);
router.delete('/:userId', validateObjectId('userId'), ownerOnly, validate(deleteAccountSchema), deleteMe);
router.get('/:userId', validateObjectId('userId'), getUser);

module.exports = router;
