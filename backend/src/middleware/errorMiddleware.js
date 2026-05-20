// Central Express error handler. Every controller error ends up here.

const env = require('../config/env');

// 404 for any route that didn't match.
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Generic error -> JSON. Only leaks the stack in development mode.
function errorHandler(err, req, res, next) {
  const status  = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
  };
  if (err.details)            payload.details = err.details;
  if (env.nodeEnv === 'development') payload.stack = err.stack;

  if (status >= 500) {
    console.error('[error]', err);
  }
  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
