import connectionsRepository from "./connections.repository.js";
import createError from "../../utils/ApiError.js";

const connectionsService = {
  /**
   * Initiate a connection
   */
  async requestConnection(requesterId, addresseeId) {
    if (requesterId === addresseeId) {
      throw createError("BAD_REQUEST", "Self-Connection Protocol Breach: You cannot connect with yourself.");
    }

    const existing = await connectionsRepository.findConnection(requesterId, addresseeId);
    if (existing) {
      if (existing.status === 'accepted') throw createError("CONNECTION_ALREADY_EXISTS");
      if (existing.status === 'pending') {
        if (existing.requester_id === requesterId) {
          throw createError("CONNECTION_PENDING", "Handshake Pending: You already sent a request to this peer.");
        } else {
          throw createError("CONNECTION_PENDING", "Action Required: This peer sent you a request first. Check your pending tray!");
        }
      }
      if (existing.status === 'blocked') throw createError("FORBIDDEN", "Protocol Block: Interaction restricted.");
    }

    return await connectionsRepository.createRequest(requesterId, addresseeId);
  },

  /**
   * Accept an incoming request
   */
  async acceptConnection(userId, requestId) {
    const success = await connectionsRepository.acceptRequest(requestId, userId);
    if (!success) throw new Error("Sync Fault: Handshake could not be verified or was already actioned.");
    return true;
  },

  /**
   * Reject/Delete a request or connection
   */
  async disconnect(userId, targetUserId) {
    return await connectionsRepository.deleteConnection(userId, targetUserId);
  },

  /**
   * List all connections
   */
  async getMyNetwork(userId) {
    return await connectionsRepository.getConnections(userId);
  },

  /**
   * List pending items
   */
  async getPendingTray(userId) {
    const [incoming, outgoing] = await Promise.all([
      connectionsRepository.getIncomingRequests(userId),
      connectionsRepository.getOutgoingRequests(userId)
    ]);
    return { incoming, outgoing };
  }
};

export default connectionsService;
