import { ERROR_CODES } from "./errorCodes.js";

/**
 * Creates a typed error that carries errorCode + statusCode.
 * Use this in services to throw meaningful errors.
 *
 * @example
 *   throw createError("EMAIL_ALREADY_IN_USE");
 *   throw createError("NOT_FOUND", "Product not found");
 */
const createError = (errorCode = "INTERNAL_SERVER_ERROR", overrideMessage = null) => {
  const resolved = ERROR_CODES[errorCode] ?? ERROR_CODES.INTERNAL_SERVER_ERROR;

  const err = new Error(overrideMessage ?? resolved.message);
  err.errorCode = errorCode;
  err.statusCode = resolved.statusCode;
  err.isOperational = true; // distinguishes known errors from unexpected crashes

  return err;
};

export default createError;
