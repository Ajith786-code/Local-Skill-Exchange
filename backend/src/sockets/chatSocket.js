const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { COOKIE_NAME } = require('../utils/constants');
const { setIO } = require('./io');
const { getAccessibleRequest, sendMessage } = require('../services/chatService');

const SEND_WINDOW_MS = 10 * 1000;
const SEND_MAX = 20;

function errorReply(err) {
  if (err && err.isOperational) return { ok: false, message: err.message };
  console.error('[socket] unexpected error:', err && err.message);
  return { ok: false, message: 'Something went wrong. Please try again.' };
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.frontendUrls, credentials: true },
  });
  setIO(io);

  // Every connection must carry a valid JWT cookie.
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies[COOKIE_NAME];
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(payload.sub).select('_id name');
      if (!user) return next(new Error('Authentication required'));
      socket.data.userId = String(user._id);
      socket.data.name = user.name;
      return next();
    } catch (err) {
      return next(new Error(err.name === 'TokenExpiredError' ? 'Session expired' : 'Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    let sentTimes = [];

    socket.on('chat:join', async (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      try {
        const requestId = payload && typeof payload.requestId === 'string' ? payload.requestId : '';
        const request = await getAccessibleRequest(requestId, userId);
        socket.join(`request:${request._id}`);
        reply({ ok: true, status: request.status });
      } catch (err) {
        reply(errorReply(err));
      }
    });

    socket.on('chat:leave', (payload) => {
      if (payload && typeof payload.requestId === 'string') socket.leave(`request:${payload.requestId}`);
    });

    socket.on('chat:send', async (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      try {
        const now = Date.now();
        sentTimes = sentTimes.filter((t) => now - t < SEND_WINDOW_MS);
        if (sentTimes.length >= SEND_MAX) return reply({ ok: false, message: 'You are sending messages too quickly.' });
        sentTimes.push(now);

        const requestId = payload && typeof payload.requestId === 'string' ? payload.requestId : '';
        const text = payload && typeof payload.text === 'string' ? payload.text : '';
        const message = await sendMessage({ requestId, userId, text });
        return reply({ ok: true, message });
      } catch (err) {
        return reply(errorReply(err));
      }
    });
  });

  return io;
}

module.exports = { initSocket };
