import { axiosInstance } from "@/api";

// ─── All API calls related to auth ────────────────
// Services call axiosInstance directly.
// Components never call axiosInstance — they call services.

export const registerUser = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginUser = (data) =>
  axiosInstance.post("/auth/login", data);

export const logoutUser = () =>
  axiosInstance.post("/auth/logout");

export const refreshTokens = () =>
  axiosInstance.post("/auth/refresh-token");

export const getProfile = () =>
  axiosInstance.get("/auth/profile");
