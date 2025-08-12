// backend/controllers/email.controller.js

import Review from "../models/review.model.js";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";

import { sendEmail } from "../utils/sendEmail.js";


// HERE I WILL PUT SOME COMMENTS TO EXPLAIN WHAT THEY NEED TO CHANGE TO SEND EMAILS BASED ON THE UNI NOT THE TESTING ONES
export const sendReminderEmail = async (req, res) => {

    const testEmails = ['fadoua.assoufi@gmail.com', 'fades.devs@gmail.com', 'fadouaes01@gmail.com'];

    try {

        // Fetch the list of emails directly from the database
        // This is a mock of calling another controller/service function
        // const mockRequest = {}; // Mock req/res if needed by the function
        // const mockResponse = {
        //     json: (data) => data,
        //     status : () => mockResponse
        // };
        // const sendTo = await getEmailsIncompleteReviews(mockRequest, mockResponse);
        // if (!sendTo || sendTo.length === 0) {
        //     return res.status(200).json({ success: true, message: "No incomplete reviews found. No emails sent." });
        // }

            const sendTo = testEmails;
            const senderDisplayName = "Module Review System"; // The name the recipient sees
            const subject = "Action Required: Annual Module Review Reminder";

            const reviewSystemLink = "http://localhost:5173/create-review"; // Link to app

            const message = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                /* Basic styles for compatibility */
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #dddddd;">
                        <tr>
                        <td align="center" style="background-color: #003c71; padding: 20px 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                            University of Dundee
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="font-size: 22px; margin: 0;">Annual Module Review Reminder</h1>
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">Dear Module Lead,</p>
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                            This is a friendly reminder that your annual module review for the current year is pending completion. Timely completion of these reviews is essential for our quality assurance processes.
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td align="center" style="padding: 20px 0;">
                                <a href="${reviewSystemLink}" style="background-color: #007bff; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Complete Your Review</a>
                                </td>
                            </tr>
                            </table>
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                            If you have any questions, please do not hesitate to contact the Quality and Academic Standards office.
                            </p>
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.5;">
                            Kind regards,
                            </p>
                            <p style="margin: 0; font-size: 16px; line-height: 1.5;">
                            <strong>The Module Review Team</strong>
                            </p>
                        </td>
                        </tr>
                        <tr>
                        <td align="center" style="background-color: #eeeeee; padding: 20px 30px; font-size: 12px; color: #666666;">
                            <p style="margin: 0;">University of Dundee, Nethergate, Dundee, DD1 4HN, Scotland, UK</p>
                            <p style="margin: 10px 0 0 0;">This is an automated message. Please do not reply directly to this email.</p>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
            </body>
            </html>
            `;
           
            await sendEmail(subject, message, sendTo, senderDisplayName);
            res.status(200).json({success: true, message: "Reminder Email Sent."})
        }

    catch (error) {
        res.status(500).json(error.message)
        }

}

// @route GET /api/email/incomplete
export const getEmailsIncompleteReviews = async (req, res) => {

    try {
        const now = new Date();
        const yearNumber = now.getFullYear();
        const startDate = new Date(yearNumber, 0, 1); // January 1st of the year

        const results = await Module.aggregate([

            // Stage 1: Look up all reviews for each module from this academic year
            {
                $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "module",
                pipeline: [
                    // Only consider reviews created within the current academic year
                    { $match: { createdAt: { $gte: startDate } } }
                ],
                as: "reviewsThisYear"
                }
            },
            // Stage 2: Filter for modules that DO NOT have a 'Completed' review
            {
                $match: {
                "reviewsThisYear.status": { $ne: "Completed" }
                }
            },
            // Stage 3: Join with the 'users' collection to get the lead's details
            {
                $lookup: {
                from: "users",
                localField: "lead", // Simplified: points directly to the lead on the module
                foreignField: "_id",
                as: "leadData"
                }
            },
            // Stage 4: Deconstruct leadData and handle missing leads
            {
                $unwind: {
                path: "$leadData",
                preserveNullAndEmptyArrays: true
                }
            },
            // Stage 5: Group by email to get a unique list of leads
            {
                $group: {
                _id: "$leadData.email"
                }
            },
            // Stage 7: Collect all unique emails into a single array
            {
                $group: {
                _id: null,
                emails: { $push: "$_id" }
                }
            }

            // // Deconstruct the variants array to check each one individually
            // {$unwind: '$variants'},
            // // Look up reviews for each specific variant created this year
            // {
            //     $lookup: {
            //         from: 'reviews', let: {moduleId: '$_id'},
            //         pipeline: [
            //             {
            //                 $match: {$expr: {$and: [{$eq: ['$module', '$$moduleId']},
            //                 {$gte: ['$createdAt', startDate]}]}}
            //             }
            //         ], as: 'reviewsThisYear'
            //     }
            // },
            // // Filter for modules that DO NOT have a 'Completed' review
            // {
            //     $match: {'reviewsThisYear.status': {$ne: 'Completed'}}
            // },
            // // Now that we have the modules needing reminders, we unwind their variants
            // {
            //     $unwind: '$variants'
            // },
            // // Join with the 'users' collection to get lead's details
            // {
            //     $lookup: {
            //         from: 'users', localField: 'variants.lead', foreignField: '_id', as: 'leadData'
            //     }
            // },
            // // Deconstruct leadData and handle missing leads
            // {
            //     $unwind: {path: '$leadData', preserveNullAndEmptyArrays: true}
            // },
            // // Filter out any variants without a valid lead
            // {
            //     $match: {'leadData.email': {$ne: null}}
            // },
            // // Group by email to get a unique list of leads
            // {
            //     $group: {_id: '$leadData.email'}
            // },
            // // Collect all unique emails into a single array
            // {
            //     $group: {_id: null, emails: {$push: '$_id'}}
            // }

            
        ]);

        const emails = results.length > 0 ? results[0].emails : [];
        res.status(200).json(emails);

    }
    catch (error) {
        console.log("Error getting emails for reminder: ", error);
        res.status(500).json({ message: "Server Error" });
    }
};


// @route GET /api/email/incomplete
export const getEmailsIncompleteReviewsOld = async (req, res) => {

    try {

        const results = await Review.aggregate([

            // Find all reviews that are not completed
            {
                $match: {status: {$in: ["Not Started", "In Progress"]}}
            },
            // Join with the 'modules' collection to get module data
            {
                $lookup: {
                    from: "modules",
                    localField: "module",
                    foreignField: "_id",
                    as: "moduleData"
                }
            },
            // Deconstruct the moduleData array
            {
                $unwind: {path: "$moduleData", preserveNullAndEmptyArrays: true}
            },
            // Deconstruct the variants array to get each variant as a separate doc
            {
                $unwind: '$moduleData.variants'
            },
            // Join with the 'users' collection to get the lead's details for EACH variant
            {
                $lookup: {
                    from: "users",
                    localField: "moduleData.variants.lead",
                    foreignField: "_id",
                    as: "leadData"
                }
            },
            // Deconstruct the leadData array
            {
                $unwind: {path: "$leadData", preserveNullAndEmptyArrays: true}
            },
            // Add a new stage to filter out any records where a lead wasn't found
            {
                $match: {
                "leadData": { $ne: null } // <-- CHANGE: Ensures we only process valid leads
                }
            },
            // Group by email to get a unique list of all leads
            {
                $group: { _id: '$leadData.email'}
            },
            // Collect all unique emails into a single array
            {
                $group: {_id: null, emails: {$push: '$_id'}}
            }
            // {
            //     $addFields: {
            //         leadName: { $ifNull: [{ $concat: ["$leadData.firstName", " ", "$leadData.lastName"] }, 'N/A'] },
            //         leadEmail: { $ifNull: ["$leadData.email", "N/A"]}
            //     }
            // },
            // {
            //     $project: {
            //         _id: 0, leadName: 1, leadEmail: 1
            //     }
            // }
        ]);

        const emails = results.length > 0 ? results[0].emails : [];
        res.status(200).json(emails);
    }
    catch (error) {
        console.log("Error in getting user emails for incomplete reviews: ", error);
        res.status(500).json({message: "Server Error", success: false});
    }

}