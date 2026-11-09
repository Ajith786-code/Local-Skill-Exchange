const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

if (config.isProd) app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || config.frontendUrls.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Request logging: method, path (no query string), status and time. Bodies, cookies and tokens are never logged.
if (!config.isTest) {
  morgan.token('safe-url', (req) => req.originalUrl.split('?')[0]);
  app.use(morgan(':method :safe-url :status :response-time ms'));
}

app.use('/api', apiLimiter);

app.get('/api/v1/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.status(dbState === 'connected' ? 200 : 503).json({
    success: dbState === 'connected',
    message: dbState === 'connected' ? 'OK' : 'Database not connected',
    data: { status: dbState === 'connected' ? 'ok' : 'degraded', database: dbState, uptime: Math.round(process.uptime()) },
  });
});

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/skills', require('./routes/skillRoutes'));
app.use('/api/v1/matches', require('./routes/matchRoutes'));
app.use('/api/v1/requests', require('./routes/exchangeRequestRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1', require('./routes/messageRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
