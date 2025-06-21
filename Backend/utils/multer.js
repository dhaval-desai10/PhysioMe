import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer instance
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Export the configured middleware
// Use single() for profile picture uploads
export const upload = uploadMiddleware.single('profilePicture');

// Middleware to log form data and ensure req.body exists
export const logFormData = (req, res, next) => {
    console.log('=== FORM DATA MIDDLEWARE ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Ensure req.body exists
    if (!req.body) {
        req.body = {};
        console.warn('Created empty req.body object');
    }
    
    // Parse JSON strings in req.body if needed
    try {
        // Handle workingHours if it's a string
        if (typeof req.body.workingHours === 'string') {
            try {
                req.body.workingHours = JSON.parse(req.body.workingHours);
                console.log('Parsed workingHours JSON string');
            } catch (e) {
                console.error('Failed to parse workingHours:', e);
            }
        }
        
        // Handle workingDays if it's a string
        if (typeof req.body.workingDays === 'string') {
            try {
                req.body.workingDays = JSON.parse(req.body.workingDays);
                console.log('Parsed workingDays JSON string');
            } catch (e) {
                console.error('Failed to parse workingDays:', e);
            }
        }
        
        // Log the body contents
        console.log('Form Data keys:', Object.keys(req.body));
        console.log('appointmentDuration value:', req.body.appointmentDuration);
        console.log('Full Form Data:', JSON.stringify(req.body, null, 2));
    } catch (error) {
        console.error('Error processing req.body:', error);
    }
    
    // Log file information
    if (req.file) {
        console.log('File:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
    } else {
        console.log('No file in request');
    }
    
    console.log('=== END FORM DATA MIDDLEWARE ===');
    next();
};