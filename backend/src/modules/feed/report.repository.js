import pool from "../../config/db.js";

const reportRepository = {
  /**
   * Create a new report
   */
  createReport: async ({ reporterId, targetType, targetId, reason, description }) => {
    const [result] = await pool.execute(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [reporterId, targetType, targetId, reason, description || null]
    );
    return result;
  }
};

export default reportRepository;
