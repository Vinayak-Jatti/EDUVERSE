import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IDEMPOTENT_CODES = new Set([
  1050, // Table exists
  1060, // Column exists
  1061, // Duplicate key (Index)
  1062, // Duplicate entry
  1091, // Column/Key not found
  1359, // Trigger exists
]);

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let depth = 0;

  for (const line of sql.split("\n")) {
    const trimmedLine = line.trim();
    const upperLine = trimmedLine.toUpperCase();

    // Skip comments/delimiter markers at depth 0
    if (depth === 0 && (upperLine.startsWith("--") || upperLine.startsWith("DELIMITER") || upperLine === "")) continue;

    // Depth Tracking: Increase for BEGIN and IF
    // Regex \b matches word boundaries to avoid catching them inside other words
    const beginMatches = upperLine.match(/\bBEGIN\b/g);
    const ifMatches = upperLine.match(/\bIF\b/g);
    const endMatches = upperLine.match(/\bEND\b/g);
    
    // Note: This is an approximation. Real balance is complex in SQL.
    if (beginMatches) depth += beginMatches.length;
    if (ifMatches) depth += ifMatches.length;
    if (endMatches) depth = Math.max(0, depth - endMatches.length);

    current += line + "\n";

    // Split at semicolon if we are at root level
    if (depth === 0 && (trimmedLine.endsWith(";") || trimmedLine.endsWith("//"))) {
      let stmt = current.trim();
      // Cleanup trailing delimiters if used
      stmt = stmt.replace(/;$/, "").replace(/\/\/$/, "").trim();
      if (stmt) statements.push(stmt);
      current = "";
    }
  }

  const remainder = current.trim();
  if (remainder) statements.push(remainder);
  return statements;
}

const migrate = async () => {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  console.log("🚦 Starting migrations...\n");

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;

    console.log(`🏃 Running ${file}...`);
    const rawSql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = splitStatements(rawSql);

    let applied = 0;
    let skipped = 0;

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
        applied++;
      } catch (err) {
        if (IDEMPOTENT_CODES.has(err.errno)) {
          skipped++;
        } else {
          console.error(`\n❌ Fatal error in ${file}:`);
          console.error(`   errno  : ${err.errno}`);
          console.error(`   Message: ${err.message}`);
          console.error(`   SQL    : ${stmt.slice(0, 300)}`);
          process.exit(1);
        }
      }
    }
    console.log(`   ✅ Success: ${applied} applied, ${skipped} skipped.`);
  }

  console.log("\n🏁 All migrations completed successfully.");
  process.exit(0);
};

migrate();
