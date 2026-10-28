/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

/**
 * 404 Route Not Found middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: `API Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
