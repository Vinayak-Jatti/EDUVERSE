import chatsRepository from "./chats.repository.js";
import createError from "../../utils/ApiError.js";

const chatsService = {
  // 5. POST /chat/rooms — create or fetch a chat room
  async createOrFetchRoom(currentUserId, targetUserId, type = 'direct', communityId = null) {
    if (type === 'direct') {
        if (!targetUserId) {
            throw createError("BAD_REQUEST", "Target user ID is required for direct rooms.");
        }
        if (currentUserId === targetUserId) {
            throw createError("BAD_REQUEST", "You cannot initialize a room with yourself.");
        }
    }

    // Pass to repository to check for existing or create new securely
    return await chatsRepository.createOrFetchRoom(currentUserId, targetUserId, type, communityId);
  },

  // 7. GET /chat/rooms — list all rooms for logged-in user
  async getMyRooms(userId) {
    return await chatsRepository.getMyRooms(userId);
  },

  // 6. GET /chat/rooms/:roomId/messages — fetch paginated message history
  async getRoomMessages(userId, roomId, limit = 50, offset = 0) {
    // 34. Prevent users from viewing messages to rooms they are not participants of
    const isParticipant = await chatsRepository.isParticipant(roomId, userId);
    if (!isParticipant) {
      throw createError("FORBIDDEN", "Security Protocol: You are not authorized for this room.");
    }
    
    // Fetch via repository
    return await chatsRepository.getRoomMessages(roomId, limit, offset);
  }
};

export default chatsService;
