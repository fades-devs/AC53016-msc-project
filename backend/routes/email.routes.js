// backend/routes/email.routes.js
import express from "express";
import { sendReminderEmail } from "../controllers/email.controller.js";
import { getEmailsIncompleteReviews } from "../controllers/email.controller.js";

const router = express.Router();

// This will handle POST requests to /api/email/send
router.post("/send", sendReminderEmail);

router.get("/get/non-complete", getEmailsIncompleteReviews);

export default router;