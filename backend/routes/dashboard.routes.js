import express from 'express';
import {getDashboardStats} from "../controllers/dashboard.controller.js";
import {getCountGoodPracticeByTheme} from "../controllers/dashboard.controller.js";
import {getCountEnhanceByTheme} from "../controllers/dashboard.controller.js";
import {getReviewByStatus} from "../controllers/dashboard.controller.js";

const router = express.Router();

// @route GET /api/dashboard/stats
router.get('/', getDashboardStats);
// @route GET /api/dashboard/stats/goodpractice-by-theme
// /api/dashboard/stats/goodpractice-by-theme?level=5
router.get('/goodpractice-by-theme', getCountGoodPracticeByTheme)
// @route GET /api/dashboard/stats/enhancement-by-theme
// /api/dashboard/stats/enhancement-by-theme?level=2
router.get('/enhancement-by-theme', getCountEnhanceByTheme)
// @route GET /api/dashboard/stats/review-by-status
// /api/dashboard/stats/review-by-status?area=Computing
router.get('/review-by-status', getReviewByStatus)

export default router;