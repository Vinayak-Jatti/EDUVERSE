import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import xssClean from "xss-clean";
import config from "../config/env.js";
import httpLogger from "../utils/httpLogger.js";
import requestId from "../middlewares/requestId.middleware.js";
import { apiLimiter } from "../middlewares/rateLimit.middleware.js";

export default (app) => {
  // 🛡 Rely on Render's Proxy
  app.set("trust proxy", 1);

  // 🛡 HTTPS Enforcement (Behind Proxy)
  if (config.server.isProduction) {
    app.use((req, res, next) => {
      if (req.header("x-forwarded-proto") !== "https") {
        return res.redirect(`https://${req.header("host")}${req.url}`);
      }
      next();
    });
  }

  // 🛡 Security & CORS
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": [
            "'self'", 
            "data:", 
            "https://images.unsplash.com", 
            "https://source.unsplash.com", 
            "https://api.dicebear.com", 
            "https://lh3.googleusercontent.com", 
            "https://res.cloudinary.com",
            "https://*.cloudinary.com"
        ],
        "media-src": [
            "'self'", 
            "data:", 
            "https://res.cloudinary.com",
            "https://*.cloudinary.com",
            "https://www.youtube.com", 
            "https://youtube.com"
        ]
      }
    }
  }));

  const parsedOrigins = config.cors.origin
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      /* Allow server-to-server / health-check requests (no origin header) */
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (parsedOrigins.includes(normalizedOrigin)) return callback(null, true);
      
      callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }));

  app.use(xssClean());

  // 📝 Request Tracing & Logging
  app.use(requestId);
  app.use(httpLogger);

  // 📦 Body Parsing
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(cookieParser());

  // 📂 Static Files
  app.use(express.static("public"));

  // 🚦 Selective Rate Limiting
  if (config.server.env !== "test") {
    app.use("/api", (req, res, next) => {
      // Skip rate limit for OAuth callbacks which are sensitive to IP/Proxy changes
      if (req.path.includes("/auth/google/callback") || req.path.includes("/auth/github/callback")) {
        return next();
      }
      apiLimiter(req, res, next);
    });
  }

  // JSON Error Handling for malformed body
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid JSON payload.",
      });
    }
    next(err);
  });
};
