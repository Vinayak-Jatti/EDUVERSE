import pool from "../../config/db.js";
import { TABLES } from "../auth/auth.constants.js";

/**
 * Find user by ID
 */
export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLES.USERS} WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLES.USERS} WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
};

/**
 * Create new core user
 */
export const createUser = async (userData) => {
  const { id, email, phone, status } = userData;
  const [result] = await pool.execute(
    `INSERT INTO ${TABLES.USERS} (id, email, phone, status) VALUES (?, ?, ?, ?)`,
    [id, email || null, phone || null, status || 'pending']
  );
  return result;
};

/**
 * Soft delete user
 */
export const softDeleteUser = async (id) => {
  const [result] = await pool.execute(
    `UPDATE ${TABLES.USERS} SET deleted_at = NOW(), status = 'deactivated' WHERE id = ?`,
    [id]
  );
  return result;
};
