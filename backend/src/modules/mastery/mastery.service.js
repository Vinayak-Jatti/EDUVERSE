import { v4 as uuidv4 } from "uuid";
import * as masteryRepository from "./mastery.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Handle Mastery Stream Creation (Dedicated Logic)
 */
export const initializeMasteryStream = async (userId, { body, mediaUrl, mimeType, visibility }) => {
    // Mastery Streams are strictly videos
    const mediaType = "video";
    // but manage it through this dedicated Mastery layer.
    const masteryData = {
        userId,
        body: body || null,
        mediaUrl,
        mediaType,
        mimeType,
        visibility: visibility || "public"
    };

    return await masteryRepository.createMasteryStream(masteryData);
};

/**
 * Discovery Logic for Public Mastery Streams
 */
export const discoverPublicStreams = async () => {
    return await masteryRepository.getPublicMasteryStreams();
};

/**
 * Fetch User-Specific Mastery Streams
 */
export const getUserMasteryStreams = async (userId) => {
    return await masteryRepository.getMasteryStreamsByUserId(userId);
};
