import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seed = async () => {
  const seedersDir = path.join(__dirname, "seeders");
  if (!fs.existsSync(seedersDir)) return;
  
  const files = fs.readdirSync(seedersDir).sort();

  console.log("🌱 Starting seeding...");

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;

    console.log(`🌾 Planting ${file}...`);
    const sql = fs.readFileSync(path.join(seedersDir, file), "utf8");
    
    try {
      await pool.query(sql);
      console.log(`✅ Finished ${file}`);
    } catch (err) {
      console.error(`❌ Error in ${file}:`, err.message);
    }
  }

  console.log("🌳 Seeding completed.");
  process.exit(0);
};

seed();
