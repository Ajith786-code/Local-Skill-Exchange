const Notification = require('../models/Notification');
const { getIO } = require('../sockets/io');
const { serializeNotification } = require('../utils/serializers');

// Persists a notification and pushes it live to the recipient if they are online.
async function notify({ recipient, type, message, relatedRequest }) {
  const doc = await Notification.create({ recipient, type, message, relatedRequest });
  const io = getIO();
  if (io) io.to(`user:${recipient}`).emit('notification:new', serializeNotification(doc));
  return doc;
}

module.exports = { notify };
