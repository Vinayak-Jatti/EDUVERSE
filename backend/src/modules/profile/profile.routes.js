import { Router } from "express";
import * as profileController from "./profile.controller.js";
import { protect, optional } from "../../middlewares/auth.middleware.js";
import { uploadProfile } from "../../middlewares/upload.middleware.js";
import { updateProfileValidation } from "./profile.validation.js";
import validate from "../../middlewares/validate.middleware.js";

const router = Router();

// ─── Profile Retrieval ─────────────────────────────
router.get("/:identifier", optional, profileController.getProfile);
router.get("/:userId/followers", profileController.getFollowers);
router.get("/:userId/following", profileController.getFollowing);
router.get("/:userId/connections", profileController.getConnections);

// ─── Actions (Protected) ───────────────────────────
router.patch("/me", 
    protect, 
    uploadProfile.fields([{ name: "avatar", maxCount: 1 }, { name: "cover", maxCount: 1 }]), 
    updateProfileValidation, 
    validate, 
    profileController.updateProfile
);
router.post("/follow/:userId", protect, profileController.followUser);
router.delete("/follow/:userId", protect, profileController.unfollowUser);

export default router;
