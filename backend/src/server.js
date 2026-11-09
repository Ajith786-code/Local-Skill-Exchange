const http = require('http');
const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./sockets/chatSocket');

async function start() {
  try {
    await connectDB();
  } catch (err) {
    process.exit(1);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[server] Port ${config.port} is already in use. Stop the other process or change PORT in backend/.env\n`);
    } else {
      console.error('[server] Server error:', err.message);
    }
    process.exit(1);
  });

  server.listen(config.port, () => {
    console.log(`[server] API running on http://localhost:${config.port}/api/v1 (${config.nodeEnv})`);
    console.log(`[server] Allowed frontend origin(s): ${config.frontendUrls.join(', ')}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(() => mongoose.connection.close(false).finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});

start();
