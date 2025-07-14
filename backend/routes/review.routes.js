import express from 'express';
import {createReview, getReviewByCodeAndYear, saveDraft} from "../controllers/review.controller.js";
import {getReviewById} from "../controllers/review.controller.js";
import {getEmailsNonCompleteReviews} from "../controllers/review.controller.js";

import {upload} from '../middleware/upload.js'; // import upload middleware

const router = express.Router();

// @route GET /api/reviews/noncomplete/emails
router.get('/noncomplete/emails', getEmailsNonCompleteReviews)

// @route POST /api/reviews - UPDATE: add upload middleware
router.post('/', upload, createReview);

// @route POST /api/reviews/draft - UPDATE: for partial save
router.post('/draft', upload, saveDraft)

// @route   GET /api/reviews/lookup/by-module?code=AC11001&year=2025
router.get('/lookup/by-module', getReviewByCodeAndYear);

// @route   GET /api/reviews/:id
router.get('/:id', getReviewById);

export default router;