import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard list of tables to cleanup before/after integration tests.
 * Includes all active modules: Auth, Profile, Connections, Feed, Squads, Chats.
 * Order: Child tables FIRST to avoid foreign key violations.
 */
export const TABLES_TO_CLEANUP = [
  // Messaging & Real-time
  'messages',
  'chat_participants',
  'chat_rooms',
  
  // Squads & Communities
  'squad_memberships',
  'squads',
  'communities',
  'community_members',

  // Monitoring & System
  'notifications',
  'admin_audit_log',
  'report_evidence',
  'reports',
  
  // Interactions & Feed
  'comments',
  'likes',
  'saves',
  'shares',
  'poll_votes',
  'poll_options',
  'post_media',
  'posts',
  'insights',
  
  // Social Graph
  'follows',
  'connections',
  'blocks',
  
  // Profile
  'profile_interests',
  'interest_tags',
  'user_profiles',
  'username_change_log',
  
  // Auth & Identity
  'sessions',
  'push_tokens',
  'otp_tokens',
  'user_auth_providers',
  'users'
];

/**
 * Clean up all data in the test database for a fresh test state.
 */
export const dbCleanup = async (tables = TABLES_TO_CLEANUP) => {
  const conn = await pool.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      await conn.execute(`DELETE FROM \`${table}\` WHERE 1`);
    }
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } catch (err) {
    logger.error(`[DB_CLEANUP_ERROR] Table: ${err.message}`);
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Unique test email generator
 */
export const generateTestEmail = (prefix = 'test') =>
  `${prefix}_${uuidv4().replace(/-/g, '').slice(0, 8)}@example.com`;

export { pool };