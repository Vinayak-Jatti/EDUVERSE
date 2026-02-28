import pool from "../config/db.js";
import { ROLES, TABLES } from "../constants/index.js";

// ─── Table Migration ───────────────────────────────────────────────────────────
export const createUsersTable = async () => {
  // const sql = `
  //   CREATE TABLE IF NOT EXISTS ${TABLES.USERS} (
  //     id            INT AUTO_INCREMENT PRIMARY KEY,
  //     name          VARCHAR(100)              NOT NULL,
  //     email         VARCHAR(150)              NOT NULL UNIQUE,
  //     password      VARCHAR(255)              NOT NULL,
  //     role          ENUM('${ROLES.USER}','${ROLES.ADMIN}') NOT NULL DEFAULT '${ROLES.USER}',
  //     refresh_token TEXT                      DEFAULT NULL,
  //     is_active     TINYINT(1)                NOT NULL DEFAULT 1,
  //     created_at    TIMESTAMP                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  //     updated_at    TIMESTAMP                 NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  // `;
  await pool.execute(sql);
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, is_active, created_at FROM ${TABLES.USERS} WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};
