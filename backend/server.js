// IMPORTS - packages, port and routes
import './loadEnv.js';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";
import moduleRoutes from "./routes/module.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import emailRoutes from "./routes/email.routes.js";
import {sendEmail} from "./utils/sendEmail.js";

(async () => {
    try {
        // ESTABLISH DB CONNECTION
        await connectDB();

        // INITIALISE EXPRESS APP
        const app = express();

        // MIDDLEWARE
        app.use(cors());
        app.use(express.json()); // accept JSON data requests

        // DEFINE ROUTES
        app.use('/api/modules', moduleRoutes);
        app.use('/api/reviews', reviewRoutes);
        app.use('/api/dashboard/stats', dashboardRoutes);
        // Route for sending the email
        app.use('/api/email', emailRoutes);

        const PORT = process.env.PORT || 5000;

        // START SERVER
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    }

    catch (error) {
        console.error("Failed to start server: ", error.message);
        // Exit process with error code
        process.exit(1);
    }
})();