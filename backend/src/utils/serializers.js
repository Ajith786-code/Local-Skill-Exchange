const toObj = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);
const idOf = (value) => String(value && value._id ? value._id : value);

const serializeSkills = (list = []) =>
  list.map((s) => ({ name: s.name, normalized: s.normalized, category: s.category, level: s.level }));

// Public profile: never includes email, password hash or any private data.
function publicUser(doc) {
  const o = toObj(doc);
  return {
    id: idOf(o._id),
    name: o.name,
    city: o.city,
    bio: o.bio || '',
    avatar: o.avatar || '',
    offeredSkills: serializeSkills(o.offeredSkills),
    wantedSkills: serializeSkills(o.wantedSkills),
    learningMode: o.learningMode,
    availability: o.availability || '',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

// Only ever returned to the account owner.
function privateUser(doc) {
  const o = toObj(doc);
  return { ...publicUser(o), email: o.email };
}

function userSummary(doc) {
  const o = toObj(doc);
  if (!o || !o.name) return { id: idOf(o) };
  return { id: idOf(o._id), name: o.name, city: o.city, avatar: o.avatar || '' };
}

function serializeRequest(doc, meId) {
  const o = toObj(doc);
  const senderId = idOf(o.sender);
  return {
    id: idOf(o._id),
    sender: userSummary(o.sender),
    receiver: userSummary(o.receiver),
    offeredSkill: o.offeredSkill,
    requestedSkill: o.requestedSkill,
    message: o.message || '',
    status: o.status,
    completedBy: (o.completedBy || []).map(String),
    respondedAt: o.respondedAt || null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    role: meId ? (senderId === String(meId) ? 'sender' : 'receiver') : undefined,
  };
}

function notificationLink(o) {
  if (!o.relatedRequest) return null;
  const rid = String(o.relatedRequest);
  switch (o.type) {
    case 'request_received':
      return '/requests?status=pending';
    case 'request_accepted':
    case 'new_message':
      return `/messages/${rid}`;
    case 'request_rejected':
      return '/requests?status=rejected';
    case 'request_cancelled':
      return '/requests?status=cancelled';
    case 'completion_requested':
      return '/requests?status=accepted';
    case 'request_completed':
      return '/requests?status=completed';
    default:
      return '/requests';
  }
}

function serializeNotification(doc) {
  const o = toObj(doc);
  return {
    id: idOf(o._id),
    type: o.type,
    message: o.message,
    relatedRequest: o.relatedRequest ? String(o.relatedRequest) : null,
    read: o.read,
    link: notificationLink(o),
    createdAt: o.createdAt,
  };
}

function serializeMessage(doc) {
  const o = toObj(doc);
  return {
    id: idOf(o._id),
    request: idOf(o.request),
    sender: userSummary(o.sender),
    text: o.text,
    createdAt: o.createdAt,
  };
}

module.exports = {
  serializeSkills,
  publicUser,
  privateUser,
  userSummary,
  serializeRequest,
  serializeNotification,
  serializeMessage,
};
