// ─── API ──────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const APP_NAME     = import.meta.env.VITE_APP_NAME || "App";

// ─── Routes ───────────────────────────────────────
export const ROUTES = Object.freeze({
  HOME:     "/",
  ABOUT:    "/about",
  DASHBOARD:"/dashboard",
  NOT_FOUND:"*",
});

// ─── Query Keys (for future react-query use) ──────
export const QUERY_KEYS = Object.freeze({
  USER:     "user",
  PRODUCTS: "products",
});
