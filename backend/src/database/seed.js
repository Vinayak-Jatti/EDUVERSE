import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seed = async () => {
  const seedersDir = path.join(__dirname, "seeders");
  if (!fs.existsSync(seedersDir)) return;
  
  const files = fs.readdirSync(seedersDir).sort();

  logger.info("🌱 Starting seeding...");

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;

    logger.info(`🌾 Planting ${file}...`);
    const sql = fs.readFileSync(path.join(seedersDir, file), "utf8");
    
    try {
      await pool.query(sql);
      logger.info(`✅ Finished ${file}`);
    } catch (err) {
      logger.error(`❌ Error in ${file}: ${err.message}`);
    }
  }

  logger.info("🌳 Seeding completed.");
  process.exit(0);
};

seed();
