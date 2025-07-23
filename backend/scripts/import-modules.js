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

// // --- 2. Create and Populate the Temporary Object ---
// const tempModules = {}; // This is your temporary JS object

// jsonData.forEach(row => {
//     // Get the data from the current row
//     const title = row.title;
//     const area = row.area;
//     const code = row.code;
//     const level = row.level;
//     const period = row.period;
//     const location = row.location;

//     // create object
//     tempModules[title] = {
//         title: title,
//         area: area,
//         code: code,
//         level: level,
//         period: period,
//         location: location
//     }

// });

// // --- 3. Convert the Object into the Final JSON Array ---
// const finalJson = Object.values(tempModules);

// --- 4. Write the Final JSON to a File ---
const outputFilePath = path.join(__dirname, 'modules-updated.json');
fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));

console.log(`Successfully converted and grouped ${jsonData.length} modules.`)
console.log(`JSON file created at: ${outputFilePath}`);


