import { generateState, generateCodeVerifier } from "arctic";
import * as authService from "./auth.service.js";
import { googleProvider, githubProvider, getGoogleUser, getGitHubUser } from "./oauth.service.js";
import config from "../../config/env.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";
import createError from "../../utils/ApiError.js";

/**
 * Register User
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendCreated(res, req, {
    message: "Registration successful. OTP sent to your email.",
    data: result,
  });
});

/**
 * Verify OTP (Signup)
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtpOnSignup(req.body);
  
  // Set refresh token in HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(res, req, {
    message: "Account verified successfully.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Login User
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  // Set refresh token in HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(res, req, {
    message: "Logged in successfully.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Logout (Clear Cookie)
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
  });
  sendSuccess(res, req, { message: "Logged out successfully." });
});

/**
 * Resend OTP
 */
export const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);
  sendSuccess(res, req, {
    message: result.message,
    data: result,
  });
});

/**
 * ─── GOOGLE OAUTH ──────────────────────────────────────────
 */

export const googleLogin = asyncHandler(async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  const url = await googleProvider.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10 * 1000, // 10 min
  });

  res.cookie("google_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10 * 1000, // 10 min
  });

  res.redirect(url.toString());
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies.google_oauth_state;
  const codeVerifier = req.cookies.google_oauth_code_verifier;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    throw createError("BAD_REQUEST", "Invalid OAuth state or missing code/verifier");
  }

  const tokens = await googleProvider.validateAuthorizationCode(code, codeVerifier);
  const googleUser = await getGoogleUser(tokens.accessToken());

  // Clear OAuth cookies
  res.clearCookie("google_oauth_state", { path: "/" });
  res.clearCookie("google_oauth_code_verifier", { path: "/" });

  const result = await authService.loginOrRegisterOAuth({
    email: googleUser.email,
    provider: "google",
    providerUid: googleUser.sub,
    name: googleUser.name,
    avatarUrl: googleUser.picture,
  });

  // Set access token in HttpOnly cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 1 * 60 * 60 * 1000, 
  });

  // Set refresh token cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Redirect to frontend without token in URL
  res.redirect(`${config.cors.origin}/feed`);
});

/**
 * ─── GITHUB OAUTH ──────────────────────────────────────────
 */

export const githubLogin = asyncHandler(async (req, res) => {
  const state = generateState();
  const url = await githubProvider.createAuthorizationURL(state, ["user:email"]);

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10 * 1000,
  });

  res.redirect(url.toString());
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies.github_oauth_state;

  if (!code || !state || !storedState || state !== storedState) {
    throw createError("BAD_REQUEST", "Invalid OAuth state or missing code/cookie");
  }

  const tokens = await githubProvider.validateAuthorizationCode(code);
  const githubUser = await getGitHubUser(tokens.accessToken());

  // Clear OAuth cookies
  res.clearCookie("github_oauth_state", { path: "/" });

  const result = await authService.loginOrRegisterOAuth({
    email: githubUser.email,
    provider: "github",
    providerUid: githubUser.id.toString(),
    name: githubUser.name || githubUser.login,
    avatarUrl: githubUser.avatar_url,
  });

  // Set access token in HttpOnly cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Redirect to frontend without token in URL
  res.redirect(`${config.cors.origin}/feed`);
});

/**
 * ─── REFRESH & ME ──────────────────────────────────────────
 */

export const refreshTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await authService.refreshTokens(refreshToken);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: config.server.isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, req, {
    message: "Token refreshed successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

import * as profileService from "../profile/profile.service.js";

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) throw createError("UNAUTHORIZED", "User not found");

  const profile = await profileService.getProfile(req.user.id);

  sendSuccess(res, req, {
    message: "Current user profile fetched",
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        status: req.user.status,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      }
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, req, {
    message: result.message,
    data: null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, req, {
    message: result.message,
    data: null,
  });
});
