// In /scripts/import-modules.js

import xlsx from "xlsx";
import fs from "fs";
import path, {dirname} from "path";
import { fileURLToPath } from 'url';

// ESM-compatible way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 1. Read the Excel File ---
const filePath = path.join(__dirname, "modules.xlsx");
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // Get the first sheet's name
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet); // Convert sheet to an array of row objects

// --- 2. Create and Populate the Temporary Grouping Object ---
const tempModules = {}; // This is your temporary JS object

jsonData.forEach(row => {
    // Get the data from the current row
    const title = row.title;
    const area = row.area;
    const variant = {
        code: row.code,
        level: row.level,
    };

    // If a module with this title doesn't exist yet, create it
    if (!tempModules[title]) {
        tempModules[title] = {
            title: title,
            area: area,
            variants: [] // Initialize the variants array
        }
    }

    // Add the current variant to the correct module
    tempModules[title].variants.push(variant);
});

// --- 3. Convert the Grouped Object into the Final JSON Array ---
const finalJson = Object.values(tempModules);

// --- 4. Write the Final JSON to a File ---
const outputFilePath = path.join(__dirname, 'modules-output.json');
fs.writeFileSync(outputFilePath, JSON.stringify(finalJson, null, 2));

console.log(`Successfully converted and grouped ${finalJson.length} modules.`)
console.log(`JSON file created at: ${outputFilePath}`);


