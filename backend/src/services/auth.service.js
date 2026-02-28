import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import createError from "../utils/createError.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

//write helper functions like stripSensitiveFields, issueTokens, etc. here to keep the main service functions clean and focused

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
  //registerUser function implementation: check if email exists, hash password, create user, issue tokens, etc.

  return { user, ...tokens };
};

// ─── Login ────────────────────────────────────────────────────────────────────

// Implement loginUser function here, following the same pattern as registerUser: validate credentials, issue tokens, etc.

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

// Implement refreshUserTokens function here: verify the refresh token, issue new tokens, etc.

// ─── Logout ───────────────────────────────────────────────────────────────────

// Implement logoutUser function here: invalidate the refresh token, etc.

// ─── Get Profile ──────────────────────────────────────────────────────────────

// Implement getUserProfile function here: fetch user data by ID, etc.
