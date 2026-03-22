import SearchService from "./search.service.js";

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const { q: query, limit, offset } = req.query;
      const userId = req.user.id;

      if (!query) {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }

      const results = await SearchService.searchAcrossAll({
        query,
        userId,
        limit,
        offset
      });

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
