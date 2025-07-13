import mongoose from "mongoose";

// Define simple schema for themes
const ThemeSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
    enum: ['Assessment', 'Learning and Teaching', 'Course Design and Development', 'Student Engagement', 'Enabling Student Achievement',
        'Admissions, Recruitment and Widening Access', 'Concerns, Complaints and Appeals', 'Partnerships', 'Monitoring and Evaluation',
        'Work-based Learning', 'Other']
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
    // date: {
    //     type: Date,
    //     default: () => new Date()
    // },
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
    statementEngagement: {
        type: String,
        enum: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree']
    },
    statementLearning: {
        type: String,
        enum: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree']
    },
    statementTimetable: {
        type: String,
        enum: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree']
    },
    goodPractice: [ThemeSchema],
    risks: [ThemeSchema],
    enhancePlans: [ThemeSchema],
    completedBy: {
        type: String,
        required: true,
        trim: true
    },

    // UPDATE: fields for file upload
    evidenceUpload: {
        type: String // store the file path here
    },
    evidenceUpload_originalName: {type: String},
    feedbackUpload: {
        type: String // store the file path here
    },
    feedbackUpload_originalName: {type: String}

}, {timestamps: true}
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;