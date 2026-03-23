import { v4 as uuidv4 } from "uuid";
import profileRepository from "./src/modules/profile/profile.repository.js";
import { registerUser } from "./src/modules/auth/auth.service.js";
import pool from "./src/config/db.js";

const testEmail = `test_${Date.now()}@example.com`;
try {
  console.log("1. Registering...");
  const reg = await registerUser({
    firstName: "Test",
    lastName: "User",
    email: testEmail,
    campus: "Test Uni",
    password: "Password123!"
  });
  const userId = reg.userId;
  console.log("UserId:", userId);

  console.log("2. Verifying User...");
  await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id=?", [userId]);

  console.log("3. Updating Profile...");
  const res = await pool.execute(
    "UPDATE user_profiles SET display_name = ?, bio = ? WHERE user_id = ?",
    ["Updated Name", "Updated Bio", userId]
  );
  console.log("Update OK:", res[0].affectedRows);

  process.exit(0);
} catch (e) {
  console.error("FAILED:", e);
  process.exit(1);
}
