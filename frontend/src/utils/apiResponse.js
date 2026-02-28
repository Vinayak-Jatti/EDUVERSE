import { ERROR_CODES } from "./errorCodes.js";
import config from "../config/config.js";

// ─── Core builder ─────────────────────────────────────────────────────────────
const buildResponse = ({
  req,
  statusCode = 200,
  success = true,
  message = "Success",
  data = null,
  errors = null,
  errorCode = null,
  meta = null,
}) => ({
  success,
  statusCode,
  message,
  ...(errorCode && { errorCode }),
  ...(data !== null && { data }),
  // Hide internal error details in production
  ...(errors && !config.server.isProduction && { errors }),
  ...(meta && { meta }),
  timestamp: new Date().toISOString(),
  path: req?.originalUrl ?? null,
  method: req?.method ?? null,
  // Only include requestId if request-id middleware is wired up
  ...(req?.id && { requestId: req.id }),
});

// ─── Success Responses ────────────────────────────────────────────────────────
export const sendSuccess = (res, req, { message = "Success", data = null, statusCode = 200, meta = null } = {}) =>
  res.status(statusCode).json(buildResponse({ req, statusCode, success: true, message, data, meta }));

export const sendCreated = (res, req, { message = "Created successfully", data = null } = {}) =>
  res.status(201).json(buildResponse({ req, statusCode: 201, success: true, message, data }));

export const sendNoContent = (res) => res.status(204).send();

// ─── Error Response ───────────────────────────────────────────────────────────
// Auto-resolves statusCode + message from errorCode — never pass statusCode manually
export const sendError = (res, req, { errorCode = "INTERNAL_SERVER_ERROR", message = null, errors = null } = {}) => {
  const resolved = ERROR_CODES[errorCode] ?? ERROR_CODES.INTERNAL_SERVER_ERROR;
  const statusCode = resolved.statusCode;
  const finalMessage = message ?? resolved.message;

  return res.status(statusCode).json(
    buildResponse({ req, statusCode, success: false, message: finalMessage, errors, errorCode })
  );
};
