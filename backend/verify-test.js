import pool from "./src/config/db.js";
import { TABLES } from "./src/modules/auth/auth.constants.js";

async function verifyDbContent() {
  try {
    const [users] = await pool.query(`SELECT * FROM ${TABLES.USERS} ORDER BY created_at DESC LIMIT 1`);
    console.log("\nUsers Table:", JSON.stringify(users, null, 2));
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      const [profiles] = await pool.query(`SELECT * FROM ${TABLES.USER_PROFILES} WHERE user_id = ?`, [userId]);
      console.log("\nProfiles Table:", JSON.stringify(profiles, null, 2));
      
      const [providers] = await pool.query(`SELECT * FROM ${TABLES.USER_AUTH_PROVIDERS} WHERE user_id = ?`, [userId]);
      console.log("\nAuth Providers Table:", JSON.stringify(providers, null, 2));
      
      const [otps] = await pool.query(`SELECT * FROM ${TABLES.OTP_TOKENS} WHERE user_id = ?`, [userId]);
      console.log("\nOTP Tokens Table:", JSON.stringify(otps, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error("Error verifying DB:", err);
    process.exit(1);
  }
}

verifyDbContent();
