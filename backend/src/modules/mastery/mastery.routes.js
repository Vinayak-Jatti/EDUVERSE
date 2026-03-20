import { Router } from "express";
import * as masteryController from "./mastery.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { masteryStreamUploader } from "../../middlewares/upload.middleware.js";

const router = Router();

// Mastery Stream Discovery (Public)
router.get("/discovery", protect, masteryController.getDiscoveryFeed);

// My Mastery Streams
router.get("/my", protect, masteryController.getMyStreams);

// Mastery Stream Initiation (Independent Upload)
router.post("/", protect, masteryStreamUploader.single("media"), masteryController.createMasteryStream);

export default router;
