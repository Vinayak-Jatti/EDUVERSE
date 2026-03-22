import chatsService from "./chats.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js"; // 14. Format all responses using existing response formatter utility

// 5. Build REST API: POST /chat/rooms — create or fetch a chat room
export const createOrFetchRoom = asyncHandler(async (req, res) => {
  const { targetUserId, type, communityId } = req.body;
  const roomId = await chatsService.createOrFetchRoom(req.user.id, targetUserId, type, communityId);
  return sendSuccess(res, req, { message: "Room synced.", data: { roomId } });
});

// 7. Build REST API: GET /chat/rooms — list all rooms for logged-in user
export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await chatsService.getMyRooms(req.user.id);
  return sendSuccess(res, req, { data: rooms });
});

// 6. Build REST API: GET /chat/rooms/:roomId/messages — fetch paginated message history
export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const messages = await chatsService.getRoomMessages(req.user.id, roomId, limit, offset);
  return sendSuccess(res, req, { data: messages });
});
