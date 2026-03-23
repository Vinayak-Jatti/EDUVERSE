import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as searchService from "./search.service.js";

/**
 * Global Search Controller
 */
const SearchController = {
    /**
     * Perform cross-entity global search (Users, Posts, Squads)
     */
    async globalSearch(req, res) {
        const query = req.query.q || "";
        const userId = req.user.id; // Currently used to filter results (block logic etc)

        const results = await searchService.performGlobalSearch(query, userId);
        
        return sendSuccess(res, req, {
            message: "Global search results retrieved.",
            data: results
        });
    }
};

export default SearchController;
