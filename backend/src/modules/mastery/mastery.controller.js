import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as masteryService from "./mastery.service.js";
import createError from "../../utils/ApiError.js";

/**
 * Handle Mastery Stream Initiation
 */
export const createMasteryStream = asyncHandler(async (req, res) => {
    const { body, visibility } = req.body;
    const file = req.file;

    if (!file) {
        throw createError("BAD_REQUEST", "Mastery Stream media is required");
    }

    const stream = await masteryService.initializeMasteryStream(req.user.id, {
        body,
        visibility,
        mediaUrl: file.path, // Cloudinary URL
        mimeType: file.mimetype
    });

    sendSuccess(res, req, { message: "Mastery Stream LIVE! 🚀", data: stream });
});

/**
 * Fetch Public Mastery Discovery Feed
 */
export const getDiscoveryFeed = asyncHandler(async (req, res) => {
    const streams = await masteryService.discoverPublicStreams();
    sendSuccess(res, req, { message: "Mastery Discovery Fetched", data: streams });
});

/**
 * Fetch My Mastery Streams
 */
export const getMyStreams = asyncHandler(async (req, res) => {
    const streams = await masteryService.getUserMasteryStreams(req.user.id);
    sendSuccess(res, req, { message: "My Mastery Streams Fetched", data: streams });
});
