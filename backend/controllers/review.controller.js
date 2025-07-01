import Review from "../models/review.model.js";
import Module from "../models/module.model.js";


// @route   GET /api/reviews/lookup/by-module?code=AC11001
export const getReviewByModuleCode = async(req, res) => {
    try {
        const {code} = req.query;
        if (!code) {return res.status(400).json({message: 'Module code required'});}
    
        // Find the module by its code
        const module = await Module.findOne({code: {$regex: new RegExp(`^${code}$`, 'i')}});
        if (!module) {return res.status(404).json({ message: 'Module not found' });}

        // Find the review using found module's ID and populate
        const review = await Review.findOne({module: module._id}).populate({path: 'module', populate: {path: 'lead', select: 'firstName lastName'}})
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