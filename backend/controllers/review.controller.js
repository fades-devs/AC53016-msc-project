import Review from "../models/review.model.js";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";

// @route GET /api/reviews/noncomplete/emails
export const getEmailsNonCompleteReviews = async (req, res) => {

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

// @route GET /api/reviews?status=inprogress&status=notstarted
export const getReviewByStatus = async(req, res) => {
    try {

        const ReviewByStatus = await Review.aggregate([
            {
                $lookup: {
                    from: "modules",
                    localField: "module",
                    foreignField: "_id",
                    as: "moduleData"
                }
            },
            {$unwind: "$moduleData"},
            {
                $group: {
                _id: "$status",
                count: {$sum: 1}
                }
            },
            {
                $project: {_id: 0, name: "$_id", count: "$count"}
            }
        ])
        res.status(200).json(ReviewByStatus);

    }
    catch (error) {
        console.error('Error in getting reviews by status:', error);
        res.status(500).json({ message: 'Server error' });
    }

}


// @route   GET /api/reviews/lookup/by-module?code=AC11001&year=2025
export const getReviewByModuleCode = async(req, res) => {
    try {
        const {code, year} = req.query;
        if (!code) {return res.status(400).json({message: 'Module code required'});}
        
        // 1. Find the module by its code to get the _id
        const module = await Module.findOne({code: {$regex: new RegExp(`^${code}$`, 'i')}});
        if (!module) {
            console.log(match)
            return res.status(404).json({ message: 'Module not found' });}

        // 2. Build the filter for the Review query
        // Start with the base filter, which is the module's ID.
        const match = {module: module._id};
        // If a year is provided, add the date filter to the reviewFilter object.
        if (year) {
            const yearNumber = parseInt(year, 10); // Use a radix for safety
            // Add the date filter to the match object only if the year is a valid number
            if (!isNaN(yearNumber)) {
                const startDate = new Date(yearNumber, 0, 1);      // Jan 1st of the year
                const endDate = new Date(yearNumber + 1, 0, 1);  // Jan 1st of the next year
                match.date = { $gte: startDate, $lt: endDate };
            }
        }
        // 3. Find the review using the dynamically built + populate
        const review = await Review.findOne(match).populate({path: 'module', populate: {path: 'lead', select: 'firstName lastName'}})
        if (!review) {return res.status(404).json({ message: "No review has been submitted for this module yet." });}
        res.status(200).json(review);
    }
    catch (error) {
        console.error('Error finding review by module code:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/reviews/:id
export const getReviewById = async(req, res) => {

    try {
        const reviewId = req.params.id;
        if (!reviewId) {return res.status(400).json({message: 'Review ID required'});}

        // Find the review by its own _id -> populate module field then lead field
        const review = await Review.findById(reviewId).populate({path: 'module', populate: {path: 'lead', select: 'firstName lastName'}});
        if (!review) {return res.status(404).json({ message: 'Review not found' });}
        res.status(200).json(review);
    }
    catch (error) {
        console.error('Error finding review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/reviews
export const createReview = async(req, res) => {

    try {
        // Get module ID and review data from the request body
        const {moduleId, enhanceUpdate, studentAttainment, moduleFeedback, goodPractice, risks, enhancePlans} = req.body
        if (!moduleId) {return res.status(400).json({message: 'Module ID required'})};
        // Create review document
        const newReview = new Review({module: moduleId, enhanceUpdate, studentAttainment, moduleFeedback, goodPractice, risks, 
            enhancePlans, status: 'Completed'}); // Update status

        await newReview.save();
        res.status(201).json(newReview);
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
}