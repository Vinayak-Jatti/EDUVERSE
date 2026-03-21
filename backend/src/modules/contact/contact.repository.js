import pool from "../../config/db.js";

const contactRepository = {
  /**
   * Insert a new application into the system graph
   */
  async createApplication(data) {
    const query = `
      INSERT INTO contact_applications (id, first_name, last_name, email, campus, resume_url)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      data.first_name,
      data.last_name,
      data.email,
      data.campus,
      data.resume_url
    ]);
    return result.insertId;
  }
};

export default contactRepository;
