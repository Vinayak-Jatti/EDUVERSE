import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import { registerValidation, loginValidation, otpValidation, forgotPasswordValidation, resetPasswordValidation } from "./auth.validation.js";
import validate from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Initialize registration & send OTP
 * @access  Public
 */
router.post(
  "/register", 
  authLimiter, 
  registerValidation, 
  validate, 
  authController.register
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify 6-digit OTP & activate account
 * @access  Public
 */
router.post(
  "/verify-otp", 
  authLimiter, 
  otpValidation, 
  validate, 
  authController.verifyOtp
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & issue tokens
 * @access  Public
 */
router.post(
  "/login", 
  authLimiter, 
  loginValidation, 
  validate, 
  authController.login
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend a new OTP to the user's email
 * @access  Public
 */
router.post(
  "/resend-otp",
  authLimiter,
  validate,
  authController.resendOtp
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset OTP
 * @access  Public
 */
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

/**
 * ─── OAuth Routes ──────────────────────────────────────────
 */

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

router.get("/github", authController.githubLogin);
router.get("/github/callback", authController.githubCallback);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear authentication state
 * @access  Public
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", authController.refreshTokens);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current session user
 * @access  Private
 */
router.get("/me", protect, authController.getMe);

export default router;
