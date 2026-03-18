import pool from "../../config/db.js";
import { TABLES } from "./auth.constants.js";

const authRepository = {
  // ─── Auth Providers ──────────────────────────────────────────────────────────

  findProvider: async (userId, provider) => {
    const [rows] = await pool.execute(
      `SELECT * FROM ${TABLES.USER_AUTH_PROVIDERS} WHERE user_id = ? AND provider = ?`,
      [userId, provider]
    );
    return rows[0] ?? null;
  },

  createProvider: async (providerData) => {
    const { id, user_id, provider, provider_uid, password_hash } = providerData;
    const [result] = await pool.execute(
      `INSERT INTO ${TABLES.USER_AUTH_PROVIDERS} (id, user_id, provider, provider_uid, password_hash) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, user_id, provider, provider_uid || null, password_hash || null]
    );
    return result;
  },

  // ─── Sessions ───────────────────────────────────────────────────────────────

  createSession: async (sessionData) => {
    const { id, user_id, jwt_jti, device_name, ip_address, user_agent, expires_at } = sessionData;
    const [result] = await pool.execute(
      `INSERT INTO ${TABLES.SESSIONS} (id, user_id, jwt_jti, device_name, ip_address, user_agent, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, jwt_jti, device_name || null, ip_address || null, user_agent || null, expires_at]
    );
    return result;
  },

  findSessionByJti: async (jti) => {
    const [rows] = await pool.execute(
      `SELECT * FROM ${TABLES.SESSIONS} WHERE jwt_jti = ? AND is_revoked = 0 LIMIT 1`,
      [jti]
    );
    return rows[0] ?? null;
  },

  revokeSession: async (jti) => {
    const [result] = await pool.execute(
      `UPDATE ${TABLES.SESSIONS} SET is_revoked = 1 WHERE jwt_jti = ?`,
      [jti]
    );
    return result;
  },

  // ─── OTP Tokens ─────────────────────────────────────────────────────────────

  createOtp: async (otpData) => {
    const { id, user_id, purpose, target, otp_hash, expires_at } = otpData;
    const [result] = await pool.execute(
      `INSERT INTO ${TABLES.OTP_TOKENS} (id, user_id, purpose, target, otp_hash, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user_id, purpose, target, otp_hash, expires_at]
    );
    return result;
  },

  findValidOtp: async (userId, purpose, target) => {
    const [rows] = await pool.execute(
      `SELECT * FROM ${TABLES.OTP_TOKENS} 
       WHERE user_id = ? AND purpose = ? AND target = ? AND used = 0 AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, purpose, target]
    );
    return rows[0] ?? null;
  },

  markOtpUsed: async (otpId) => {
    await pool.execute(
      `UPDATE ${TABLES.OTP_TOKENS} SET used = 1 WHERE id = ?`,
      [otpId]
    );
  }
};

export default authRepository;
