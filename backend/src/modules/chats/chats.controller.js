import chatsService from "./chats.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";

/** Safe upper bound for pagination limit */
const MAX_LIMIT = 100;

/** Safe upper bound for pagination offset */
const MAX_OFFSET = 10000;

/**
 * @desc Create or fetch a direct/community chat room
 * @route POST /api/v1/chat/rooms
 */
export const createOrFetchRoom = asyncHandler(async (req, res) => {
  const { targetUserId, type, communityId } = req.body;
  const roomId = await chatsService.createOrFetchRoom(req.user.id, targetUserId, type, communityId);
  return sendSuccess(res, req, { message: "Room synced.", data: { roomId } });
});

/**
 * @desc List all chat rooms for the authenticated user
 * @route GET /api/v1/chat/rooms
 */
export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await chatsService.getMyRooms(req.user.id);
  return sendSuccess(res, req, { data: rooms });
});

/**
 * @desc Fetch paginated message history for a room
 * @route GET /api/v1/chat/rooms/:roomId/messages
 */
export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), MAX_LIMIT);
  const offset = Math.min(Math.max(parseInt(req.query.offset, 10) || 0, 0), MAX_OFFSET);

  const messages = await chatsService.getRoomMessages(req.user.id, roomId, limit, offset);
  return sendSuccess(res, req, { data: messages });
});
