import * as insightService from "./insight.service.js";
import interactionRepository from "../feed/interaction.repository.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";

/**
 * Handle creating a new insight
 */
export const createInsight = asyncHandler(async (req, res) => {
    const { content, visibility } = req.body;
    const userId = req.user.id;

    const insight = await insightService.createInsight(userId, content, visibility);

    sendCreated(res, req, { message: "Insight created successfully", data: insight });
});

/**
 * Handle deleting an insight
 */
export const deleteInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;

    const result = await insightService.deleteInsight(userId, insightId);

    sendSuccess(res, req, { message: result.message });
});

/**
 * Like / Unlike triggers
 */
export const likeInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;
    await interactionRepository.addLike(userId, "insight", insightId);
    sendSuccess(res, req, { message: "Insight liked successfully" });
});

export const unlikeInsight = asyncHandler(async (req, res) => {
    const { insightId } = req.params;
    const userId = req.user.id;
    await interactionRepository.removeLike(userId, "insight", insightId);
    sendSuccess(res, req, { message: "Insight unliked successfully" });
});
