import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { registerValidation } from "../validations/auth.validation.js";

const router = Router();

// ─── Public ───────────────────────────────────────
router.post("/register", authLimiter, registerValidation, register);

// ─── Protected ────────────────────────────────────

export default router;
