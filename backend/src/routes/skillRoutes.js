const router = require('express').Router();
const { listSkills, createSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateObjectId } = require('../middleware/validationMiddleware');
const { skillListQuerySchema, createSkillSchema } = require('../validators/schemas');

router.use(protect);
router.get('/', validate(skillListQuerySchema, 'query'), listSkills);
router.post('/', validate(createSkillSchema), createSkill);
router.delete('/:skillId', validateObjectId('skillId'), deleteSkill);

module.exports = router;
