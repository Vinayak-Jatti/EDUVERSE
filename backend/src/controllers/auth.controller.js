import { validationResult } from "express-validator";
import { registerUser } from "../services/auth.service.js";
import { sendSuccess, sendCreated, sendError, sendNoContent } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, req, { errorCode: "VALIDATION_ERROR", errors: errors.array() });
  }
  const result = await registerUser(req.body);
  return sendCreated(res, req, { message: "Registered successfully", data: result });
});
