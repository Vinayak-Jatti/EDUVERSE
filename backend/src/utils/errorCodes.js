export const ERROR_CODES = Object.freeze({
  // ─── Auth ─────────────────────────────────────
  INVALID_CREDENTIALS:   { statusCode: 401, message: "Invalid email or password" },
  UNAUTHORIZED:          { statusCode: 401, message: "Unauthorized" },
  TOKEN_INVALID:         { statusCode: 401, message: "Invalid token" },
  TOKEN_EXPIRED:         { statusCode: 401, message: "Token has expired" },
  REFRESH_TOKEN_INVALID: { statusCode: 401, message: "Invalid or expired refresh token" },
  FORBIDDEN:             { statusCode: 403, message: "Forbidden: insufficient permissions" },

  // ─── Resource ─────────────────────────────────
  NOT_FOUND:             { statusCode: 404, message: "Resource not found" },
  USER_NOT_FOUND:        { statusCode: 404, message: "User not found" },
  EMAIL_ALREADY_IN_USE:  { statusCode: 409, message: "Email already in use" },
  ALREADY_EXISTS:        { statusCode: 409, message: "Resource already exists" },

  // ─── Validation ───────────────────────────────
  VALIDATION_ERROR:      { statusCode: 422, message: "Validation failed" },
  INVALID_INPUT:         { statusCode: 400, message: "Invalid input" },
  MISSING_FIELDS:        { statusCode: 400, message: "Required fields are missing" },

  // ─── Server ───────────────────────────────────
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Internal server error" },
  DATABASE_ERROR:        { statusCode: 500, message: "Database operation failed" },
  SERVICE_UNAVAILABLE:   { statusCode: 503, message: "Service temporarily unavailable" },
});
