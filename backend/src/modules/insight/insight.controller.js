import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as insightService from "./insight.service.js";

/**
 * Handle Insight Creation
 */
export const createInsight = asyncHandler(async (req, res) => {
    const { content, visibility } = req.body;
    const userId = req.user.id;

    const insight = await insightService.createInsight({ userId, content, visibility });
    return sendCreated(res, req, {
        message: "Micro-Insight Live! 🧠",
        data: insight
    });
});

/**
 * Handle Liking Insight
 */
export const likeInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;

    await insightService.toggleLike(userId, insightId, 'like');
    return sendSuccess(res, req, { message: "Insight liked." });
});

/**
 * Handle Unliking Insight
 */
export const unlikeInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;

    await insightService.toggleLike(userId, insightId, 'unlike');
    return sendSuccess(res, req, { message: "Insight unliked." });
});

/**
 * Handle Deleting Insight
 */
export const deleteInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;

    await insightService.deleteInsight(userId, insightId);
    return sendSuccess(res, req, { message: "Insight neutralized." });
});
