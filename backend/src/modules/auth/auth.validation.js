import { body } from "express-validator";

export const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("campus").trim().notEmpty().withMessage("Campus/University is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const otpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];
export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];
