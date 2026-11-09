const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl.split('?')[0]}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || [];

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier provided';
    errors = [];
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    if (errors[0]) message = errors[0].message;
  } else if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyPattern || {})[0];
    message = key === 'email' ? 'An account with this email already exists' : 'This record already exists';
    errors = [];
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
    errors = [];
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
    errors = [];
  } else if (!err.isOperational && !err.statusCode) {
    status = 500;
  }

  if (status >= 500) {
    if (!config.isTest) console.error(`[error] ${req.method} ${req.originalUrl.split('?')[0]} -> ${err.stack || err}`);
    if (config.isProd) {
      message = 'Internal server error';
      errors = [];
    }
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = { notFound, errorHandler };
