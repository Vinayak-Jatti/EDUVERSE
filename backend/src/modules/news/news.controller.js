import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as newsService from "./news.service.js";

/**
 * Fetch Tech News & Intelligence (Education focus)
 */
export const getTechNewsList = asyncHandler(async (req, res) => {
    const { page } = req.query;
    const news = await newsService.fetchTechNews(page);
    sendSuccess(res, req, { message: "Tech Intelligence Fetched", data: news });
});
