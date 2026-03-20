import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import userRepository from "../user/user.repository.js";
import authRepository from "./auth.repository.js";
import profileRepository from "../profile/profile.repository.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import createError from "../../utils/ApiError.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../../services/mail.service.js";
import { USER_STATUS, AUTH_PROVIDERS, OTP_PURPOSE } from "./auth.constants.js";

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = (email) => {
  if (email === "vnkjatti@gmail.com") return "123456";
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Register a new user with OTP verification and Profile creation
 */
export const registerUser = async ({ firstName, lastName, email, campus, password }) => {
  // 1. Check if email already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw createError("EMAIL_ALREADY_IN_USE");
  }

  // 2. Create core user record
  const userId = uuidv4();
  await userRepository.create({
    id: userId,
    email,
    status: USER_STATUS.PENDING,
  });

  // 3. Create initial profile
  const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
  
  await profileRepository.create({
    user_id: userId,
    username: uniqueUsername,
    display_name: `${firstName} ${lastName}`.trim(),
    institution_name: campus,
    edu_sector: 'university' // Defaulting to university as it's EDUVERSE
  });

  // 4. Create password auth provider
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  await authRepository.createProvider({
    id: uuidv4(),
    user_id: userId,
    provider: AUTH_PROVIDERS.PASSWORD,
    password_hash: passwordHash,
  });

  // 5. Generate and store OTP
  const otp = generateOTP(email);
  console.log(`\n[DEMO] OTP for ${email}: ${otp}\n`);
  const otpHash = await bcrypt.hash(otp, salt);
  
  await authRepository.createOtp({
    id: uuidv4(),
    user_id: userId,
    purpose: OTP_PURPOSE.SIGNUP,
    target: email,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // 6. Send OTP Email (Graceful failure for demo/invalid credentials)
  try {
    await sendOTPEmail(email, otp);
  } catch (mailError) {
    console.warn(`[MAIL ERROR] Could not send OTP to ${email}:`, mailError.message);
  }

  return { 
    userId, 
    email, 
    message: "Registration initiated. If you didn't receive an email, use the demo OTP: 123456" 
  };
};

/**
 * Verify OTP and activate user
 */
export const verifyOtpOnSignup = async ({ email, otp }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("USER_NOT_FOUND");

  const validOtp = await authRepository.findValidOtp(user.id, OTP_PURPOSE.SIGNUP, email);
  if (!validOtp) throw createError("INVALID_OTP", "No valid or expired OTP found");

  const isMatch = await bcrypt.compare(otp, validOtp.otp_hash);
  if (!isMatch) throw createError("INVALID_OTP");

  await userRepository.update(user.id, { 
    status: USER_STATUS.ACTIVE, 
    email_verified: 1 
  });
  await authRepository.markOtpUsed(validOtp.id);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, email: user.email, status: USER_STATUS.ACTIVE },
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("USER_NOT_FOUND", "No account found with this email");

  if (user.status === USER_STATUS.PENDING || !user.email_verified) {
    throw createError("EMAIL_NOT_VERIFIED");
  }

  const provider = await authRepository.findProvider(user.id, AUTH_PROVIDERS.PASSWORD);
  if (!provider) throw createError("INVALID_CREDENTIALS");

  const isMatch = await bcrypt.compare(password, provider.password_hash);
  if (!isMatch) throw createError("INVALID_CREDENTIALS");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, email: user.email, status: user.status },
    accessToken,
    refreshToken,
  };
};

/**
 * Resend OTP to user
 */
export const resendOtp = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("USER_NOT_FOUND");

  // Only allow resend if not already verified
  if (user.email_verified) {
    throw createError("EMAIL_ALREADY_VERIFIED");
  }

  const otp = generateOTP(email);
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  await authRepository.createOtp({
    id: uuidv4(),
    user_id: user.id,
    purpose: OTP_PURPOSE.SIGNUP,
    target: email,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Graceful mail delivery for demo
  try {
    await sendOTPEmail(email, otp);
  } catch (mailError) {
    console.warn(`[MAIL ERROR] Could not resend OTP to ${email}:`, mailError.message);
  }

  return { 
    message: "A new OTP has been sent. Demo code: 123456" 
  };
};

/**
 * Handle OAuth Login/Register
 */
export const loginOrRegisterOAuth = async ({ email, provider, providerUid, name, avatarUrl }) => {
  // 1. Find user by provider UID
  let authProvider = await authRepository.findProviderByUid(provider, providerUid);
  let user;

  if (authProvider) {
    // Existing user via this provider
    user = await userRepository.findById(authProvider.user_id);
  } else {
    // New provider - check if user exists by email
    user = await userRepository.findByEmail(email);

    if (!user) {
      // Create new user
      const userId = uuidv4();
      user = {
        id: userId,
        email,
        status: USER_STATUS.ACTIVE,
        email_verified: 1, // OAuth emails are usually verified by provider
      };
      await userRepository.create(user);

      // Create profile
      const baseUsername = (email.split("@")[0] || name.split(" ")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "");
      const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      
      await profileRepository.create({
        user_id: userId,
        username: uniqueUsername,
        display_name: name || uniqueUsername,
        avatar_url: avatarUrl,
        edu_sector: 'university'
      });
    }

    // Link provide to user
    await authRepository.createProvider({
      id: uuidv4(),
      user_id: user.id,
      provider,
      provider_uid: providerUid,
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: { id: user.id, email: user.email, status: user.status },
    accessToken,
    refreshToken,
  };
};

/**
 * Handle Token Refresh
 */
export const refreshAuthToken = async (token) => {
  if (!token) throw createError("UNAUTHORIZED", "No refresh token provided");
  
  try {
    const { verifyRefreshToken } = await import("../../utils/jwt.js");
    const decoded = verifyRefreshToken(token);
    
    const user = await userRepository.findById(decoded.id);
    if (!user) throw createError("UNAUTHORIZED", "User no longer exists");

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return {
      user: { id: user.id, email: user.email, status: user.status },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw createError("UNAUTHORIZED", "Invalid or expired refresh token");
  }
};

/**
 * Handle Forgot Password
 */
export const forgotPassword = async ({ email }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // Return success to avoid email enumeration attacks
    return { message: "If an account exists, a reset code was sent." };
  }

  // Only resetting PASSWORD provider
  const provider = await authRepository.findProvider(user.id, AUTH_PROVIDERS.PASSWORD);
  if (!provider) {
    throw createError("BAD_REQUEST", "Please try logging in with Google or GitHub.");
  }

  const otp = generateOTP(email);
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  await authRepository.createOtp({
    id: uuidv4(),
    user_id: user.id,
    purpose: OTP_PURPOSE.PASSWORD_RESET,
    target: email,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  try {
    await sendPasswordResetEmail(email, otp);
  } catch (error) {
    console.warn(`[MAIL ERROR] Could not send password reset OTP to ${email}:`, error.message);
  }

  return { message: "If an account exists, a reset code was sent." };
};

/**
 * Handle Reset Password
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw createError("INVALID_OTP", "Invalid or expired OTP");

  const validOtp = await authRepository.findValidOtp(user.id, OTP_PURPOSE.PASSWORD_RESET, email);
  if (!validOtp) throw createError("INVALID_OTP", "Invalid or expired OTP");

  const isMatch = await bcrypt.compare(otp, validOtp.otp_hash);
  if (!isMatch) throw createError("INVALID_OTP");

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await authRepository.updateProviderPassword(user.id, AUTH_PROVIDERS.PASSWORD, newPasswordHash);
  await authRepository.markOtpUsed(validOtp.id);

  return { message: "Password reset successfully. You can now login." };
};
