import mysql from "mysql2/promise";
import config from "../config/env.js";
import logger from "../utils/logger.js";
import { execSync } from "child_process";

const reset = async () => {
  let conn;
  try {
    // Open a bare connection with NO database selected
    conn = await mysql.createConnection({
      host:     config.db.host,
      port:     Number(config.db.port),
      user:     config.db.user,
      password: config.db.password,
    });

    logger.warn(`⚠️  Dropping database \`${config.db.name}\`...`);
    await conn.execute(`DROP DATABASE IF EXISTS \`${config.db.name}\``);
    logger.info(`✅ Dropped.`);

    logger.info(`🛠  Creating database \`${config.db.name}\`...`);
    await conn.execute(
      `CREATE DATABASE \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    logger.info(`✅ Created.`);

    await conn.end();

    // Now run migrations against the fresh DB
    logger.info(`🚦 Running migrations on fresh database...`);
    execSync("node src/database/migrate.js", { stdio: "inherit" });

    logger.info(`🎉 Database reset complete!`);
    process.exit(0);
  } catch (err) {
    logger.error(`❌ Reset failed: ${err.message}`);
    if (conn) await conn.end().catch(() => {});
    process.exit(1);
  }
};

reset();
