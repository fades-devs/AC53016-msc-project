import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ["ML", "QA"],
        default: "ML"
    }
}, {timestamps: true}
);

const User = mongoose.model("User", userSchema);
export default User;