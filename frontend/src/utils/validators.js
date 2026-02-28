export const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password = "") =>
  password.length >= 6;

export const isEmpty = (value) =>
  value === null || value === undefined || String(value).trim() === "";
