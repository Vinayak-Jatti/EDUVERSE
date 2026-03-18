import mysql from "mysql2/promise";
import config from "./env.js";

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
});

pool.on("error", (err) => {
  console.error("MySQL pool error:", {
    message: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage,
  });
});

export default pool;
