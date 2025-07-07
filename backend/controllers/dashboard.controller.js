import Review from "../models/review.model.js";
import Module from "../models/module.model.js";


// @route GET /api/dashboard/stats/review-by-status
// /api/dashboard/stats/review-by-status?area=Computing
export const getReviewByStatus = async(req, res) => {
    try {
        const {area, level} = req.query;
        const matchStage = {};
        if (area) {matchStage['moduleData.area'] = area;}
        if (level) { matchStage['moduleData.level'] = parseInt(level) }

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
            {$match: matchStage},
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

// @route GET /api/dashboard/stats/goodpractice-by-theme
// /api/dashboard/stats/goodpractice-by-theme?level=5
export const getGoodPracticeByTheme = async(req, res) => {

    try {
        const {area, level, theme} = req.query;
        const matchStage = {};

        if (area) {matchStage['moduleData.area'] = area};
        if (level) { matchStage['moduleData.level'] = parseInt(level) }
        if (theme) {matchStage['goodPractice.theme'] = theme};

        const GoodPracticeByTheme = await Review.aggregate([
            {
                $lookup: {
                    from: "modules",
                    localField: "module",
                    foreignField: "_id",
                    as: "moduleData"
                }
            },
            {$unwind: "$moduleData"},
            {$match: matchStage},
            {$unwind: "$goodPractice"},
            {
                $group: {
                _id: "$goodPractice.theme",
                count: {$sum: 1}
                }
            },
            {
                $project: {
                    _id: 0,
                    theme: "$_id",
                    count: "$count"
                }
            }            
        ]);

        // if (theme) { pipeline.splice(4, 0, { $match: { 'goodPractice.theme': theme } }); }
        res.status(200).json(GoodPracticeByTheme);

    }

    catch(error) {
        console.error('Error in getting good practice by theme:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route GET /api/dashboard/stats/enhancement-by-theme
// /api/dashboard/stats/enhancement-by-theme?level=2
export const getEnhanceByTheme = async(req, res) => {

    try {

        const {area, level, theme} = req.query;
        const matchStage = {};

        if (area) {matchStage['moduleData.area'] = area};
        if (level) { matchStage['moduleData.level'] = parseInt(level) }
        if (theme) {matchStage['enhancePlans.theme'] = theme};

        const EnhanceByTheme = await Review.aggregate([
            {
                $lookup: {
                    from: "modules",
                    localField: "module",
                    foreignField: "_id",
                    as: "moduleData"
                }
            },
            {
                $unwind: "$moduleData"
            },
            {
                $match: matchStage
            },
            {
                $unwind: "$enhancePlans"
            },
            {
                $group: {
                _id: "$enhancePlans.theme",
                count: {$sum: 1}
                }
            },
            {
                $project: {
                    _id: 0,
                    theme: "$_id",
                    count: "$count"
                }
            }
            
        ]);

        // if (theme) { pipeline.splice(4, 0, { $match: { 'enhancePlans.theme': theme } }); }
        res.status(200).json(EnhanceByTheme);

    }

    catch(error) {
        console.error('Error in getting enhancements by theme:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route GET /api/dashboard/stats
export const getDashboardStats = async(req, res) => {

    try {
        const totalModules = await Module.countDocuments({});
        const totalReviews = await Review.countDocuments({status: 'Completed'});
        const completedModulesResult = await Module.aggregate([
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "module",
                    as: "reviewData"
                }
            },
            {
                $unwind: {path: "$reviewData", preserveNullAndEmptyArrays: true}
            },
            {
                $addFields: {
                    status: {$ifNull: ['$reviewData.status', 'Not Started']}
                }
            },
            {
                $match: {
                    status: "Completed"
                }
            },
            {
                $count: "CompletedCount"
            }
        ])

        const completedModules = completedModulesResult.length > 0 ? completedModulesResult[0].CompletedCount: 0;
        const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        res.status(200).json({totalModules, totalReviews, completionRate, completedModules});

    }
    catch (error) {
        console.error('Could not get dashboard statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }

}