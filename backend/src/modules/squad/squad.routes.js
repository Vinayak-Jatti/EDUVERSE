import { Router } from "express";
import * as squadController from "./squad.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public Discovery (Auth optional for listing, but we use protect for now for enterprise level access)
router.get("/public", protect, squadController.getPublicSquads);

// User-specific squads
router.get("/my", protect, squadController.getUserSquads);

// Detail View
router.get("/:id", protect, squadController.getSquadDetail);

// Squad Manipulation
router.post("/", protect, squadController.createSquad);
router.post("/:id/join", protect, squadController.joinAction);
router.post("/:id/leave", protect, squadController.leaveAction);

export default router;
