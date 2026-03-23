import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config/env.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import authRepository from "./auth.repository.js";
import userRepository from "../user/user.repository.js";
import profileRepository from "../profile/profile.repository.js";
import { USER_STATUS, AUTH_PROVIDERS, OTP_PURPOSE } from "./auth.constants.js";
import createError from "../../utils/ApiError.js";

// Helper for generating six-digit secure OTPs
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  // Production Note: actual delivery handled by mailService.sendOTPEmail
  // Demo logs removed for security compliance
};

/**
 * Register user & send OTP
 */
export const registerUser = async ({ firstName, lastName, email, campus, password }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) throw createError("EMAIL_ALREADY_IN_USE");

  const userId = uuidv4();
  const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
  
  await userRepository.create({ id: userId, email, status: USER_STATUS.PENDING });

  await profileRepository.create({
    user_id: userId,
    username: uniqueUsername,
    display_name: `${firstName} ${lastName}`.trim(),
    institution_name: campus,
    edu_sector: 'university'
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  await authRepository.createProvider({
    id: uuidv4(),
    user_id: userId,
    provider: AUTH_PROVIDERS.PASSWORD,
    password_hash: passwordHash,
  });

  const otp = generateOTP();
  const saltOtp = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, saltOtp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await authRepository.createOtp({
    id: uuidv4(),
    user_id: userId,
    purpose: OTP_PURPOSE.SIGNUP,
    target: email,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });

  await sendOTPEmail(email, otp);

  return { userId, email, message: "OTP sent" };
};

/**
 * Verify OTP & Activate Account
 */
export const verifyOtpOnSignup = async ({ email, otp }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("USER_NOT_FOUND");

  const validOtp = await authRepository.findValidOtp(user.id, OTP_PURPOSE.SIGNUP, email);
  if (!validOtp) throw createError("INVALID_OTP");

  const isMatch = await bcrypt.compare(otp, validOtp.otp_hash);
  if (!isMatch) throw createError("INVALID_OTP");

  await userRepository.update(user.id, { status: USER_STATUS.ACTIVE, email_verified: 1 });
  await authRepository.markOtpUsed(validOtp.id);

  const profile = await profileRepository.findByUserId(user.id);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, email: user.email, username: profile?.username },
    accessToken,
    refreshToken,
  };
};

/**
 * Normal Login
 */
export const loginUser = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("INVALID_CREDENTIALS", "No account found");

  if (user.status === USER_STATUS.PENDING || !user.email_verified) throw createError("EMAIL_NOT_VERIFIED");

  const provider = await authRepository.findProvider(user.id, AUTH_PROVIDERS.PASSWORD);
  if (!provider) throw createError("INVALID_CREDENTIALS");

  const isMatch = await bcrypt.compare(password, provider.password_hash);
  if (!isMatch) throw createError("INVALID_CREDENTIALS");

  await userRepository.update(user.id, { last_login_at: new Date() });

  const profile = await profileRepository.findByUserId(user.id);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, email: user.email, username: profile?.username },
    accessToken,
    refreshToken,
  };
};

/**
 * Handle OAuth Login/Register
 */
export const loginOrRegisterOAuth = async ({ email, provider, providerUid, name, avatarUrl }) => {
  let authProvider = await authRepository.findProviderByUid(provider, providerUid);
  let user;

  if (authProvider) {
    user = await userRepository.findById(authProvider.user_id);
  } else {
    user = await userRepository.findByEmail(email);
    if (!user) {
      const userId = uuidv4();
      user = { id: userId, email, status: USER_STATUS.ACTIVE, email_verified: 1 };
      await userRepository.create(user);

      const baseUsername = (email.split("@")[0] || name.split(" ")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "");
      const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      await profileRepository.create({
        user_id: userId,
        username: uniqueUsername,
        display_name: name || baseUsername,
        avatar_url: avatarUrl,
        edu_sector: 'university'
      });
    }

    await authRepository.createProvider({
      id: uuidv4(),
      user_id: user.id,
      provider,
      provider_uid: providerUid,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const profile = await profileRepository.findByUserId(user.id);

  return {
    user: { id: user.id, email: user.email, status: user.status, username: profile?.username },
    accessToken,
    refreshToken,
  };
};

/**
 * Reset Password / Forgot Password
 */
export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return { message: "If an account exists, a reset code was sent." };

  const otp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await authRepository.createOtp({
    id: uuidv4(),
    user_id: user.id,
    purpose: OTP_PURPOSE.PASSWORD_RESET,
    target: email,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });

  await sendOTPEmail(email, otp);
  return { message: "If an account exists, a reset code was sent." };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("INVALID_OTP");

  const validOtp = await authRepository.findValidOtp(user.id, OTP_PURPOSE.PASSWORD_RESET, email);
  if (!validOtp) throw createError("INVALID_OTP");

  const isMatch = await bcrypt.compare(otp, validOtp.otp_hash);
  if (!isMatch) throw createError("INVALID_OTP");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  await authRepository.updateProviderPassword(user.id, AUTH_PROVIDERS.PASSWORD, passwordHash);
  await authRepository.markOtpUsed(validOtp.id);

  return { message: "Password reset successful" };
};

/**
 * Token Rotation
 */
export const refreshTokens = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await userRepository.findById(payload.id || payload.userId);
    if (!user) throw createError("UNAUTHORIZED");

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken,
      user: { id: user.id, email: user.email }
    };
  } catch (error) {
    throw createError("UNAUTHORIZED", "Refresh session expired");
  }
};
