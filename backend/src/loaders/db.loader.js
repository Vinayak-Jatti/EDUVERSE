import pool from "../config/db.js";
import logger from "../utils/logger.js";

export default async () => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    logger.info("✅ MySQL connected successfully");
  } catch (err) {
    logger.error(`❌ MySQL connection failed: ${err.message}`);
    throw err;
  }
};
