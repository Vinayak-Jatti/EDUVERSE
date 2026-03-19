import { validationResult } from "express-validator";
import createError from "../utils/ApiError.js";

/**
 * Middleware that catches validation errors from express-validator
 * and throws an operational VALIDATION_ERROR.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract first error message or detailed breakdown
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    const err = createError("VALIDATION_ERROR");
    err.errors = errorDetails; // Attached for the error middleware to pick up
    return next(err);
  }
  next();
};

export default validate;
