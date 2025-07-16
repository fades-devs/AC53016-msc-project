// Import mongoose model for modules
import Module from "../models/module.model.js";
import Review from '../models/review.model.js';


// @route   GET /api/modules/:moduleCode
export const getModuleByCode = async (req, res) => {

    try {
        const moduleCode = req.params.moduleCode;

        // Find the module document using the variant code
        const module = await Module.findOne({ 
            'variants.code': { $regex: new RegExp(`^${moduleCode}$`, 'i') } 
        })
        // Populate the 'lead' field within the 'variants' array
        .populate({path: 'variants.lead', select: 'firstName lastName email'}) // Select which user fields to return

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // --- UPDATE: LOGIC TO CHECK IF REVIEW EXISTS ---

        // Define the start and end of the current year
        const currentYear = new Date().getFullYear(); // This will be 2025
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear + 1, 0, 1);

        // Check for an existing review for this module within the current year
        const existingReview = await Review.findOne({module: module._id, createdAt: {$gte: startDate, $lt: endDate}});
        // Add the review ID to the response if one exists
        const moduleData = module.toObject(); // Convert to a plain object to add properties
        if (existingReview) {
            moduleData.existingReviewId = existingReview._id;
        }

        // Send the complete module object with populated lead data - modified object
        res.status(200).json(moduleData);

    }
    catch (error) {
        console.error('Error finding module:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/modules - /api/modules?level=1
// asynchronous function that handles the request (req) and response (res)
export const getModules = async(req, res) => {

    try {

        // --- PAGINATION: Get page and limit from query, with defaults ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // default 20 items per page
        const skip = (page - 1) * limit;


        // EXACT FILTER MATCH + text search filter + date range filter (Extract filter criteria from the query string)
        const {area, level, period, location, titleSearch, codeSearch, status, year, leadSearch} = req.query;

        // Helper function to build $in queries
        const buildInQuery = (value) => {
            // Values can come as a single string or an array if multiple are selected
            const values = Array.isArray(value) ? value : [value];
            return { $in: values };
        };

        // Build the query for fields in the ORIGINAL Module collection
        const initMatch = {};
        if (area) { initMatch.area = buildInQuery(area) };
        if (location) { initMatch.location = buildInQuery(location) };
        // Search title + code variant
        // tells MongoDB to find any document where the code field contains the search string.
        // The $options: 'i' makes the search case-insensitive.
        if (titleSearch) { initMatch.title = { $regex: titleSearch, $options: "i" }};

        // // Create a sub-document match for the 'variants' array
        // // This object is for the new $match stage after unwinding variants
        // const variantMatch = {};
        // if (level) {
        //     // Ensure levels are numbers
        //     const levelValues = Array.isArray(level) ? level.map(l => parseInt(l)) : [parseInt(level)];
        //     variantMatch.level = { $in: levelValues };
        // }
        // if (period) { postUnwindVariantMatch.period = buildInQuery(period) };
        // if (codeSearch) { postUnwindVariantMatch.code = { $regex: codeSearch, $options: "i" }}

        // // This object is for the new $match stage after unwinding
        // const postUnwindVariantMatch = {};
        // if (level) postUnwindVariantMatch['variants.level'] = variantMatch.level;
        // if (period) postUnwindVariantMatch['variants.period'] = variantMatch.period;
        // if (codeSearch) postUnwindVariantMatch['variants.code'] = variantMatch.code;

        // This object is for the new $match stage after unwinding variants
        const postUnwindVariantMatch = {};
        if (level) {
            const levelValues = Array.isArray(level) ? level.map(l => parseInt(l)) : [parseInt(level)];
            postUnwindVariantMatch['variants.level'] = { $in: levelValues };
        }
        if (period) postUnwindVariantMatch['variants.period'] = buildInQuery(period);
        if (codeSearch) postUnwindVariantMatch['variants.code'] = { $regex: codeSearch, $options: "i" };

        // // If there are variant filters, add them to the initMatch
        // if (Object.keys(variantMatch).length > 0) {
        //     initMatch.variants = { $elemMatch: variantMatch };}

        // Build the final match query for fields calculated after lookups
        const finalMatch = {};
        if (status) {finalMatch.consolidatedStatus = buildInQuery(status)};
        // Date range filter based on the Review's creation date
        // if (year) {
        //     const yearNumber = parseInt(year);
        //     if (!isNaN(yearNumber)) {
        //         const startDate = new Date(yearNumber, 0, 1); // January 1st of the year
        //         const endDate = new Date(yearNumber + 1, 0, 1); // // January 1st of the next year
        //         // This will be used to filter on the Review's creation date
        //         finalMatch.lastReviewDate = {$gte: startDate, $lt: endDate};
        //     }
        // };

        // Aggregation Pipeline to combine data from 3 collections
        const modulesDetails = await Module.aggregate([

            // Initial filtering on core module fields for efficiency
            { $match: initMatch },

            // Deconstruct the variants array to work with each variant individually
            { $unwind: "$variants" },

            // This new match stage filters the *unwound* documents to ensure
            // that only the variants that meet the criteria continue.
            ...(Object.keys(postUnwindVariantMatch).length > 0 ? 
                [{ $match: postUnwindVariantMatch }] : []),

            // Join with Users to get module lead details for EACH variant
            {
                $lookup: {
                    from: "users",
                    localField: "variants.lead", // Use the lead ID
                    foreignField: "_id",
                    as: "leadData"
                }
            },
            { $unwind: { path: "$leadData", preserveNullAndEmptyArrays: true } },

            // Add the module lead's full name as a new field to filter on
            {
                $addFields: { // Use null if leadData is missing, so it can be filtered out
                    moduleLeadName: {$ifNull: [{ $concat: ["$leadData.firstName", " ", "$leadData.lastName"] }, null]}}
            },

            // Add this stage ONLY if 'leadSearch' exists
            ...(leadSearch ? [{ $match: { moduleLeadName: { $regex: leadSearch, $options: "i" } } }] : []),


            // Stage 6: Join with Reviews using a pipeline that pre-filters by year.
            {
                $lookup: {
                    from: "reviews",
                    let: { moduleId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$module", "$$moduleId"] } } },
                        ...(year ? [{
                            $match: {
                                createdAt: {
                                    $gte: new Date(parseInt(year), 0, 1),
                                    $lt: new Date(parseInt(year) + 1, 0, 1)
                                }
                            }
                        }] : [])
                    ],
                    as: "reviewData"
                }
            },

            // Stage 7: THE NEW FIX - If filtering by year, remove modules that have no reviews for that year.
            ...(year ? [{ $match: { "reviewData": { $ne: [] } } }] : []),
            
            // Stage 8: Create a single status and date from the (now correctly filtered) array of reviews
            {
                $addFields: {
                    consolidatedStatus: {
                        $ifNull: [
                            {
                                $cond: {
                                    if: { $in: ["Completed", "$reviewData.status"] },
                                    then: "Completed",
                                    else: {
                                        $cond: {
                                            if: { $in: ["In Progress", "$reviewData.status"] },
                                            then: "In Progress",
                                            else: "Not Started"
                                        }
                                    }
                                }
                            },
                            "Not Started"
                        ]
                    },
                    lastReviewDate: { $max: "$reviewData.createdAt" }
                }
            },

            // // KEY FIX - Join with Reviews using a pipeline that pre-filters by year
            // {
            //     $lookup: {
            //         from: "reviews",
            //         let: { moduleId: "$_id" },
            //         pipeline: [
            //             // Match reviews for the module
            //             { $match: { $expr: { $eq: ["$module", "$$moduleId"] } } },
            //             // Conditionally add a match stage for the year IF the 'year' query param exists
            //             ...(year ? [{
            //                 $match: {
            //                     createdAt: {
            //                         $gte: new Date(parseInt(year), 0, 1),
            //                         $lt: new Date(parseInt(year) + 1, 0, 1)
            //                     }
            //                 }
            //             }] : [])
            //         ],
            //         as: "reviewData" // This array now ONLY contains reviews for the specified year (or all reviews if no year is specified)
            //     }
            // },

            // // Join with Reviews - UPDATE: Join with Reviews, but DO NOT unwind
            
            // // {
            // //     $lookup: {
            // //         from: "reviews",
            // //         localField: "_id", // The module's _id
            // //         foreignField: "module", // The review's reference to the module
            // //         as: "reviewData"
            // //     }
            // // },
            // // { $unwind: { path: "$reviewData", preserveNullAndEmptyArrays: true } },

            // // Add final calculated fields before the final match
            // {
            //     $addFields: {
            //         consolidatedStatus: {
            //             $ifNull: [
            //                 {
            //                     $cond: {
            //                         if: { $in: ["Completed", "$reviewData.status"] },
            //                         then: "Completed",
            //                         else: {
            //                             $cond: {
            //                                 if: { $in: ["In Progress", "$reviewData.status"] },
            //                                 then: "In Progress",
            //                                 else: "Not Started"
            //                             }
            //                         }
            //                     }
            //                 },
            //                 "Not Started"
            //             ]
            //         },
            //         lastReviewDate: { $max: "$reviewData.createdAt" }
            //     }
            // },

            // Final filtering on calculated fields (status, year from review)
            { $match: finalMatch },


            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { title: 1} },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                area: 1,
                                location: 1,
                                code: "$variants.code",
                                level: "$variants.level",
                                period: "$variants.period",
                                status: "$consolidatedStatus",
                                reviewDate: "$lastReviewDate",
                                reviewId: '$reviewData._id',
                                moduleLead: { $ifNull: ["$moduleLeadName", "N/A"] },
                                year: { $ifNull: [{ $year: "$lastReviewDate" }, null] }
                            }
                        }
                    ]
                }
            }

            // Shape the final output document
            // {
            //     $project: { reviewId: "$reviewData._id", // Pass the review's unique ID
            //         _id: 1, title: 1, area: 1, location: 1, partnership: 1, 
            //         // Pull specific fields from the variant
            //         code: "$variants.code", level: "$variants.level", period: "$variants.period",
            //         // Use the calculated fields
            //         moduleLead: { $ifNull: ["$moduleLeadName", "N/A"] },
            //         status: '$consolidatedStatus', reviewDate: "$lastReviewDate",
            //         year: { $ifNull: [{ $year: "$lastReviewDate" }, null] }}
            // },

            // // UPDATE PAGINATION FIX: Add a sort stage BEFORE pagination to ensure consistent order
            // // Add temporary lowercase fields using the $toLower operator.
            // {
            //     $addFields: {
            //         "sort_title": { "$toLower": "$title" }
            //     }
            // },
            // // Sort by the new temporary fields.
            // {
            //     $sort: {
            //         "sort_title": 1, // 1 for ascending
            //     }
            // },

            // // --- PAGINATION: Use $facet to get both data and total count ---
            // {
            //     $facet: { // The temporary sort fields won't be in the final output because facet doesn't include them
            //         // Sub-pipeline 1: Get the metadata (total count)
            //         metadata: [ {$count: 'total'} ],
            //         // Sub-pipeline 2: Get the actual data for the page
            //         data: [ { $skip: skip }, { $limit: limit } ]
            //     }
            // }

        ]);

        const modules = modulesDetails[0].data;
        const totalCount = modulesDetails[0].metadata[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // --- UPDATED RESPONSE BASED ON PAGINATION ---
        res.status(200).json({modules, totalPages, currentPage: page});
    }

    catch (error) {
        console.error("Error in getModules controller: ", error.message);
        res.status(500).send("Server Error");
    }
}
