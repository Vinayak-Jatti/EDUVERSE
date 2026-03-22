import pool from "./src/config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
  const sqlFile = path.join(__dirname, "./src/database/migrations/fix_interactions_polymorphism.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");

  console.log("Starting polymorphic migration...");

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Execute multiple statements at once since pool is configured for it
    await connection.query(sql);

    await connection.commit();
    console.log("Migration completed successfully! 🚀");
  } catch (err) {
    await connection.rollback();
    console.error("Migration failed! ❌");
    console.error(err);
  } finally {
    connection.release();
    process.exit();
  }
};

runMigration();
