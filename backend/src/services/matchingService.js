const User = require('../models/User');
const { serializeSkills, publicUser } = require('../utils/serializers');
const { buildPagination } = require('../utils/helpers');

const names = (list = []) => list.map((s) => s.normalized);

// Query that finds users who offer something I want AND want something I offer (mutual match).
function mutualQuery(me) {
  const myWanted = names(me.wantedSkills);
  const myOffered = names(me.offeredSkills);
  if (!myWanted.length || !myOffered.length) return null;
  return {
    _id: { $ne: me._id },
    'offeredSkills.normalized': { $in: myWanted },
    'wantedSkills.normalized': { $in: myOffered },
  };
}

// Compares two profiles using real data. Works for mongoose docs and plain objects.
function computeOverlap(me, other) {
  const myWanted = new Set(names(me.wantedSkills));
  const theirWanted = new Set(names(other.wantedSkills));
  const theyCanTeachYou = (other.offeredSkills || []).filter((s) => myWanted.has(s.normalized));
  const youCanTeachThem = (me.offeredSkills || []).filter((s) => theirWanted.has(s.normalized));
  return {
    theyCanTeachYou: serializeSkills(theyCanTeachYou),
    youCanTeachThem: serializeSkills(youCanTeachThem),
    isMutual: theyCanTeachYou.length > 0 && youCanTeachThem.length > 0,
  };
}

async function countMutualMatches(me) {
  const query = mutualQuery(me);
  return query ? User.countDocuments(query) : 0;
}

// Returns mutual matches ordered by how many skills overlap (then most recently updated).
// Candidate lookup is bounded (200) so a huge collection is never loaded into memory.
async function getMutualMatches(me, { page = 1, limit = 10 } = {}) {
  const query = mutualQuery(me);
  if (!query) return { items: [], pagination: buildPagination(page, limit, 0) };

  const candidates = await User.find(query).select('-email').sort({ updatedAt: -1 }).limit(200).lean();
  const scored = candidates
    .map((candidate) => {
      const overlap = computeOverlap(me, candidate);
      return {
        user: publicUser(candidate),
        theyCanTeachYou: overlap.theyCanTeachYou,
        youCanTeachThem: overlap.youCanTeachThem,
        isMutual: overlap.isMutual,
        matchScore: overlap.theyCanTeachYou.length + overlap.youCanTeachThem.length,
        _updated: new Date(candidate.updatedAt).getTime(),
      };
    })
    .filter((m) => m.isMutual)
    .sort((a, b) => b.matchScore - a.matchScore || b._updated - a._updated);

  const start = (page - 1) * limit;
  const items = scored.slice(start, start + limit).map(({ _updated, ...rest }) => rest);
  return { items, pagination: buildPagination(page, limit, scored.length) };
}

module.exports = { mutualQuery, computeOverlap, countMutualMatches, getMutualMatches };
