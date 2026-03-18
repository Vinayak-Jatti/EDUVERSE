import { Router } from "express";
import { register } from "./auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import { registerValidation } from "./auth.validation.js";

const router = Router();

// ─── Public ───────────────────────────────────────
router.post("/register", authLimiter, registerValidation, register);

// ─── Protected ────────────────────────────────────

export default router;
