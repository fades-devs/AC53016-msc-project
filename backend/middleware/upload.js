import multer from 'multer';
import path from 'path';

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/', // 'uploads' folder in your project root
    filename: function(req, file, cb) {
       // Create unique filename to avoid overwriting
        cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable
export const upload = multer({
    storage: storage,
    limits: {fileSize: 10000000}, // Optional: Limit file size to 10MB
}). fields([
    {name: 'evidenceUpload', maxCount: 1},
    {name: 'feedbackUpload', maxCount: 1}
]);