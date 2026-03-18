import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MySQL error codes that mean "already exists" — safe to skip in reruns
const IDEMPOTENT_CODES = new Set([
  1050, // Table already exists
  1061, // Duplicate key name (index)
  1062, // Duplicate entry
  1304, // Procedure/Function/Trigger already exists (old MySQL)
  1359, // Trigger already exists (MySQL 8+)
  1630, // Function already exists
]);

/**
 * Splits a SQL file into individual executable statements.
 * Correctly handles BEGIN...END compound statements (triggers, procedures)
 * so that semicolons inside them don't prematurely terminate the statement.
 */
function splitStatements(sql) {
  const statements = [];
  let current = "";
  let depth = 0; // BEGIN...END nesting depth

  // Tokenise line by line for simplicity
  for (const line of sql.split("\n")) {
    const trimmed = line.trimEnd();
    const upper = trimmed.toUpperCase().trim();

    // Skip pure comment lines and blank lines at the top level
    if (depth === 0 && (upper.startsWith("--") || upper === "")) continue;

    // Track compound block depth.
    //   - lines that are exactly "BEGIN" open a block
    //   - lines that are exactly "END;" close a block  (NOT "END IF;" / "END LOOP;")
    if (/^BEGIN$/i.test(upper)) depth++;
    if (/^END;?$/i.test(upper) && depth > 0) depth = Math.max(0, depth - 1);

    current += trimmed + "\n";

    // A semicolon at depth=0 terminates the statement
    if (depth === 0 && trimmed.endsWith(";")) {
      const stmt = current.trim().replace(/;$/, "").trim();
      if (stmt.length > 0) statements.push(stmt);
      current = "";
    }
  }

  // Flush anything remaining (statement without trailing newline)
  const remainder = current.trim().replace(/;$/, "").trim();
  if (remainder.length > 0) statements.push(remainder);

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

    let skipped = 0;
    let applied = 0;

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
          console.error(`   SQL    :\n${stmt.slice(0, 300)}`);
          process.exit(1);
        }
      }
    }

    console.log(`   ✅ Applied: ${applied}  ⏭  Skipped (already exists): ${skipped}`);
  }

  console.log("\n🏁 All migrations completed successfully.");
  process.exit(0);
};

migrate();
