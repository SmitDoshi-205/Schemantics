/**
 * 404 handler - catches any request that didn't match a route above it.
 */
function notFound(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central error handler - every route/middleware that calls next(err)
 * ends up here. Kept intentionally simple for Day 1; later days may
 * add error-type-specific handling (validation errors, auth errors, etc.)
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'ServerError',
    message: err.message || 'Something went wrong.',
  });
}

module.exports = { notFound, errorHandler };
