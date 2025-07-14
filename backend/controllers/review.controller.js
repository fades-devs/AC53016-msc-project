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
export const getReviewByCodeAndYear = async(req, res) => {
    try {

        const {code, year} = req.query;
        if (!code) {return res.status(400).json({message: 'Module code required'});}
        
        // UPDATE: Find the module by its code to get the _id - within variants array
        const module = await Module.findOne({'variants.code': {$regex: new RegExp(`^${code}$`, 'i')}});
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });}

        // UPDATE: Build the filter for the Review query (year optional)
        // Start with the base filter, which is the module's ID.
        const match = {module: module._id};

        // If a year is provided, add the date filter to the reviewFilter object
        // We'll set a default to the current year if no year is passed
        const yearQuery = year ? parseInt(year, 10) : new Date().getFullYear();
        if (!isNaN(yearQuery)) {
            const startDate = new Date(yearQuery, 0, 1);      // Jan 1st of the year
            const endDate = new Date(yearQuery + 1, 0, 1);  // Jan 1st of the next year
            match.createdAt = { $gte: startDate, $lt: endDate };
        }

        // UPDATE: Find the review using the dynamically built + populate
        // The 'lead' field is inside the 'variants' array of the 'module' document.
        const review = await Review.findOne(match).populate({path: 'module', // Populate the 'module' field in the Review document
            populate:{
                path: 'variants.lead', // Within the now-populated module, populate the 'lead' field inside the 'variants' array
                select: 'firstName lastName email'} // Select which fields from the User model to include
            })

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
        const {moduleId, enhanceUpdate, studentAttainment, moduleFeedback, 
            statementEngagement, statementLearning, statementTimetable, completedBy} = req.body

        // --- PARSE STRINGIFIED ARRAYS ---
        const goodPractice = JSON.parse(req.body.goodPractice);
        const risks = JSON.parse(req.body.risks);
        const enhancePlans = JSON.parse(req.body.enhancePlans);

        if (!moduleId) {return res.status(400).json({message: 'Module ID required'})};

        // UPDATE: file uploads - Multer adds a file object to the request
        const evidenceUploadPath = req.files?.evidenceUpload?.[0]?.path;
        const evidenceUploadOriginalName = req.files?.evidenceUpload?.[0]?.originalname;
        const feedbackUploadPath = req.files?.feedbackUpload?.[0]?.path;
        const feedbackUploadOriginalName = req.files?.feedbackUpload?.[0]?.originalname;

        // Create review document - UPDATE WITH FILE FIELDS
        const newReview = new Review({module: moduleId, enhanceUpdate, studentAttainment, moduleFeedback, goodPractice, risks,
            statementEngagement, statementLearning, statementTimetable, completedBy, enhancePlans, status: 'Completed', // Update status
            evidenceUpload: evidenceUploadPath, feedbackUpload: feedbackUploadPath,
        evidenceUpload_originalName: evidenceUploadOriginalName, feedbackUpload_originalName: feedbackUploadOriginalName});

        await newReview.save();
        res.status(201).json(newReview);
    }

    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   POST /api/reviews/draft
export const saveDraft = async (req, res) => {

    try {

        // Get module ID and review data from the request body
        const {moduleId, enhanceUpdate, studentAttainment, moduleFeedback, 
            statementEngagement, statementLearning, statementTimetable, completedBy} = req.body

        // --- PARSE STRINGIFIED ARRAYS --- UPDATE: empty array if no input
        const goodPractice = req.body.goodPractice ? JSON.parse(req.body.goodPractice): [];
        const risks = req.body.risks ? JSON.parse(req.body.risks): [];
        const enhancePlans = req.body.enhancePlans ? JSON.parse(req.body.enhancePlans): [];

        if (!moduleId) {return res.status(400).json({message: 'Module ID required'})};

        // file uploads - Multer adds a file object to the request
        const evidenceUploadPath = req.files?.evidenceUpload?.[0]?.path;
        const evidenceUploadOriginalName = req.files?.evidenceUpload?.[0]?.originalname;
        const feedbackUploadPath = req.files?.feedbackUpload?.[0]?.path;
        const feedbackUploadOriginalName = req.files?.feedbackUpload?.[0]?.originalname;

        // Create review document - UPDATE FOR DRAFT SAVE
        const newDraftReview = new Review({module: moduleId,
            // Save any provided data, or default to an empty string/array
            enhanceUpdate: enhanceUpdate || '', studentAttainment: studentAttainment || '',
            moduleFeedback: moduleFeedback || '', goodPractice, risks, enhancePlans,
            statementEngagement: statementEngagement || null,
            statementLearning : statementLearning || null,
            statementTimetable: statementTimetable || null, completedBy: completedBy || '',
            status: 'In Progress', // Update status - ALWAYS SET TO IN PROGRESS
            evidenceUpload: evidenceUploadPath, feedbackUpload: feedbackUploadPath,
        evidenceUpload_originalName: evidenceUploadOriginalName, feedbackUpload_originalName: feedbackUploadOriginalName});

        await newDraftReview.save();
        res.status(201).json({review: newDraftReview, message: 'Draft saved successfully.'});
    }

    catch (error) {
        console.error('Error saving draft review:', error);
        res.status(500).json({ message: 'Server error' });
    }
} 