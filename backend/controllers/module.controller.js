// Import mongoose model for modules
import Module from "../models/module.model.js";
import Review from '../models/review.model.js';


// @route   GET /api/modules/:moduleCode
export const getModuleByCode = async (req, res) => {

    try {
        const moduleCode = req.params.moduleCode;

        // Find the module document using the code
        const module = await Module.findOne({ 
            'code': { $regex: new RegExp(`^${moduleCode}$`, 'i') } 
        })
        // Populate the 'lead' field
        .populate({path: 'lead', select: 'firstName lastName email'})

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // --- LOGIC TO CHECK IF REVIEW EXISTS ---
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

        // Send the complete module object with populated lead data
        res.status(200).json(moduleData);

    }
    catch (error) {
        console.error('Error finding module:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/modules - /api/modules?level=1
export const getModules = async (req, res) => {
    try {
        // --- PAGINATION ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // --- FILTERING ---
        const { area, level, period, location, titleSearch, codeSearch, status, year, leadSearch } = req.query;
        // Default the year filter to the current year if not provided
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

        // --- FOR MUTLIPLE FILTER OPTIONS ---
        const buildInQuery = (value) => {
            const values = Array.isArray(value) ? value : [value];
            return { $in: values };
        };

        // Build the initial filter
        const initialMatch = {};
        if (area) initialMatch.area = buildInQuery(area);
        if (location) initialMatch.location = buildInQuery(location);
        if (period) initialMatch.period = buildInQuery(period);
        if (titleSearch) initialMatch.title = { $regex: titleSearch, $options: "i" };
        if (codeSearch) initialMatch.code = { $regex: codeSearch, $options: "i" };
        if (level) {
            const levelValues = Array.isArray(level) ? level.map(l => parseInt(l)) : [parseInt(level)];
            initialMatch.level = { $in: levelValues };
        }

        // Build the final filter
        const finalMatch = {};
        if (status) finalMatch.status = buildInQuery(status);

        // --- AGGREGATION PIPELINE ---
        const basePipeline = [
            // Stage 1: Initial match on core module fields
            { $match: initialMatch },

            // Stage 2: Join with Users to get module lead details
            {
                $lookup: {
                    from: "users",
                    localField: "lead",
                    foreignField: "_id",
                    as: "leadData"
                }
            },
            { $unwind: { path: "$leadData", preserveNullAndEmptyArrays: true } },

            // Stage 3: Add lead's full name to filter on
            {
                $addFields: {
                    moduleLeadName: { $ifNull: [{ $concat: ["$leadData.firstName", " ", "$leadData.lastName"] }, null] }
                }
            },
            // Stage 4: Conditionally filter by lead's name
            ...(leadSearch ? [{ $match: { moduleLeadName: { $regex: leadSearch, $options: "i" } } }] : []),

            // Stage 5: Join with Reviews using a pipeline that pre-filters by year
            {
                $lookup: {
                    from: "reviews",
                    let: { moduleId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$module", "$$moduleId"] } } },
                        { $match: { createdAt: { $gte: new Date(targetYear, 0, 1), $lt: new Date(targetYear + 1, 0, 1) } } }
                    ],
                    as: "reviewData"
                }
            },
            
            // Stage 6: Determine the status from the reviewData array
            {
                $addFields: {
                    lastReview: { $arrayElemAt: ["$reviewData", -1] } // Get the most recent
                }
            },
            {
                $addFields: {
                    status: { $ifNull: ["$lastReview.status", "Not Started"] },
                    lastReviewDate: { $ifNull: ["$lastReview.createdAt", null] },
                    reviewId: { $ifNull: ["$lastReview._id", null] }
                }
            },

            // Stage 7: Final filtering on the calculated status
            { $match: finalMatch },
        ];

        // --- PAGINATION & SORTING ---
        const results = await Module.aggregate([
            ...basePipeline,
            {
                $addFields: {
                    "sort_title": { "$toLower": "$title" },
                    "sort_code": { "$toLower": "$code" }
                }
            },
            { $sort: { "sort_title": 1, "sort_code": 1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip }, 
                        { $limit: limit },
                        {
                            $project: {
                                title: 1, code: 1, area: 1, location: 1, level: 1, period: 1,
                                status: 1, reviewDate: "$lastReviewDate", reviewId: 1,
                                moduleLead: { $ifNull: ["$moduleLeadName", "N/A"] },
                                year: { $ifNull: [{ $year: "$lastReviewDate" }, null] }
                            }
                        }
                    ]
                }
            }
        ]);

        const modules = results[0].data;
        const totalCount = results[0].metadata[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            modules: modules,
            totalPages: totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error("Error in getModules controller: ", error.message);
        res.status(500).send("Server Error");
    }
};