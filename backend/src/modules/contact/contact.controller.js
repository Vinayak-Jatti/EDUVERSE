import * as contactService from "./contact.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import createError from "../../utils/ApiError.js";

/**
 * Handle new application ingress
 * Capture metadata and binary signal (resume)
 */
export const apply = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, campus } = req.body;
  const file = req.file; // Binary buffer from Multer memoryStorage

  if (!file) {
    throw createError("BAD_REQUEST", "Manual Override Required: No binary curriculum signal detected.");
  }

  // Delegate processing and broadcast to service layer
  const result = await contactService.default.submitApplication(
    { first_name, last_name, email, campus },
    file
  );

  return sendSuccess(res, req, { 
    message: "Application broadcasted successfully to EDUVERSE Career Node.", 
    data: { transaction_id: result.messageId } 
  });
});
