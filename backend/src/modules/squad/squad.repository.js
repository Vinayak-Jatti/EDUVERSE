import pool from "../../config/db.js";

const squadRepository = {
  create: async (squadData) => {
    const query = `
      INSERT INTO squads (id, name, description, avatar_url, visibility, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      squadData.id,
      squadData.name,
      squadData.description,
      squadData.avatar_url,
      squadData.visibility || 'public',
      squadData.created_by
    ];
    await pool.execute(query, values);
    
    // Auto-create owner membership
    await squadRepository.addMember(squadData.id, squadData.created_by, 'owner');
    
    return squadRepository.findById(squadData.id);
  },

  findById: async (id) => {
    const query = `
      SELECT s.*, up.display_name as creator_name, up.username as creator_username
      FROM squads s
      JOIN user_profiles up ON s.created_by = up.user_id
      WHERE s.id = ? AND s.is_deleted = 0
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  findAll: async ({ limit = 20, offset = 0, visibility = 'public' }) => {
    const query = `
      SELECT s.*, up.display_name as creator_name
      FROM squads s
      JOIN user_profiles up ON s.created_by = up.user_id
      WHERE s.visibility = ? AND s.is_deleted = 0
      ORDER BY s.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    const [rows] = await pool.execute(query, [visibility]);
    return rows;
  },

  addMember: async (squadId, userId, role = 'member') => {
    const query = `
      INSERT INTO squad_memberships (squad_id, user_id, role)
      VALUES (?, ?, ?)
    `;
    return await pool.execute(query, [squadId, userId, role]);
  },

  removeMember: async (squadId, userId) => {
    const query = `DELETE FROM squad_memberships WHERE squad_id = ? AND user_id = ?`;
    return await pool.execute(query, [squadId, userId]);
  },

  getMembership: async (squadId, userId) => {
    const query = `SELECT * FROM squad_memberships WHERE squad_id = ? AND user_id = ?`;
    const [rows] = await pool.execute(query, [squadId, userId]);
    return rows[0];
  },

  getUserSquads: async (userId) => {
    const query = `
      SELECT s.*, sm.role
      FROM squads s
      JOIN squad_memberships sm ON s.id = sm.squad_id
      WHERE sm.user_id = ? AND s.is_deleted = 0
      ORDER BY sm.joined_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }
};

export default squadRepository;
