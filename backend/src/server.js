import http from "http";
import app from "./app.js";
import config from "./config/env.js";
import pool from "./config/db.js";
import loadDb from "./loaders/db.loader.js";
import socketLoader from "./loaders/socket.loader.js";

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
      console.log(`🚀 Server running on port ${config.server.port} [${config.server.env}]`);
      console.log(`💬 Socket.io logic initialized [${config.cors.origin}]`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received — shutting down gracefully`);
      server.close(async () => {
        console.log("✅ HTTP server closed");
        await pool.end();
        console.log("✅ MySQL pool closed");
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
