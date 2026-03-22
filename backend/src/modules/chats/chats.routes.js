import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { createOrFetchRoom, getMyRooms, getRoomMessages } from "./chats.controller.js";

const router = express.Router();

// 12. Apply JWT middleware to all chat REST routes
router.use(protect);

// 5. Build REST API: POST /chat/rooms — create or fetch a chat room
router.post("/rooms", createOrFetchRoom);

// 7. Build REST API: GET /chat/rooms — list all rooms for logged-in user
router.get("/rooms", getMyRooms);

// 6. Build REST API: GET /chat/rooms/:roomId/messages — fetch paginated message history
router.get("/rooms/:roomId/messages", getRoomMessages);

export default router;
