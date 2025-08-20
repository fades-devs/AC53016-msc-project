import express from 'express';
import {getDashboardStats} from "../controllers/dashboard.controller.js";
import {getCountGoodPracticeByTheme} from "../controllers/dashboard.controller.js";
import {getCountEnhanceByTheme} from "../controllers/dashboard.controller.js";
import {getCountReviewByStatus} from "../controllers/dashboard.controller.js";

const router = express.Router();

// @route GET /api/dashboard/stats
router.get('/', getDashboardStats);

// @route GET /api/dashboard/stats/goodpractice-by-theme
router.get('/goodpractice-by-theme', getCountGoodPracticeByTheme)

// @route GET /api/dashboard/stats/enhancement-by-theme
router.get('/enhancement-by-theme', getCountEnhanceByTheme)

// @route GET /api/dashboard/stats/review-by-status
router.get('/review-by-status', getCountReviewByStatus)

export default router;