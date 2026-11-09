const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');
const { cleanDisplayName, normalizeSkillName } = require('../utils/helpers');

// Finds the catalog entry for a skill or creates it. Handles the race where two users add the
// same new skill at once (unique index on `normalized`).
async function findOrCreateCatalogSkill({ name, category, userId }) {
  const normalized = normalizeSkillName(name);
  let skill = await Skill.findOne({ normalized });
  if (skill) return skill;
  try {
    skill = await Skill.create({ normalized, name: cleanDisplayName(name), category: category || 'Other', createdBy: userId });
  } catch (err) {
    if (err.code !== 11000) throw err;
    skill = await Skill.findOne({ normalized });
  }
  return skill;
}

// Turns raw input skills into the stored representation:
// trims whitespace, rejects case-insensitive duplicates and keeps names consistent with the catalog.
async function prepareSkillList(list, userId, label) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const normalized = normalizeSkillName(item.name);
    if (!normalized) continue;
    if (seen.has(normalized)) {
      throw new ApiError(422, `"${cleanDisplayName(item.name)}" is already in your ${label} skills`);
    }
    seen.add(normalized);
    const catalog = await findOrCreateCatalogSkill({ name: item.name, category: item.category, userId });
    result.push({
      name: catalog.name,
      normalized,
      category: item.category || catalog.category,
      level: item.level || 'beginner',
    });
  }
  return result;
}

module.exports = { findOrCreateCatalogSkill, prepareSkillList };
