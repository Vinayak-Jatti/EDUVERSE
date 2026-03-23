export const ERROR_CODES = Object.freeze({
  // ─── Auth ─────────────────────────────────────
  INVALID_CREDENTIALS:   { statusCode: 401, message: "Invalid email or password" },
  UNAUTHORIZED:          { statusCode: 401, message: "Unauthorized" },
  TOKEN_INVALID:         { statusCode: 401, message: "Invalid token" },
  TOKEN_EXPIRED:         { statusCode: 401, message: "Token has expired" },
  REFRESH_TOKEN_INVALID: { statusCode: 401, message: "Invalid or expired refresh token" },
  EMAIL_NOT_VERIFIED:    { statusCode: 403, message: "Email not verified. Please check your inbox for the OTP." },
  INVALID_OTP:           { statusCode: 400, message: "Invalid OTP code" },
  OTP_EXPIRED:           { statusCode: 400, message: "OTP has expired" },
  FORBIDDEN:             { statusCode: 403, message: "Forbidden: insufficient permissions" },

  // ─── Resource ─────────────────────────────────
  NOT_FOUND:             { statusCode: 404, message: "Resource not found" },
  USER_NOT_FOUND:        { statusCode: 404, message: "User not found" },
  EMAIL_ALREADY_IN_USE:  { statusCode: 409, message: "Email already in use" },
  ALREADY_EXISTS:        { statusCode: 409, message: "Resource already exists" },
  CONFLICT:              { statusCode: 409, message: "Conflict: resource already exists or cannot be modified" },
  CONNECTION_ALREADY_EXISTS: { statusCode: 409, message: "Connection already exists" },
  CONNECTION_PENDING:     { statusCode: 400, message: "A connection request is already pending" },

  // ─── Validation ───────────────────────────────
  VALIDATION_ERROR:      { statusCode: 422, message: "Validation failed" },
  INVALID_INPUT:         { statusCode: 400, message: "Invalid input" },
  BAD_REQUEST:           { statusCode: 400, message: "Bad request" },
  MISSING_FIELDS:        { statusCode: 400, message: "Required fields are missing" },

  // ─── Auth (additional) ────────────────────────
  EMAIL_ALREADY_VERIFIED: { statusCode: 400, message: "Email is already verified" },

  // ─── Server ───────────────────────────────────
  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Internal server error" },
  DATABASE_ERROR:        { statusCode: 500, message: "Database operation failed" },
  SERVICE_UNAVAILABLE:   { statusCode: 503, message: "Service temporarily unavailable" },
});
