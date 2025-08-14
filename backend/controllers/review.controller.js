import Review from "../models/review.model.js";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";


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
        const module = await Module.findOne({'code': {$regex: new RegExp(`^${code}$`, 'i')}});
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

        // Find the review using the dynamically built + populate
        const review = await Review.findOne(match).populate({path: 'module', // Populate the 'module' field
            populate:{
                path: 'lead', // Within the now-populated module
                select: 'firstName lastName email'} // fields from the User model to include
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
        const review = await Review.findById(reviewId).
        populate({path: 'module', model: 'Module', populate: {path: 'lead', model: 'User', select: 'firstName lastName email'}});

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

        // Multer adds a file object to the request
        const evidenceUploadPath = req.files?.evidenceUpload?.[0]?.path;
        const evidenceUploadOriginalName = req.files?.evidenceUpload?.[0]?.originalname;
        const feedbackUploadPath = req.files?.feedbackUpload?.[0]?.path;
        const feedbackUploadOriginalName = req.files?.feedbackUpload?.[0]?.originalname;

        // Create review document
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
            evidenceUpload_originalName: evidenceUploadOriginalName,
            feedbackUpload_originalName: feedbackUploadOriginalName});

        await newDraftReview.save();
        res.status(201).json({review: newDraftReview, message: 'Draft saved successfully.'});
    }

    catch (error) {
        console.error('Error saving draft review:', error);
        res.status(500).json({ message: 'Server error' });
    }
} 


// @route PUT /api/reviews/:id
export const UpdateReview = async (req, res) => {

    try {

        // Get review ID from URL request parameter
        const {id: reviewId} = req.params;

        // --- FIX: Destructure body with a fallback to prevent crash if req.body is undefined ---
        // This ensures `body` is always an object, even if the middleware fails to create req.body.
        const { body = {} } = req;

        // --- Build the update object defensively to prevent crashes ---
        const updateData = {};

        // if review date is older than current year - do not allow to edit
        const review = await Review.findById(reviewId);

        if (!review) {
             return res.status(404).json({ message: 'Review not found, could not update.' });
        }

        const reviewYear = review.createdAt.getFullYear();
        if (reviewYear < new Date().getFullYear()) {
            return res.status(400).json({message: 'Reviews from previous years cannot be updated.'})
        }

        // // Add fields to the update object ONLY if they exist in the request body
        // if (req.body.enhanceUpdate) updateData.enhanceUpdate = req.body.enhanceUpdate;
        // if (req.body.studentAttainment) updateData.studentAttainment = req.body.studentAttainment;
        // if (req.body.moduleFeedback) updateData.moduleFeedback = req.body.moduleFeedback;
        // if (req.body.status) updateData.status = req.body.status;
        // if (req.body.statementEngagement) updateData.statementEngagement = req.body.statementEngagement;
        // if (req.body.statementLearning) updateData.statementLearning = req.body.statementLearning;
        // if (req.body.statementTimetable) updateData.statementTimetable = req.body.statementTimetable;
        // if (req.body.completedBy) updateData.completedBy = req.body.completedBy;


        // Add fields to the update object ONLY if they exist in the request body.
        if (body.enhanceUpdate) updateData.enhanceUpdate = body.enhanceUpdate;
        if (body.studentAttainment) updateData.studentAttainment = body.studentAttainment;
        if (body.moduleFeedback) updateData.moduleFeedback = body.moduleFeedback;
        if (body.status) updateData.status = body.status;
        if (body.statementEngagement) updateData.statementEngagement = body.statementEngagement;
        if (body.statementLearning) updateData.statementLearning = body.statementLearning;
        if (body.statementTimetable) updateData.statementTimetable = body.statementTimetable;
        if (body.completedBy) updateData.completedBy = body.completedBy;

        // // Safely parse JSON fields only if they exist
        // if (req.body.goodPractice) updateData.goodPractice = JSON.parse(req.body.goodPractice);
        // if (req.body.risks) updateData.risks = JSON.parse(req.body.risks);
        // if (req.body.enhancePlans) updateData.enhancePlans = JSON.parse(req.body.enhancePlans);

        // Safely parse JSON fields only if they exist
        if (body.goodPractice) updateData.goodPractice = JSON.parse(body.goodPractice);
        if (body.risks) updateData.risks = JSON.parse(body.risks);
        if (body.enhancePlans) updateData.enhancePlans = JSON.parse(body.enhancePlans);
        
        // Handle file uploads from req.files, which is handled separately by multer
        // Add file paths to the update object ONLY if new files were uploaded
        // This prevents overwriting existing files with 'undefined' if no new file is sent
        if (req.files?.evidenceUpload?.[0]) {
            updateData.evidenceUpload = req.files.evidenceUpload[0].path;
            updateData.evidenceUpload_originalName = req.files.evidenceUpload[0].originalname;
        }
        if (req.files?.feedbackUpload?.[0]) {
            updateData.feedbackUpload = req.files.feedbackUpload[0].path;
            updateData.feedbackUpload_originalName = req.files.feedbackUpload[0].originalname;
        }

        // Find the review by its ID and update it with the new data
        // new: true tells Mongoose to return the document *after* the update has been applied
        const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
        
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found, could not update.' });
        }

        res.status(200).json({ review: updatedReview, message: 'Review updated successfully' });

        // // Get review data from request body
        // const {enhanceUpdate, studentAttainment, moduleFeedback, status, // completed or in progress sent from frontend
        //     statementEngagement, statementLearning, statementTimetable, completedBy} = req.body

        // const goodPractice = req.body.goodPractice ? JSON.parse(req.body.goodPractice): [];
        // const risks = req.body.risks ? JSON.parse(req.body.risks): [];
        // const enhancePlans = req.body.enhancePlans ? JSON.parse(req.body.enhancePlans): [];

        // // build object with data to update
        // const updateData = {enhanceUpdate, studentAttainment, moduleFeedback, status, // set new status
        //     statementEngagement, statementLearning, statementTimetable, completedBy,
        //     goodPractice, risks, enhancePlans}

        // // add file paths to the update object ONLY if new files were uploaded (prevent overwriting existing files)
        // if (req.files?.evidenceUpload?.[0]) {
        //     updateData.evidenceUpload = req.files?.evidenceUpload?.[0]?.path;
        //     updateData.evidenceUpload_originalName = req.files?.evidenceUpload?.[0]?.originalname;
        // }
        // if (req.files?.feedbackUpload?.[0]) {
        //     updateData.feedbackUpload = req.files?.feedbackUpload?.[0]?.path;
        //     updateData.feedbackUpload_originalName = req.files?.feedbackUpload?.[0]?.originalname;
        // }
        
        // // Find the review by its ID and update it with the new data.
        // // { new: true } option tells Mongoose to return the document *after* the update applied
        // const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {new: true});

        // // If no review was found with that ID, return a 404 error.
        // if (!updatedReview) {
        //     return res.status(404).json({ message: 'Review not found, could not update.' });
        // }

        // // send success response with updated review data
        // res.status(200).json({review: updatedReview, message: 'Review updated successfully'});

    }
    catch (error) {
        // This log is critical. Check your server's console for the detailed error message.
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server error while updating review.' });
    }
}