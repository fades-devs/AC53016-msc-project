// Import mongoose model for modules
import Module from "../models/module.model.js";

// @route   GET /api/modules/lookup?code=AC0001
export const findModuleByCode = async(req, res) => {
    try {
        const moduleCode = req.query.code;
        if (!moduleCode) {return res.status(400).json({message: 'Module code required'});}
    
        // Retrieve the document from Module collection in MongoDB DB (populate the module lead field)
        const module = await Module.findOne({code: {$regex: new RegExp(`^${moduleCode}$`, 'i')}}).populate('lead', 'firstName lastName');
        if (!module) {return res.status(404).json({ message: 'Module not found' });}
        // Send success status code (200 OK) and module object in JSON format as response
        res.status(200).json(module);
    }
    catch (error) {
        console.error('Error finding module:', error);
        // Send sever error status code and error message
        res.status(500).json({ message: 'Server error' });
    }
}

// @route   GET /api/modules - /api/modules?level=1
// asynchronous function that handles the request (req) and response (res)
export const getModules = async(req, res) => {

    try {
        // EXACT FILTER MATCH + text search filter + date range filter (Extract filter criteria from the query string)
        const {area, level, period, status, moduleSearch, leadSearch, year} = req.query;
        // Build the query for fields in the ORIGINAL Module collection
        const initMatch = {};
        if (area) { initMatch.area = area };
        if (level) { initMatch.level = parseInt(level) };
        if (period) { initMatch.period = period };
        if (moduleSearch) {
            // tells MongoDB to find any document where the code field contains the search string. The $options: 'i' makes the search case-insensitive.
            initMatch.$or = [{code: {$regex: moduleSearch, $options: "i"}}, {title: {$regex: moduleSearch, $options: "i"}}];
        }
        // Build the query for fields CALCULATED after lookups
        const finalMatch = {};
        if (status) {finalMatch.status = status};
        // If a year is provided, create a date range
        if (year) {
            const yearNumber = parseInt(year);
            if (!isNaN(yearNumber)) {
                const startDate = new Date(yearNumber, 0, 1); // January 1st of the year
                const endDate = new Date(yearNumber + 1, 0, 1); // // January 1st of the next year
                finalMatch.date = {$gte: startDate, $lt: endDate};
            }
        }
        if (leadSearch) {
            // use $or to ensure we don't overwrite the initial search conditions
            finalMatch.moduleLead = {$regex: leadSearch, $options: "i"};
        }

        // Aggregation Pipeline to combine data from 3 collections
        const modulesDetails = await Module.aggregate([
            // Initial filtering on core module fields for efficiency
            { $match: initMatch },
            
            // Join with Reviews
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "module",
                    as: "reviewData"
                }
            },
            // Join with users
            {
                $lookup: {
                    from: "users",
                    localField: "lead",
                    foreignField: "_id",
                    as: "leadData"
                }
            },
            // Deconstruct the arrays
            {
                $unwind: {
                    path: "$reviewData",
                    preserveNullAndEmptyArrays: true // IMPORTANT: keep modules that DON'T have matching review
                }
            },
            {
                $unwind: {
                    path: "$leadData",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Add the dynamic and final fields
            {
                $addFields: {
                    status: { $ifNull: ['$reviewData.status', 'Not Started'] },
                    date: { $ifNull: ['$reviewData.date', null] },
                    moduleLead: {
                        $ifNull: [
                            // Use concat to join the fields
                            { $concat: ["$leadData.firstName", " ", "$leadData.lastName"] },
                            'N/A'
                        ]
                    }
                }
            },

            // Combined match for calculated fields and the module lead search
            {
                $match: finalMatch
            },
            // Remove the temporary fields and old lead ID field for cleaner response
            {
                $project: {
                    reviewData: 0,
                    leadData: 0,
                    lead: 0
                }
            }
        ]);

        res.status(200).json(modulesDetails);
    }

    catch (error) {
        console.error("Error in getModules controller: ", error.message);
        res.status(500).send("Server Error");
    }
}
