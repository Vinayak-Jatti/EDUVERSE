import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { 
  getMyChats, 
  getMessages, 
  sendMessage, 
  initialiseChat 
} from "./chats.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyChats);
router.get("/:conversationId/messages", getMessages);
router.post("/:conversationId/messages", sendMessage);
router.post("/start/:userId", initialiseChat);

export default router;
