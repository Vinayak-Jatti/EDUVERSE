import pool from './src/config/db.js';

try {
  const [rows] = await pool.query('SHOW TABLES');
  console.table(rows.map(r => Object.values(r)[0]));
  process.exit(0);
} catch (err) {
  console.error('DB Error:', err.message);
  process.exit(1);
}
