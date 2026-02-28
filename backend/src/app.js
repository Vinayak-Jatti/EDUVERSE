import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import xssClean from "xss-clean";

import config from "./config/config.js";
import morganLogger from "./config/logger.js";
import requestId from "./middlewares/requestId.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet()); // Secure HTTP headers
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(xssClean()); // Strip XSS from req.body / req.query

// ─── Request Tracing ──────────────────────────────────────────────────────────
app.use(requestId); // Stamp every request with a unique ID

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morganLogger);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));

// Catch malformed JSON before routes see it
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid JSON payload. Check your request body.",
    });
  }
  next(err);
});

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Server is running" });
});

// app.use("/api/v1/auth", authRoutes);

// ─── Error Handling (must be last) ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
