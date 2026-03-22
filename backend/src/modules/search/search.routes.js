import { Router } from "express";
import SearchController from "./search.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, SearchController.globalSearch.bind(SearchController));

export default router;
