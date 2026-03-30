import pool from "../../config/db.js";

const connectionsRepository = {
  /**
   * Send a connection request
   */
  async createRequest(requesterId, addresseeId) {
    const query = `
      INSERT INTO connections (requester_id, addressee_id, status)
      VALUES (?, ?, 'pending')
    `;
    const [result] = await pool.execute(query, [requesterId, addresseeId]);
    return result.insertId;
  },

  /**
   * Check for existing connection between two users
   */
  async findConnection(userId1, userId2) {
    const query = `
      SELECT * FROM connections 
      WHERE (requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?)
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId1, userId2, userId2, userId1]);
    return rows[0];
  },

  /**
   * Accept a connection request
   */
  async acceptRequest(connectionId, addresseeId) {
    const query = `
      UPDATE connections 
      SET status = 'accepted', actioned_at = CURRENT_TIMESTAMP
      WHERE id = ? AND addressee_id = ? AND status = 'pending'
    `;
    const [result] = await pool.execute(query, [connectionId, addresseeId]);
    return result.affectedRows > 0;
  },

  /**
   * Reject or Ignore a connection request
   */
  async updateStatus(connectionId, addresseeId, status) {
    const query = `
      UPDATE connections 
      SET status = ?, actioned_at = CURRENT_TIMESTAMP
      WHERE id = ? AND addressee_id = ? AND status = 'pending'
    `;
    const [result] = await pool.execute(query, [status, connectionId, addresseeId]);
    return result.affectedRows > 0;
  },

  /**
   * Remove a connection
   */
  async deleteConnection(userId1, userId2) {
    const query = `
      DELETE FROM connections 
      WHERE (requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?)
    `;
    const [result] = await pool.execute(query, [userId1, userId2, userId1, userId2]);
    return result.affectedRows > 0;
  },

  /**
   * Count accepted connections for a user
   */
  async getAcceptedConnectionCount(userId) {
    const query = `
      SELECT COUNT(*) as connection_count
      FROM connections 
      WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
    `;
    const [rows] = await pool.execute(query, [userId, userId]);
    return rows[0].connection_count;
  },

  /**
   * List all accepted connections for a user
   */
  async getConnections(userId) {
    const query = `
      SELECT 
        c.id as connection_id,
        c.created_at as connected_since,
        u.id as user_id,
        up.display_name,
        up.username,
        up.avatar_url,
        up.bio
      FROM connections c
      JOIN users u ON (u.id = IF(c.requester_id = ?, c.addressee_id, c.requester_id))
      JOIN user_profiles up ON u.id = up.user_id
      WHERE (c.requester_id = ? OR c.addressee_id = ?) AND c.status = 'accepted'
      ORDER BY c.actioned_at DESC
    `;
    const [rows] = await pool.execute(query, [userId, userId, userId]);
    return rows;
  },

  /**
   * List pending incoming requests
   */
  async getIncomingRequests(userId) {
    const query = `
      SELECT 
        c.id as request_id,
        c.created_at,
        u.id as requester_id,
        up.display_name,
        up.username,
        up.avatar_url,
        up.bio
      FROM connections c
      JOIN users u ON c.requester_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      WHERE c.addressee_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  },

  /**
   * List pending outgoing requests
   */
  async getOutgoingRequests(userId) {
    const query = `
      SELECT 
        c.id as request_id,
        c.created_at,
        u.id as addressee_id,
        up.display_name,
        up.username,
        up.avatar_url,
        up.bio
      FROM connections c
      JOIN users u ON c.addressee_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      WHERE c.requester_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  },

  /**
   * Get connection suggestions (users not connected to)
   */
  async getSuggestions(userId, limit = 5) {
    const query = `
      SELECT 
        u.id as user_id,
        up.display_name,
        up.username,
        up.avatar_url,
        up.bio,
        up.headline
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != ?
      AND u.id NOT IN (
        SELECT IF(requester_id = ?, addressee_id, requester_id)
        FROM connections
        WHERE requester_id = ? OR addressee_id = ?
      )
      ORDER BY RAND()
      LIMIT ?
    `;
    // We pass limits as string if using direct ? parameter, but execute handles it
    // Better to use limit directly if we have issues with type casting.
    // Ensure limit is number.
    const [rows] = await pool.execute(query, [userId, userId, userId, userId, parseInt(limit, 10)]);
    return rows;
  }
};

export default connectionsRepository;
