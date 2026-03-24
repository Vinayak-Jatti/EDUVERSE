import http from "http";
import app from "./app.js";
import config from "./config/env.js";
import pool from "./config/db.js";
import loadDb from "./loaders/db.loader.js";
import socketLoader from "./loaders/socket.loader.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  try {
    // 🚀 Initialize Database
    await loadDb();

    // ─── Create HTTP server ───────────────────────────────────────────────
    const server = http.createServer(app);

    // ─── Initialize Socket.io ─────────────────────────────────────────────
    const io = socketLoader(server);
    app.set("io", io); // Attach io to app globally for use in controllers

    // 🌐 Start Listening
    server.listen(config.server.port, () => {
      logger.info(`🚀 Server running on port ${config.server.port} [${config.server.env}]`);
      logger.info(`💬 Socket.io logic initialized [${config.cors.origin}]`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.warn(`⚠️  ${signal} received — shutting down gracefully`);
      server.close(async () => {
        logger.info("✅ HTTP server closed");
        await pool.end();
        logger.info("✅ MySQL pool closed");
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (err) {
    logger.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
