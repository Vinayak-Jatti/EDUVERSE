import pool from '../../config/db.js';

async function main() {
    try {
        const [rows] = await pool.query('SELECT id, email, status FROM users WHERE email LIKE "vinayakjatti044%"');
        if (rows.length === 0) {
            console.error("USER NOT FOUND IN DB!");
        } else {
            console.log("USER FOUND:", rows[0]);
        }
    } catch (err) {
        console.error("DB QUERY ERROR:", err.message);
    }
    process.exit(0);
}
main();
