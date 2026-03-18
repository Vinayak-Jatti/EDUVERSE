import pool from "../config/db.js";

export default async () => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log("✅ MySQL connected successfully");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    throw err;
  }
};
