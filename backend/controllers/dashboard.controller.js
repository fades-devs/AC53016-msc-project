import Review from "../models/review.model.js";
import Module from "../models/module.model.js";


// @route GET /api/dashboard/stats/review-by-status
// /api/dashboard/stats/review-by-status?area=Computing&year=2023
export const getCountReviewByStatus = async (req, res) => {
    try {
        const { year, area } = req.query;

        // --- YEAR FILTER LOGIC ---
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
        
        const pipeline = [];

        // Stage 1: Filter modules by area first.
        if (area) {
            pipeline.push({ $match: { area: area } });
        }

        // STAGE 2: LOOKUP REVIEWS
        // Look up reviews for each module that fall within the target year.
        const lookupPipeline = [
            { $match: { $expr: { $eq: ["$module", "$$moduleId"] } } }
        ];

        // The year filter is now always active.
        if (!isNaN(targetYear)) {
            const startDate = new Date(targetYear, 0, 1);
            const endDate = new Date(targetYear + 1, 0, 1);
            lookupPipeline.push({
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            });
        }

        pipeline.push({
            $lookup: {
                from: "reviews",
                let: { moduleId: "$_id" },
                pipeline: lookupPipeline,
                as: "relevantReviews"
            }
        });

        // Stage 3: Determine the consolidated status for each module.
        pipeline.push({
            $addFields: {
                status: {
                    $ifNull: [
                        {
                            $cond: {
                                if: { $in: ["Completed", "$relevantReviews.status"] },
                                then: "Completed",
                                else: {
                                    $cond: {
                                        if: { $in: ["In Progress", "$relevantReviews.status"] },
                                        then: "In Progress",
                                        else: "Not Started"
                                    }
                                }
                            }
                        },
                        "Not Started" // Catches modules with no reviews
                    ]
                }
            }
        });

        // Stage 4: Group all the modules by their calculated status and count them.
        pipeline.push({
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        });

        // Stage 5: Format the output.
        pipeline.push({
            $project: {
                _id: 0,
                name: "$_id",
                value: "$count"
            }
        });

        const reviewCountByStatus = await Module.aggregate(pipeline);
        res.status(200).json(reviewCountByStatus);

    } catch (error) {
        console.error('Error getting reviews by status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route GET /api/dashboard/stats/goodpractice-by-theme
// /api/dashboard/stats/goodpractice-by-theme?year=2023&area=Computing
export const getCountGoodPracticeByTheme = async(req, res) => {

    try {
        const {area, year} = req.query;

        const pipeline = [];

        // (Optional) Filter reviews by year.
        if (year) {
            const yearNumber = parseInt(year, 10);
            if (!isNaN(yearNumber)) {
                const startDate = new Date(yearNumber, 0, 1);
                const endDate = new Date(yearNumber + 1, 0, 1);
                pipeline.push({
                    $match: {
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                });
            }
        }

        // Join with the modules collection to get metadata like area.
        pipeline.push({
            $lookup: {
                from: "modules",
                localField: "module",
                foreignField: "_id",
                as: "moduleData"
            }
        });

        // Deconstruct the moduleData array. A review is linked to one module
        pipeline.push({ $unwind: "$moduleData" });

        // Filter by the module's area
        if (area) {
            pipeline.push({
                $match: {
                    'moduleData.area': area
                }
            });
        }

        // Deconstruct the goodPractice array to count each theme instance
        // If a review has no goodPractice items, it will be filtered out here.
        pipeline.push({ $unwind: "$goodPractice" });

        // Group by the theme and count occurrences.
        pipeline.push({
            $group: {
                _id: "$goodPractice.theme",
                count: { $sum: 1 }
            }
        });

        // Format the final output.
        pipeline.push({
            $project: {
                _id: 0,
                theme: "$_id",
                count: "$count"
            }
        });

        const CountgoodPracticeByTheme = await Review.aggregate(pipeline);

        res.status(200).json(CountgoodPracticeByTheme);

    }

    catch(error) {
        console.error('Error in getting good practice by theme:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route GET /api/dashboard/stats/enhancement-by-theme
// /api/dashboard/stats/enhancement-by-theme?year=2023&area=Computing
export const getCountEnhanceByTheme = async(req, res) => {

    try {

        // filter logic
        const { year, area } = req.query;

        const pipeline = [];

        // Filter reviews by year ONLY if the 'year' param is provided..
        if (year) {
            const yearNumber = parseInt(year, 10);
            // Only add the filter if the provided year is a valid number
            if (!isNaN(yearNumber)) {
                const startDate = new Date(yearNumber, 0, 1);
                const endDate = new Date(yearNumber + 1, 0, 1);
                pipeline.push({
                    $match: {
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                });
            }
        }

        // Join with the modules collection to get metadata like 'area'
        pipeline.push({
            $lookup: {
                from: "modules",
                localField: "module",
                foreignField: "_id",
                as: "moduleData"
            }
        });

        pipeline.push({ $unwind: "$moduleData" });

        // Filter by the module's area.
        if (area) {
            pipeline.push({
                $match: {
                    'moduleData.area': area
                }
            });
        }

        // Deconstruct the enhancePlans array.
        pipeline.push({ $unwind: "$enhancePlans" });

        // Group by the theme and count occurrences.
        pipeline.push({
            $group: {
                _id: "$enhancePlans.theme",
                count: { $sum: 1 }
            }
        });

        // Format the final output.
        pipeline.push({
            $project: {
                _id: 0,
                theme: "$_id",
                count: "$count"
            }
        });

        const enhanceCountByTheme = await Review.aggregate(pipeline);

        res.status(200).json(enhanceCountByTheme);

    }

    catch(error) {
        console.error('Error in getting enhancements by theme:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/dashboard/stats?year=2025
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Determine the target year from query param, or default to the current.
        const { year, area } = req.query;
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

        const moduleMatch = {};
        if (area) {
            // Now supports multiple areas.
            const areas = Array.isArray(area) ? area : [area];
            moduleMatch.area = { $in: areas };
        }

        // 2. Define the start and end dates for the target year.
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

        const statsPipeline = [
            // Stage 1: Filter modules by area if provided
            { $match: moduleMatch },
            
            // Stage 2: Look up reviews for each module within the target year
            {
                $lookup: {
                    from: "reviews",
                    let: { moduleId: "$_id" },
                    pipeline: [
                        { 
                            $match: {
                                $expr: { $eq: ["$module", "$$moduleId"] },
                                createdAt: { $gte: startDate, $lt: endDate }
                            } 
                        }
                    ],
                    as: "reviewsThisYear"
                }
            },
            
            // Stage 3: Determine the status of the most recent review for the year
            {
                $addFields: {
                    lastReview: { $arrayElemAt: ["$reviewsThisYear", -1] }
                }
            },
            {
                $addFields: {
                    status: { $ifNull: ["$lastReview.status", "Not Started"] }
                }
            },
            
            // Stage 4: Group everything to calculate all stats at once
            {
                $group: {
                    _id: null, // Group all documents into one
                    totalModules: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    },
                }
            },

            // Stage 5: Calculate final values and format the output
            {
                $project: {
                    _id: 0,
                    totalModules: 1,
                    reviewsForYear: "$completed",
                    pendingForYear: { $subtract: ["$totalModules", "$completed"] },
                    completionRate: {
                        $cond: [
                            { $eq: ["$totalModules", 0] },
                            0,
                            { $multiply: [{ $divide: ["$completed", "$totalModules"] }, 100] }
                        ]
                    }
                }
            }
        ];

        const results = await Module.aggregate(statsPipeline);

        // Handle case where no modules match the filter
        if (results.length === 0) {
            return res.status(200).json({
                year: targetYear,
                totalModules: 0,
                reviewsForYear: 0,
                pendingForYear: 0,
                completionRate: 0,
            });
        }
        
        // Send the final, structured response
        res.status(200).json({
            year: targetYear,
            ...results[0]
        });

    } catch (error) {
        console.error('Could not get dashboard statistics:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats.' });
    }
};
