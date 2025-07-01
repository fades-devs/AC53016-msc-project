import mongoose from "mongoose";

// Create new schema + fields
const moduleSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true,
        // Only allow values from the array
        enum: ["Computing", "Civil Engineering", "Mechanical Engineering", "Anatomy"]
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5]
    },
    period: {
        type: String,
        required: true,
        enum: ["Semester 1", "Semester 2", "Semester 1-2", "Summer"]
    },
    location: {
        type: String,
        enum: ["City Campus", "City Campus (including blended)", ""]
    },
    partnership: {
        type: String
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId, // Create reference to an ID
        ref: "User" // Tells Mongoose the reference is to the User model
    }
}, {timestamps: true}); // createdAt and updatedAt fields


// Create module model
const Module = mongoose.model("Module", moduleSchema);

// export model
export default Module;