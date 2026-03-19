import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
