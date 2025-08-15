import Review from "../models/review.model.js";
import Module from "../models/module.model.js";


// @route GET /api/dashboard/stats/review-by-status
// /api/dashboard/stats/review-by-status?area=Computing&year=2023
// /api/dashboard/stats/review-by-status -> Defaults to the current year
export const getCountReviewByStatus = async (req, res) => {
    try {
        const { year, area } = req.query;

        // --- YEAR FILTER LOGIC ---
        // Default to the current year if no year is specified.
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
        
        const pipeline = [];

        // --- Start with Modules, not Reviews ---

        // Stage 1: (Optional) Filter modules by area first for efficiency.
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

        // Stage 5: Format the output for a pie chart library.
        pipeline.push({
            $project: {
                _id: 0,
                name: "$_id",
                value: "$count"
            }
        });

        const reviewCountByStatus = await Module.aggregate(pipeline);
        res.status(200).json(reviewCountByStatus);


        // // Stage 2: Deconstruct the variants array to create a document for each variant.
        // pipeline.push({ $unwind: "$variants" });

        // // Stage 3: Look up reviews for each variant's parent module that fall within the target year.
        // if (!isNaN(targetYear)) {
        //     const startDate = new Date(targetYear, 0, 1);
        //     const endDate = new Date(targetYear + 1, 0, 1);
        //     pipeline.push({
        //         $lookup: {
        //             from: "reviews",
        //             let: { moduleId: "$_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$module", "$$moduleId"] },
        //                                 { $gte: ["$createdAt", startDate] },
        //                                 { $lt: ["$createdAt", endDate] }
        //                             ]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "reviewsInYear"
        //         }
        //     });
        // }

        // // Stage 4: Determine the consolidated status for each variant based on its reviews for the year.
        // pipeline.push({
        //     $addFields: {
        //         status: {
        //             $ifNull: [
        //                 {
        //                     $cond: {
        //                         if: { $in: ["Completed", "$reviewsInYear.status"] },
        //                         then: "Completed",
        //                         else: {
        //                             $cond: {
        //                                 if: { $in: ["In Progress", "$reviewsInYear.status"] },
        //                                 then: "In Progress",
        //                                 else: "Not Started"
        //                             }
        //                         }
        //                     }
        //                 },
        //                 "Not Started" // This catches variants with no reviews in the year
        //             ]
        //         }
        //     }
        // });

        // // Stage 5: Group all the variants by their calculated status and count them.
        // pipeline.push({
        //     $group: {
        //         _id: "$status",
        //         count: { $sum: 1 }
        //     }
        // });

        // // Stage 6: Format the output for a pie chart library.
        // pipeline.push({
        //     $project: {
        //         _id: 0,
        //         name: "$_id",
        //         value: "$count"
        //     }
        // });

        // // We must start the aggregation from the Module collection.
        // const reviewCountByStatus = await Module.aggregate(pipeline);

        // res.status(200).json(reviewCountByStatus);

    } catch (error) {
        console.error('Error getting reviews by status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// export const getCountReviewByStatus = async(req, res) => {
//     try {
//         const {area, year} = req.query;

//         // --- YEAR FILTER LOGIC ---
//         // Default to the current year if no year is specified.
//         const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
        
//         const pipeline = [];

//         // Filter reviews by the target year. This is always active.
//         // Check if targetYear is a valid number before creating dates.
//         if (!isNaN(targetYear)) {
//             const startDate = new Date(targetYear, 0, 1);
//             const endDate = new Date(targetYear + 1, 0, 1);
//             pipeline.push({
//                 $match: {
//                     createdAt: { $gte: startDate, $lt: endDate }
//                 }
//             });
//         }

//         // (Optional) If an area is specified, join with modules to filter.
//         if (area) {
//             pipeline.push(
//                 {
//                     $lookup: {
//                         from: "modules",
//                         localField: "module",
//                         foreignField: "_id",
//                         as: "moduleData"
//                     }
//                 },
//                 { $unwind: "$moduleData" },
//                 {
//                     $match: {
//                         'moduleData.area': area
//                     }
//                 }
//             );
//         }


//         // Group the filtered reviews by their status.
//         pipeline.push({
//             $group: {
//                 _id: "$status",
//                 count: { $sum: 1 }
//             }
//         });

//         // Format the output for a pie chart library.
//         pipeline.push({
//             $project: {
//                 _id: 0,
//                 name: "$_id", // 'name' or 'label' is common for charts
//                 value: "$count" // 'value' is also common
//             }
//         });

//         const reviewCountByStatus = await Review.aggregate(pipeline);

//         res.status(200).json(reviewCountByStatus);

//         // const matchStage = {};
//         // if (area) {matchStage['moduleData.area'] = area;}
//         // if (level) { matchStage['moduleData.level'] = parseInt(level) }

//         // const ReviewByStatus = await Review.aggregate([
//         //     {
//         //         $lookup: {
//         //             from: "modules",
//         //             localField: "module",
//         //             foreignField: "_id",
//         //             as: "moduleData"
//         //         }
//         //     },
//         //     {$unwind: "$moduleData"},
//         //     {$match: matchStage},
//         //     {
//         //         $group: {
//         //         _id: "$status",
//         //         count: {$sum: 1}
//         //         }
//         //     },
//         //     {
//         //         $project: {_id: 0, name: "$_id", count: "$count"}
//         //     }
//         // ])
//         // res.status(200).json(ReviewByStatus);

//     }
//     catch (error) {
//         console.error('Error in getting reviews by status:', error);
//         res.status(500).json({ message: 'Server error' });
//     }

// }

// @route GET /api/dashboard/stats/goodpractice-by-theme
// /api/dashboard/stats/goodpractice-by-theme?year=2023&area=Computing
export const getCountGoodPracticeByTheme = async(req, res) => {

    try {
        const {area, year} = req.query;

        const pipeline = [];

        // (Optional) Filter reviews by year. efficient first step.
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

        // (Optional) Filter by the module's area
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

        // Format the final output for the chart.
        pipeline.push({
            $project: {
                _id: 0,
                theme: "$_id",
                count: "$count"
            }
        });
        
        // // Sort for a consistent and readable chart.
        // pipeline.push({
        //      $sort: { count: -1 } // Sort by count descending
        // });

        const CountgoodPracticeByTheme = await Review.aggregate(pipeline);

        res.status(200).json(CountgoodPracticeByTheme);


        // const matchStage = {};

        // if (area) {matchStage['moduleData.area'] = area};
        // if (level) { matchStage['moduleData.level'] = parseInt(level) }
        // if (theme) {matchStage['goodPractice.theme'] = theme};

        // const GoodPracticeByTheme = await Review.aggregate([
        //     {
        //         $lookup: {
        //             from: "modules",
        //             localField: "module",
        //             foreignField: "_id",
        //             as: "moduleData"
        //         }
        //     },
        //     {$unwind: "$moduleData"},
        //     {$match: matchStage},
        //     {$unwind: "$goodPractice"},
        //     {
        //         $group: {
        //         _id: "$goodPractice.theme",
        //         count: {$sum: 1}
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             theme: "$_id",
        //             count: "$count"
        //         }
        //     }            
        // ]);

        // // if (theme) { pipeline.splice(4, 0, { $match: { 'goodPractice.theme': theme } }); }
        // res.status(200).json(GoodPracticeByTheme);

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

        // (Optional) Filter reviews by year ONLY if the 'year' param is provided.
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

        // Join with the modules collection to get metadata like 'area'.
        pipeline.push({
            $lookup: {
                from: "modules",
                localField: "module",
                foreignField: "_id",
                as: "moduleData"
            }
        });

        // Deconstruct the moduleData array.
        pipeline.push({ $unwind: "$moduleData" });

        // (Optional) Filter by the module's area.
        if (area) {
            pipeline.push({
                $match: {
                    'moduleData.area': area
                }
            });
        }

        // Deconstruct the enhancePlans array to count each theme instance.
        pipeline.push({ $unwind: "$enhancePlans" });

        // Group by the theme and count occurrences.
        pipeline.push({
            $group: {
                _id: "$enhancePlans.theme",
                count: { $sum: 1 }
            }
        });

        // Format the final output for the chart.
        pipeline.push({
            $project: {
                _id: 0,
                theme: "$_id",
                count: "$count"
            }
        });
        
        // // Stage 8: Sort for a consistent and readable chart.
        // pipeline.push({
        //      $sort: { count: -1 } // Sort by count descending
        // });

        const enhanceCountByTheme = await Review.aggregate(pipeline);

        res.status(200).json(enhanceCountByTheme);

        
        // const matchStage = {};

        // if (area) {matchStage['moduleData.area'] = area};
        // if (level) { matchStage['moduleData.level'] = parseInt(level) }
        // if (theme) {matchStage['enhancePlans.theme'] = theme};

        // const EnhanceByTheme = await Review.aggregate([
        //     {
        //         $lookup: {
        //             from: "modules",
        //             localField: "module",
        //             foreignField: "_id",
        //             as: "moduleData"
        //         }
        //     },
        //     {
        //         $unwind: "$moduleData"
        //     },
        //     {
        //         $match: matchStage
        //     },
        //     {
        //         $unwind: "$enhancePlans"
        //     },
        //     {
        //         $group: {
        //         _id: "$enhancePlans.theme",
        //         count: {$sum: 1}
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             theme: "$_id",
        //             count: "$count"
        //         }
        //     }
            
        // ]);

        // // if (theme) { pipeline.splice(4, 0, { $match: { 'enhancePlans.theme': theme } }); }
        // res.status(200).json(EnhanceByTheme);

    }

    catch(error) {
        console.error('Error in getting enhancements by theme:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/dashboard/stats?year=2025
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Determine the target year from query param, or default to the current year.
        const { year, area } = req.query;
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

        const moduleMatch = {};
        if (area) {
            // This now supports multiple areas if you enhance the frontend later
            const areas = Array.isArray(area) ? area : [area];
            moduleMatch.area = { $in: areas };
        }

        // 2. Define the start and end dates for the target year.
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year + 1, 0, 1); // January 1st of the next year for a non-inclusive range

        const statsPipeline = [
            // Stage 1: Filter modules by area (discipline) if provided
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

        // --- Overall Statistics ---

        // // 3. Get total variants by unwinding the variants array in the Modules collection.
        // const totalVariantsPromise = Module.aggregate([
        //     { $unwind: "$variants" },
        //     { $count: "totalVariants" }
        // ]);

        // // TOTAL MODULES
        // const totalModulesPromise = Module.countDocuments();

        // // 4. Get total completed reviews across all time.
        // const totalReviewsAllTimePromise = Review.countDocuments({ status: 'Completed' });

        // // --- Year-Specific Statistics ---

        // // 5. Get the count of reviews completed within the specified year.
        // const reviewsForYearPromise = Review.countDocuments({
        //     status: 'Completed',
        //     createdAt: { $gte: startDate, $lt: endDate }
        // });

        // // Aggregation to find the number of unique modules completed in the year.
        // // now much simpler and more efficient.
        // const completedModulesPromise = Review.aggregate([
        //     {
        //         // First, find all reviews that were completed in the target year.
        //         $match: {
        //             status: 'Completed',
        //             createdAt: { $gte: startDate, $lt: endDate }
        //         }
        //     },
        //     {
        //         // Group the results by the module ID to get a list of unique modules.
        //         $group: {
        //             _id: "$module"
        //         }
        //     },
        //     {
        //         // Count how many unique modules were found.
        //         $count: "completedCount"
        //     }
        // ]);

        // // 5. Execute all database queries in parallel.
        // const [
        //     totalModules,
        //     totalReviewsAllTime,
        //     reviewsForYear,
        //     completedModulesData
        // ] = await Promise.all([
        //     totalModulesPromise,
        //     totalReviewsAllTimePromise,
        //     reviewsForYearPromise,
        //     completedModulesPromise
        // ]);

        // // 6. Calculate completion rate against ALL modules in the system.
        // const completionRate = totalModules > 0
        //     ? (completedModulesData[0].completedCount / totalModules) * 100 : 0;

        // // 7. Send the final, structured response.
        // res.status(200).json({
        //     year,
        //     totalModules,
        //     totalReviewsAllTime,
        //     reviewsForYear,
        //     completionRate: parseFloat(completionRate.toFixed(1)),
        //     _debug: {
        //         completedModulesData,
        //         totalModulesSystem: totalModules // Updated debug field for clarity
        //     }
        // });

    } catch (error) {
        console.error('Could not get dashboard statistics:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard stats.' });
    }
};

// // @route GET /api/dashboard/stats?year=2025
// export const getDashboardStats = async(req, res) => {

//     try {

//         // Determine the target year from query param, or default to the current year
//         const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

//         // Define the start and end dates for the target year
//         const startDate = new Date(year, 0, 1); // January 1st
//         const endDate = new Date(year +1, 0, 1); // Jan 1st of next year

//         // --- Overall Statistics (Not dependent on year) ---

//         const totalModulesPromise = await Module.countDocuments({});

//         // Get total variants by unwinding the variants array in the Modules collection
//         const totalVariantsPromise = Module.aggregate([
//             {$unwind: '$variants'},
//             {$count: 'totalVariants'}
//         ]);

//         // Get the total count of all completed reviews across all time
//         const totalReviewsAllTimePromise = Review.countDocuments({ status: 'Completed' });

//         // --- Year-Specific Statistics ---

//         // Get the count of reviews completed within the specified year
//         const totalReviewsYearPromise = Review.countDocuments({
//             status: 'Completed',
//             createdAt: {$gte: startDate, $lt: endDate}
//         });

//         // Use an aggregation pipeline on Reviews to calculate the completion rate for the year based on VARIANTS.
//         const completionRatePromise = Module.aggregate([
//             // Deconstruct the variants array to create a doc for each variant
//             { $unwind: '$variants'},
//             // Look up reviews for each variant's parent module that were created in the target year
//             {$lookup: {from: 'reviews', let: {moduleId: '$_id'},
//             pipeline: [{$match: {$expr: {$and: [
//                 { $eq: ["$module", "$$moduleId"] }, // Match review to parent module
//                 { $gte: ["$createdAt", startDate] }, // Check if review is in the year
//                 { $lt: ["$createdAt", endDate] }
//             ]}}}], as: 'reviewsInYear'}},

//             // Only consider variants that had at least one review in the year
//             {$match: {'reviewsInYear': {$ne: []}}},
//             // Determine if the variant is "completed".
//             {$addFields: {isCompleted: { // Check if any review in the 'reviewsInYear' array has status "Completed".
//                     $in: ["Completed", "$reviewsInYear.status"]}}},

//             // Group everything to get the final counts for the year
//             {$group: {_id: null, // Count variants that had a completed review
//                 completedVariantsInYear: {
//                         $sum: { $cond: ["$isCompleted", 1, 0] }
//                     },
//                 // Count the total number of variants that were active in the year.
//                     totalVariantsInYear: { $sum: 1 }}}

//             // {
//             //     // Find all reviews created within the target year
//             //     $match: {createdAt: {$gte: startDate, $lt: endDate}}
//             // },
//             // {
//             //     // Group reviews by the VARIANT they belong to
//             //     $group: {_id: '$variantId', isCompleted: { // Check if this variant has at least one "Completed" review.
//             //             $max: {
//             //                 $cond: [{ $eq: ["$status", "Completed"] }, 1, 0]
//             //             }
//             //         }}
//             // },
//             // {
//             //     // Group all results to get the final counts for the year
//             //     $group: {_id: null, completedVariantsInYear: { $sum: "$isCompleted" },
//             //         // Count documents to get all unique variants with reviews in the year.
//             //         totalVariantsInYear: { $sum: 1 }}
//             // }
//         ]);

//         // Execute all database queries in parallel for better performance
//         const [totalModules, totalVariantsResult, totalReviewsAllTime, totalReviewsYear, completionRateData] = await Promise.all([
//             totalModulesPromise, totalVariantsPromise, totalReviewsAllTimePromise, totalReviewsYearPromise, completionRatePromise
//         ]);

//         // Process the aggregation results
//         const totalVariants = totalVariantsResult.length > 0 ? totalVariantsResult[0].totalVariants : 0;
//         const yearlyStats = completionRateData[0] || { completedVariantsInYear: 0, totalVariantsInYear: 0 };
//         const { completedVariantsInYear, totalVariantsInYear } = yearlyStats;
        
//         // Calculate the final completion rate, handling division by zero
//         const completionRate = totalVariantsInYear > 0 ? (completedVariantsInYear / totalVariantsInYear) * 100 : 0;

//         // Send the final, structured response
//         res.status(200).json({
//             year, totalModules, totalVariants, totalReviewsAllTime, totalReviewsYear,
//             completionRate: parseFloat(completionRate.toFixed(1)),
//             _debug: {completedVariantsInYear, totalVariantsInYear}
//         });

//     }

//     catch (error) {
//         console.error('Could not get dashboard statistics:', error);
//         res.status(500).json({ message: 'Server error while fetching dashboard stats' });
//     }

// }