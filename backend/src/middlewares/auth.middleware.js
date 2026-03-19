import { verifyAccessToken } from "../utils/jwt.js";
import createError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userRepository from "../modules/user/user.repository.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw createError("UNAUTHORIZED", "Not authorized, no token provided");
  }

  try {
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw createError("UNAUTHORIZED", "The user belonging to this token no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw createError("UNAUTHORIZED", "Not authorized, token failed or expired");
  }
});

export default protect;
