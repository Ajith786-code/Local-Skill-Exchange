const Skill = require('../models/Skill');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { escapeRegex, normalizeSkillName } = require('../utils/helpers');
const { findOrCreateCatalogSkill } = require('../services/skillService');

const serialize = (s) => ({ id: String(s._id), name: s.name, normalized: s.normalized, category: s.category });

exports.listSkills = asyncHandler(async (req, res) => {
  const { q, category, limit } = req.validated.query;
  const filter = {};
  if (q) filter.normalized = new RegExp(escapeRegex(normalizeSkillName(q)));
  if (category) filter.category = category;
  const skills = await Skill.find(filter).sort({ normalized: 1 }).limit(limit);
  sendSuccess(res, { items: skills.map(serialize) });
});

exports.createSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.validated.body;
  const existing = await Skill.findOne({ normalized: normalizeSkillName(name) });
  if (existing) return sendSuccess(res, { skill: serialize(existing) }, 'Skill already exists');
  const skill = await findOrCreateCatalogSkill({ name, category, userId: req.user._id });
  return sendSuccess(res, { skill: serialize(skill) }, 'Skill created', 201);
});

// Only the creator can delete a catalog skill, and only while nobody uses it.
exports.deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.skillId);
  if (!skill) throw new ApiError(404, 'Skill not found');
  if (!skill.createdBy || String(skill.createdBy) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete skills you created');
  }
  const inUse = await User.exists({
    $or: [{ 'offeredSkills.normalized': skill.normalized }, { 'wantedSkills.normalized': skill.normalized }],
  });
  if (inUse) throw new ApiError(409, 'This skill is still used in profiles and cannot be deleted');
  await skill.deleteOne();
  return sendSuccess(res, {}, 'Skill deleted');
});
