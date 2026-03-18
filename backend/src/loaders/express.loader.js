import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import xssClean from "xss-clean";
import config from "../config/env.js";
import morganLogger from "../utils/logger.js";
import requestId from "../middlewares/requestId.middleware.js";
import { apiLimiter } from "../middlewares/rateLimit.middleware.js";

export default (app) => {
  // 🛡 Security
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(xssClean());

  // 📝 Request Tracing & Logging
  app.use(requestId);
  app.use(morganLogger);

  // 📦 Body Parsing
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(cookieParser());

  // 📂 Static Files
  app.use(express.static("public"));

  // 🚦 Rate Limiting
  app.use("/api", apiLimiter);

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
