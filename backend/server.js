// IMPORTS - packages, port and routes
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";
import moduleRoutes from "./routes/module.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import {sendEmail} from "./utils/sendEmail.js";



(async () => {
    try {
        // INITIALISE ENVIRONMENT
        dotenv.config();
        // ESTABLISH DB CONNECTION
        await connectDB();

        // INITIALISE EXPRESS APP
        const app = express();
        // MIDDLEWARE
        app.use(cors());
        app.use(express.json()); // accept JSON data requests

        // DEFINE ROUTES (for any request that starts with /api/.., use router defined)
        app.use('/api/modules', moduleRoutes);
        app.use('/api/reviews', reviewRoutes);
        app.use('/api/dashboard/stats', dashboardRoutes);

        // // Create route for email
        // app.get("/", (req, res) => {
        //     res.send("Home Page");
        // })

        // Route for sending the email
        app.post("/api/sendemail", async(req, res) => {
            // const {email} = req.body;

            try {
                const sendTo = "fadoua.assoufi@outlook.com";
                const sendFrom = "moduleproject@outlook.com";
                const subject = "Test Subject";
                const message = `
                <h1>Hello</h1>
                <p>This is the email body for testing.</p>
                <p>Regards,</p>
                `
                await sendEmail(subject, message, sendTo, sendFrom)

                res.status(200).json({success: true, message: "Email Sent."})
            }
            catch (error) {
                res.status(500).json(error.message)
            }
        })

        const PORT = process.env.PORT || 5000;

        // START SERVER (Node+Express sever on port 5000)
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    }
    catch (error) {
        console.error("Failed to start server: ", error.message);
        // exit process with error code
        process.exit(1);
    }
})();