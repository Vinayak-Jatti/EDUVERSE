import mysql from "mysql2/promise";
import config from "./env.js";
import logger from "../utils/logger.js";

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  multipleStatements: true,
});

pool.on("error", (err) => {
  logger.error({
    msg: "MySQL pool error",
    err: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage,
  });
});

export default pool;
