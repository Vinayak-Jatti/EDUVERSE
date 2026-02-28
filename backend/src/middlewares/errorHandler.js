import { sendError } from "../utils/apiResponse.js";

/**
 * Global error handler — must be the last middleware in app.js.
 * Catches everything: errors thrown in services, asyncHandler forwards, etc.
 *
 * Operational errors  → thrown via createError(), safe to expose message
 * Unexpected crashes  → log full stack, return generic 500
 */
const errorHandler = (err, req, res, _next) => {
  // Always log the full error server-side
  console.error(`[ERROR] [${req.id ?? "no-id"}] ${err.message}`, {
    errorCode: err.errorCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  // JWT errors — map to our error codes
  if (err.name === "JsonWebTokenError") {
    return sendError(res, req, { errorCode: "TOKEN_INVALID" });
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, req, { errorCode: "TOKEN_EXPIRED" });
  }

  // Operational errors thrown via createError() — safe to expose
  if (err.isOperational) {
    return sendError(res, req, {
      errorCode: err.errorCode,
      message: err.message,
    });
  }

  // Unexpected crash — never expose internals
  return sendError(res, req, { errorCode: "INTERNAL_SERVER_ERROR" });
};

export default errorHandler;
