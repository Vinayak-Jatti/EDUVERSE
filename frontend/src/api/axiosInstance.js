import axios from "axios";
import { API_BASE_URL } from "@/constants";

// ─── Base instance ─────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies with every request
});

// ─── Request interceptor ───────────────────────────
// Attach access token from memory/storage before every request
axiosInstance.interceptors.request.use(
  (config) => {
    // If you store token in memory/localStorage, attach here:
    // const token = tokenStore.getAccessToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ──────────────────────────
// Normalise errors so every .catch() gets a consistent shape
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    const statusCode = error.response?.status || 500;
    const errorCode  = error.response?.data?.errorCode || "UNKNOWN_ERROR";

    // Return a normalised error object
    return Promise.reject({ message, statusCode, errorCode });
  }
);

export default axiosInstance;
