// backend/controllers/email.controller.js

import Review from "../models/review.model.js";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";

import { sendEmail } from "../utils/sendEmail.js";

export const sendReminderEmail = async (req, res) => {

    try {
            const sendTo = "fadoua.assoufi@gmail.com";
            const senderDisplayName = "Module Project"; // The name the recipient sees
            const subject = "Test Subject";
            const message = `
                <h1>Hello</h1>
                <p>This is the email body for testing.</p>
                <p>Regards,</p>
                `
            await sendEmail(subject, message, sendTo, senderDisplayName);
            res.status(200).json({success: true, message: "Email Sent."})
        }

    catch (error) {
        res.status(500).json(error.message)
        }

}

// @route GET /api/reviews/noncomplete/emails
export const getEmailsIncompleteReviews = async (req, res) => {

    try {

        const EmailsNonCompleteReviews = await Review.aggregate([
            {
                $match: {status: {$in: ["Not Started", "In Progress"]}}
            },
            {
                $lookup: {
                    from: "modules",
                    localField: "module",
                    foreignField: "_id",
                    as: "moduleData"
                }
            },
            {
                $unwind: {path: "$moduleData", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "moduleData.lead",
                    foreignField: "_id",
                    as: "leadData"
                }
            },
            {
                $unwind: {path: "$leadData", preserveNullAndEmptyArrays: true}
            },
            {
                $addFields: {
                    leadName: { $ifNull: [{ $concat: ["$leadData.firstName", " ", "$leadData.lastName"] }, 'N/A'] },
                    leadEmail: { $ifNull: ["$leadData.email", "N/A"]}
                }
            },
            {
                $project: {
                    _id: 0, leadName: 1, leadEmail: 1
                }
            }
        ])
        res.status(200).json(EmailsNonCompleteReviews);

    }
    catch (error) {
        console.log("Error in getting user emails for non complete reviews: ", error);
        res.status(500).json({message: "Server Error", success: false});
    }

}