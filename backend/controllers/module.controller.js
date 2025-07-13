// Import mongoose model for modules
import Module from "../models/module.model.js";

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

        // Send the complete module object with populated lead data
        res.status(200).json(module);

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

        // Create a sub-document match for the 'variants' array
        const variantMatch = {};
        if (level) {
            // Ensure levels are numbers
            const levelValues = Array.isArray(level) ? level.map(l => parseInt(l)) : [parseInt(level)];
            variantMatch.level = { $in: levelValues };
        }
        if (period) { variantMatch.period = buildInQuery(period) };
        if (codeSearch) { variantMatch.code = { $regex: codeSearch, $options: "i" }}

        // If there are variant filters, add them to the initMatch
        if (Object.keys(variantMatch).length > 0) {
            initMatch.variants = { $elemMatch: variantMatch };}

        // Build the final match query for fields calculated after lookups
        const finalMatch = {};
        if (status) {finalMatch.status = buildInQuery(status)};
        // Date range filter based on the Review's creation date
        if (year) {
            const yearNumber = parseInt(year);
            if (!isNaN(yearNumber)) {
                const startDate = new Date(yearNumber, 0, 1); // January 1st of the year
                const endDate = new Date(yearNumber + 1, 0, 1); // // January 1st of the next year
                // This will be used to filter on the Review's creation date
                finalMatch.createdAt = {$gte: startDate, $lt: endDate};
            }
        };

        // This object is for the new $match stage after unwinding
        const postUnwindVariantMatch = {};
        if (level) postUnwindVariantMatch['variants.level'] = variantMatch.level;
        if (period) postUnwindVariantMatch['variants.period'] = variantMatch.period;
        if (codeSearch) postUnwindVariantMatch['variants.code'] = variantMatch.code;

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

            // Join with Reviews
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id", // The module's _id
                    foreignField: "module", // The review's reference to the module
                    as: "reviewData"
                }
            },
            { $unwind: { path: "$reviewData", preserveNullAndEmptyArrays: true } },

            // Add final calculated fields before the final match
            {
                 $addFields: {
                    status: { $ifNull: ["$reviewData.status", "Not Started"] },
                    createdAt: { $ifNull: ["$reviewData.createdAt", null] }
                }
            },

            // Final filtering on calculated fields (status, year from review)
            { $match: finalMatch },

            // Shape the final output document
            {
                $project: { reviewId: "$reviewData._id", // Pass the review's unique ID
                    _id: 1, title: 1, area: 1, location: 1, partnership: 1, 
                    // Pull specific fields from the variant
                    code: "$variants.code", level: "$variants.level", period: "$variants.period",
                    // Use the calculated fields
                    moduleLead: { $ifNull: ["$moduleLeadName", "N/A"] },
                    status: 1, reviewDate: "$createdAt"}
            },

            // UPDATE PAGINATION FIX: Add a sort stage BEFORE pagination to ensure consistent order
            // Add temporary lowercase fields using the $toLower operator.
            {
                $addFields: {
                    "sort_title": { "$toLower": "$title" }
                }
            },
            // Sort by the new temporary fields.
            {
                $sort: {
                    "sort_title": 1, // 1 for ascending
                }
            },

            // --- PAGINATION: Use $facet to get both data and total count ---
            {
                $facet: { // The temporary sort fields won't be in the final output because facet doesn't include them
                    // Sub-pipeline 1: Get the metadata (total count)
                    metadata: [ {$count: 'total'} ],
                    // Sub-pipeline 2: Get the actual data for the page
                    data: [ { $skip: skip }, { $limit: limit } ]
                }
            }

        ]);

        const modules = modulesDetails[0].data;
        const totalCount = modulesDetails[0].metadata[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // --- UPDATED RESPONSE BASED ON PAGINATION ---
        res.status(200).json({modules: modules, totalPages: totalPages, currentPage: page});
    }

    catch (error) {
        console.error("Error in getModules controller: ", error.message);
        res.status(500).send("Server Error");
    }
}
