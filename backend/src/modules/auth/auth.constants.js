export const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
  DEACTIVATED: "deactivated",
};

export const AUTH_PROVIDERS = {
  PASSWORD: "password",
  GOOGLE: "google",
  GITHUB: "github",
};

export const OTP_PURPOSE = {
  SIGNUP: "signup",
  LOGIN: "login",
  PASSWORD_RESET: "password_reset",
  EMAIL_CHANGE: "email_change",
  PHONE_VERIFY: "phone_verify",
};

export const EDU_SECTOR = {
  SCHOOL: "school",
  COLLEGE: "college",
  UNIVERSITY: "university",
  SELF_LEARNER: "self_learner",
  PROFESSIONAL: "professional",
};

export const PROFILE_VISIBILITY = {
  PUBLIC: "public",
  CONNECTIONS_ONLY: "connections_only",
  PRIVATE: "private",
};

export const TABLES = {
  USERS: "users",
  USER_AUTH_PROVIDERS: "user_auth_providers",
  OTP_TOKENS: "otp_tokens",
  SESSIONS: "sessions",
  INTEREST_TAGS: "interest_tags",
  USER_PROFILES: "user_profiles",
  PROFILE_INTERESTS: "profile_interests",
  USERNAME_CHANGE_LOG: "username_change_log",
};
