import mongoose from "mongoose";

// Create new schema for the variants
const variantSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        // unique we shall see
        trim: true
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5]
    },
    period: {
        type: String,
        enum: ["SEM 1", "SEM 2", "SEM 1-2", "SEM 1/2", "SUM"]
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId, // Create reference to an ID
        ref: "User" // Tells Mongoose the reference is to the User model
    } 
}) // _id needed for sub-documents (needed for dashboard stat api)

// Create new schema + fields
const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    variants: { // The 'variants' array holds the differing information
        type: [variantSchema],
        required: true
    },
    area: {
        type: String,
        enum: ["Computing", "Civil Engineering", "Mechanical Engineering", "Anatomy", "Biomedical Engineering", "Mathematics", "Physics", "Graduate Apprenticeship Programme", "Leverhulme Research Centre"]
    },
    location: {
        type: String,
        enum: ["City Campus (including blended)", "Ninewells Campus (including blended)", "Multi-Campus (including blended)", "Online"]
    },
    partnership: {
        type: String,
        trim: true
    },
    
}, {timestamps: true}); // createdAt and updatedAt fields


// Create module model
const Module = mongoose.model("Module", moduleSchema);

// Export module model
export default Module;