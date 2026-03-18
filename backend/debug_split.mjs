import fs from "fs";
import path from "path";

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let depth = 0;

  for (const line of sql.split("\n")) {
    const trimmed = line.trimEnd();
    const upper = trimmed.toUpperCase().trim();

    if (depth === 0 && (upper.startsWith("--") || upper === "")) continue;

    if (/^BEGIN$/i.test(upper)) {
      depth++;
      console.log(`  [depth→${depth}] BEGIN`);
    }
    if (/^END;?$/i.test(upper) && depth > 0) {
      depth--;
      console.log(`  [depth→${depth}] END`);
    }

    current += trimmed + "\n";

    if (depth === 0 && trimmed.endsWith(";")) {
      const stmt = current.trim().replace(/;$/, "").trim();
      if (stmt.length > 0) {
        statements.push(stmt);
        console.log(`>>> STATEMENT #${statements.length}: ${stmt.split("\n")[0].slice(0, 60)}`);
        current = "";
      }
    }
  }
  return statements;
}

const sql = fs.readFileSync("src/database/migrations/008_interaction.sql", "utf8");
const stmts = splitStatements(sql);
console.log(`\nTotal statements: ${stmts.length}`);
