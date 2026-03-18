export const AUTH_EVENTS = {
  SIGNUP: "auth:signup",
  LOGIN: "auth:login",
  PASSWORD_RESET_REQUESTED: "auth:password_reset_requested",
  EMAIL_VERIFIED: "auth:email_verified",
};

export const USER_EVENTS = {
  UPDATED: "user:updated",
  DEACTIVATED: "user:deactivated",
};

export const NOTIFICATION_EVENTS = {
  SEND_EMAIL: "notification:send_email",
  SEND_PUSH: "notification:send_push",
};
