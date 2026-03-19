import dotenv from "dotenv";

dotenv.config({
  path: [
    "./.env",
    "./.env.dev",
    "./.env.test",
    "./.env.staging",
    "./.env.production",
    "./.env.example",
  ],
});

// Throw immediately at startup if a required variable is missing
const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback) => process.env[key] ?? fallback;

const config = {
  server: {
    port: optional("PORT", "3000"),
    env: optional("NODE_ENV", "development"),
    isProduction: optional("NODE_ENV", "development") === "production",
  },
  cors: {
    origin: optional("CORS_ORIGIN", "http://localhost:5173"),
  },
  db: {
    host: optional("DB_HOST", "localhost"),
    port: optional("DB_PORT", "3306"),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_USER_PASS"),
  },
  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: optional("JWT_EXPIRES_IN", "7d"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    refreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
  mail: {
    host: required("MAIL_HOST"),
    port: optional("MAIL_PORT", "2525"),
    user: required("MAIL_USER"),
    pass: required("MAIL_PASS"),
    from: optional("MAIL_FROM", "EduVerse <no-reply@eduverse.app>"),
  },
  oauth: {
    google: {
      clientId: optional("GOOGLE_CLIENT_ID", ""),
      clientSecret: optional("GOOGLE_CLIENT_SECRET", ""),
      redirectUri: optional("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/v1/auth/google/callback"),
    },
    github: {
      clientId: optional("GITHUB_CLIENT_ID", ""),
      clientSecret: optional("GITHUB_CLIENT_SECRET", ""),
      redirectUri: optional("GITHUB_REDIRECT_URI", "http://localhost:3000/api/v1/auth/github/callback"),
    },
  },
};

export default config;
