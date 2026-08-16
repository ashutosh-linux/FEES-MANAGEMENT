/**
 * Global Error Handler Middleware
 *
 * Must be registered LAST in Express (after all routes).
 * Catches both operational errors (thrown in controllers with `next(err)`)
 * and Mongoose / validation errors, returning a consistent JSON shape.
 */
const errorHandler = (err, req, res, _next) => {
  // --- defaults ---
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal Server Error";
  let errors     = null;

  // Mongoose validation error  (e.g. required field missing)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message    = "Validation failed";
    errors     = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key  (unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(", ");
    message     = `Duplicate value for field(s): ${field}`;
  }

  // Mongoose bad ObjectId  (e.g. /students/not-an-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message    = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // JWT errors (ready for auth phase)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Token expired. Please log in again.";
  }

  // --- response ---
  const payload = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
