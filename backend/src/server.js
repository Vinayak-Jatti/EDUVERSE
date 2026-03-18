import app from "./app.js";
import config from "./config/env.js";
import pool from "./config/db.js";
import loadDb from "./loaders/db.loader.js";

const startServer = async () => {
  try {
    // 🚀 Initialize Loaders
    await loadDb();

    // 🌐 Start Server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Server running on port ${config.server.port} [${config.server.env}]`);
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
