import { v4 as uuidv4 } from "uuid";
import pool from "./src/config/db.js";

const userIdA = uuidv4();
const userIdB = uuidv4();

try {
  console.log("1. Creating Users & Profiles...");
  await pool.execute("INSERT INTO users (id, email, status) VALUES (?, ?, 'active')", [userIdA, `a_${Date.now()}@ex.com`]);
  await pool.execute("INSERT INTO users (id, email, status) VALUES (?, ?, 'active')", [userIdB, `b_${Date.now()}@ex.com`]);
  
  await pool.execute("INSERT INTO user_profiles (user_id, username, display_name) VALUES (?, ?, ?)", [userIdA, `user_a_${Date.now()}`, "A"]);
  await pool.execute("INSERT INTO user_profiles (user_id, username, display_name) VALUES (?, ?, ?)", [userIdB, `user_b_${Date.now()}`, "B"]);

  console.log("2. Performing Follow...");
  await pool.execute("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [userIdA, userIdB]);

  console.log("3. Checking Follower Count...");
  const [rows] = await pool.execute("SELECT follower_count FROM user_profiles WHERE user_id = ?", [userIdB]);
  console.log("User B Follower Count:", rows[0].follower_count);

  process.exit(0);
} catch (e) {
  console.error("FAILED:", e);
  process.exit(1);
}
