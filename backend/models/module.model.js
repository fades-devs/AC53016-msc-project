import mongoose from "mongoose";

// Create new schema + fields
const moduleSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
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
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    area: {
        type: String,
        enum: ["Computing", "Civil Engineering", "Mechanical Engineering", "Anatomy", "Biomedical Engineering", "Mathematics", "Physics", "Graduate Apprenticeship Programme", "Leverhulme Research Centre"]
    },
    location: {
        type: String,
        enum: ["City Campus (including blended)", "Ninewells Campus (including blended)", "Multi-Campus (including blended)", "Online"]
    }
    
}, {timestamps: true}); // createdAt and updatedAt fields


// Create module model
const Module = mongoose.model("Module", moduleSchema);

// Export module model
export default Module;