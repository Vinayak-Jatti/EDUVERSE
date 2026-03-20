import { v4 as uuidv4 } from "uuid";
import squadRepository from "./squad.repository.js";
import createError from "../../utils/ApiError.js";

export const createSquad = async (userId, data) => {
    if (!data.name || data.name.trim().length === 0) {
        throw createError("MISSING_FIELDS", "Squad name is required.");
    }
    
    const squadId = uuidv4();
    const squadData = {
        id: squadId,
        name: data.name.trim(),
        description: data.description || null,
        avatar_url: data.avatar_url || null,
        visibility: data.visibility || 'public',
        created_by: userId
    };

    return await squadRepository.create(squadData);
};

export const getSquad = async (squadId) => {
    const squad = await squadRepository.findById(squadId);
    if (!squad) throw createError("NOT_FOUND", "Squad not found.");
    return squad;
};

export const joinSquad = async (userId, squadId) => {
    const squad = await squadRepository.getMembership(squadId, userId);
    if (squad) throw createError("ALREADY_EXISTS", "Already a member of this squad.");

    const targetSquad = await squadRepository.findById(squadId);
    if (!targetSquad) throw createError("NOT_FOUND", "Squad not found.");

    return await squadRepository.addMember(squadId, userId, 'member');
};

export const leaveSquad = async (userId, squadId) => {
    const membership = await squadRepository.getMembership(squadId, userId);
    if (!membership) throw createError("NOT_FOUND", "Not a member of this squad.");

    // Prevent owner from leaving without passing ownership (Enterprise Standard)
    if (membership.role === 'owner') {
        throw createError("FORBIDDEN", "Owner cannot leave squad. Transfer ownership or delete squad.");
    }

    return await squadRepository.removeMember(squadId, userId);
};

export const fetchPublicSquads = async ({ limit, offset }) => {
    return await squadRepository.findAll({ limit, offset, visibility: 'public' });
};

export const fetchUserSquads = async (userId) => {
    return await squadRepository.getUserSquads(userId);
};
