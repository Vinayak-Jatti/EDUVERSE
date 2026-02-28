import app from "./src/app.js";
import config from "./src/config/config.js";
import pool from "./src/config/db.js";
import { createUsersTable } from "./src/models/user.model.js";

const startServer = async () => {
  try {
    // Verify DB connection
    const conn = await pool.getConnection();
    conn.release();
    console.log("✅ MySQL connected successfully");

    // Start server
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

      // Force exit if shutdown takes too long
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
