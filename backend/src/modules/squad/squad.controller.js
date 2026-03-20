import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as squadService from "./squad.service.js";

/**
 * Handle squad discovery (Public)
 */
export const getPublicSquads = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const squads = await squadService.fetchPublicSquads({ 
        limit: parseInt(limit) || 20, 
        offset: parseInt(offset) || 0 
    });
    sendSuccess(res, req, { message: "Public squads fetched", data: squads });
});

/**
 * Handle fetching user's squads
 */
export const getUserSquads = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const squads = await squadService.fetchUserSquads(userId);
    sendSuccess(res, req, { message: "User squads fetched", data: squads });
});

/**
 * Handle squad creation
 */
export const createSquad = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, description, visibility, avatar_url } = req.body;
    
    // In enterprise mode, handle avatar from req.file if using middleware
    const avatar = req.file ? req.file.path : avatar_url;

    const squad = await squadService.createSquad(userId, { name, description, visibility, avatar_url: avatar });
    sendCreated(res, req, { message: "Squad created successfully", data: squad });
});

/**
 * Detail view of a squad
 */
export const getSquadDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const squad = await squadService.getSquad(id);
    sendSuccess(res, req, { message: "Squad detail fetched", data: squad });
});

/**
 * Join squad action
 */
export const joinAction = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id: squadId } = req.params;
    await squadService.joinSquad(userId, squadId);
    sendSuccess(res, req, { message: "Joined squad successfully" });
});

/**
 * Leave squad action
 */
export const leaveAction = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id: squadId } = req.params;
    await squadService.leaveSquad(userId, squadId);
    sendSuccess(res, req, { message: "Left squad successfully" });
});
