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

// --- Write the Final JSON to a File ---
const outputFilePath = path.join(__dirname, 'modules-updated.json');
fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));

console.log(`Successfully converted and grouped ${jsonData.length} modules.`)
console.log(`JSON file created at: ${outputFilePath}`);


