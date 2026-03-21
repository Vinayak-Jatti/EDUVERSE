import { Router } from "express";
import * as contactController from "./contact.controller.js";
import { uploadResume } from "../../middlewares/upload.middleware.js";

const router = Router();

// Publicly exposed application ingress
// Handles binary signals (PDF/Docx) via Multer
router.post("/apply", uploadResume.single("resume"), contactController.apply);

export default router;
