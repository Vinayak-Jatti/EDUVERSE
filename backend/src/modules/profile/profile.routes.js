import { Router } from "express";
import * as profileController from "./profile.controller.js";

const router = Router();

// ─── Public ───────────────────────────────────────
router.get("/:identifier", profileController.getProfile);

// ─── Protected ────────────────────────────────────
router.patch("/me", profileController.updateProfile);

export default router;
