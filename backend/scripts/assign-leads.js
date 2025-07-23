// In /scripts/assign-leads.js

import dotenv from 'dotenv';
import mongoose from "mongoose";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURE DOTENV ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') }); // load the .env file from the root

const assignRandLeads = async () => {
    try {
        // 1. Connect to the database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 2. Fetch all user IDs
        const users = await User.find({}).select('_id');
        if (users.length == 0) {
            throw new Error ('No users found in the database.')
        }
        const userIds = users.map(user => user._id);
        console.log(`Found ${userIds.length} users.`);

        // 3. Fetch all modules
        const modules = await Module.find({});
        if (modules.length == 0) {
            throw new Error ('No modules found in the database.')
        }
        console.log(`Found ${modules.length} modules.`);

        // 4. Create a list of promises for all the update operations
        const updates = [];

        // for each module, assign a random lead
        for (const module of modules) {
            const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
            module.lead = randomUserId;

            // Add the save operation to our list of promises
            updates.push(module.save());
        };

        // modules.forEach (module => {
        //     const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        //     module.lead = randomUserId;
        // });

        // // Add the save operation to our list of promises
        //     updates.push(module.save());

        // for (const module of modules) {
        //     module.forEach(
        //         const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];

        //     )
        //     // // For each variant in a module, assign a random lead
        //     // module.variants.forEach(variant => {
        //     //     const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        //     //     variant.lead = randomUserId;
        //     // });
        //     // Add the save operation to our list of promises
        //     updates.push(module.save());
        // }

        // 5. Execute all update promises
        await Promise.all(updates);
        console.log('Successfully assigned leads to all modules.');

    }
    catch (error) {
        console.log('Error assigning leads: ', error.message);
        process.exit(1);
    }
    finally {
        // 6. Disconnect from the database
        await mongoose.connection.close();
        console.log('MongoDB Disconnected');
    }
}

// Run the function
assignRandLeads();