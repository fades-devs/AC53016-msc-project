import mongoose from "mongoose";

// Define simple schema for themes
const ThemeSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
    enum: ['Assessment', 'Learning and Teaching', 'Course Design and Development', 'Student Engagement']
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

// Review schema
const reviewSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "In Progress"
    },
    date: {
        type: Date,
        default: () => new Date()
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Module"
    },
    enhanceUpdate: {
        type: String,
        required: true
    },
    studentAttainment: {
        type: String
    },
    moduleFeedback: {
        type: String
    },
    goodPractice: [ThemeSchema],
    risks: [ThemeSchema],
    enhancePlans: [ThemeSchema]

}, {timestamps: true}
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;