import { v4 as uuidv4 } from "uuid";
import insightRepository from "./insight.repository.js";
import createError from "../../utils/ApiError.js";

export const createInsight = async (userId, content, visibility) => {
    if (!content || content.trim().length === 0) {
        throw createError("MISSING_FIELDS", "Insight content cannot be empty.");
    }
    if (content.length > 500) {
        throw createError("INVALID_INPUT", "Insight cannot exceed 500 characters.");
    }

    const insightData = {
        id: uuidv4(),
        user_id: userId,
        content: content.trim(),
        visibility: visibility || 'public'
    };

    return await insightRepository.createInsight(insightData);
};

export const deleteInsight = async (userId, insightId) => {
    const success = await insightRepository.deleteInsight(insightId, userId);
    if (!success) {
        throw createError("FORBIDDEN", "Not authorized or insight not found");
    }
    return { message: "Insight deleted successfully" };
};
