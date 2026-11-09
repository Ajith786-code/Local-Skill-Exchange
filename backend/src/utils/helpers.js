const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanDisplayName = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalizeSkillName = (value) => cleanDisplayName(value).toLowerCase();

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const refId = (value) => String(value && value._id ? value._id : value);

// Returns the id (string) of the other person in an exchange request.
const otherParticipant = (request, userId) =>
  refId(request.sender) === String(userId) ? refId(request.receiver) : refId(request.sender);

module.exports = { escapeRegex, cleanDisplayName, normalizeSkillName, buildPagination, refId, otherParticipant };
