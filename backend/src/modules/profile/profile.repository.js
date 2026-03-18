import pool from "../../config/db.js";
import { TABLES } from "../auth/auth.constants.js";

const profileRepository = {
  /**
   * Find profile by user ID
   */
  findByUserId: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT * FROM ${TABLES.USER_PROFILES} WHERE user_id = ?`,
      [userId]
    );
    return rows[0] ?? null;
  },

  /**
   * Find profile by username
   */
  findByUsername: async (username) => {
    const [rows] = await pool.execute(
      `SELECT * FROM ${TABLES.USER_PROFILES} WHERE username = ?`,
      [username]
    );
    return rows[0] ?? null;
  },

  /**
   * Create user profile
   */
  create: async (profileData) => {
    const fields = Object.keys(profileData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(profileData);

    const [result] = await pool.execute(
      `INSERT INTO ${TABLES.USER_PROFILES} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result;
  },

  /**
   * Update user profile
   */
  update: async (userId, updateData) => {
    const fields = Object.keys(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(updateData), userId];

    const [result] = await pool.execute(
      `UPDATE ${TABLES.USER_PROFILES} SET ${setClause} WHERE user_id = ?`,
      values
    );
    return result;
  },

  /**
   * Manage Interests
   */
  addInterest: async (userId, tagId) => {
    await pool.execute(
      `INSERT IGNORE INTO ${TABLES.PROFILE_INTERESTS} (user_id, tag_id) VALUES (?, ?)`,
      [userId, tagId]
    );
  },

  removeInterest: async (userId, tagId) => {
    await pool.execute(
      `DELETE FROM ${TABLES.PROFILE_INTERESTS} WHERE user_id = ? AND tag_id = ?`,
      [userId, tagId]
    );
  },

  getInterests: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT t.* FROM ${TABLES.INTEREST_TAGS} t
       JOIN ${TABLES.PROFILE_INTERESTS} pi ON t.id = pi.tag_id
       WHERE pi.user_id = ?`,
      [userId]
    );
    return rows;
  }
};

export default profileRepository;
