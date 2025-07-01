import express from 'express';
import {createReview} from "../controllers/review.controller.js";
import {getReviewById} from "../controllers/review.controller.js";
import {getReviewByModuleCode} from "../controllers/review.controller.js";

const router = express.Router();

// @route POST /api/reviews
router.post('/', createReview);

// @route   GET /api/reviews/lookup/by-module?code=AC11001
router.get('/lookup/by-module', getReviewByModuleCode);

// @route   GET /api/reviews/:id
router.get('/:id', getReviewById);

export default router;