import { env } from '../config/env.js';

/** 404 for unmatched API routes (JSON, not Express's default HTML page). */
export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.path}`,
  });
}

/**
 * Central error handler.
 * Distinguishes client errors (400/409) from real server faults (500), so
 * malformed ObjectIds no longer surface as 500 Internal Server Errors.
 */
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  const details = {};

  // Mongoose bad ObjectId / bad cast
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for '${err.path}'`;
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    for (const [field, error] of Object.entries(err.errors || {})) {
      details[field] = error.message;
    }
  }

  // Duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `An account with this ${field} already exists`;
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    message,
    ...(Object.keys(details).length > 0 ? { details } : {}),
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}
