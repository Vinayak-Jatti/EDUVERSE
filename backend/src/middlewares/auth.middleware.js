import { verifyAccessToken } from "../utils/jwt.js";
import createError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userRepository from "../modules/user/user.repository.js";

/**
 * Middleware to protect routes and ensure authentication via Access Tokens
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw createError("UNAUTHORIZED", "Not authorized, no token provided");
  }

  try {
    // 2. Verify token
    const decoded = verifyAccessToken(token);
    
    // 3. Check if user still exists
    const user = await userRepository.findById(decoded.id || decoded.userId);
    if (!user) {
      throw createError("UNAUTHORIZED", "The user belonging to this token no longer exists.");
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw createError("UNAUTHORIZED", "Not authorized, token failed or expired");
  }
});

/**
 * Optional authentication middleware
 * Does not block request if token is missing or invalid
 */
export const optional = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.id || decoded.userId);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Treat invalid tokens same as no tokens
    next();
  }
});

export default protect;
