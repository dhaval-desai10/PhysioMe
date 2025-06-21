import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import connectDB from './database/dbConnect.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Add fs module import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line to handle form data
app.use(cookieParser());

// Create temp directory if it doesn't exist
if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp', { recursive: true });
}

// File upload options
const fileUploadOptions = {
  useTempFiles: true,
  tempFileDir: './temp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true,
  safeFileNames: true,
  uploadTimeout: 30000
};

// Create file upload middleware
const fileUploadMiddleware = fileUpload(fileUploadOptions);

// Routes that don't need file upload
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Add approved therapists route
app.get('/api/therapists/approved', async (req, res) => {
  try {
    const User = (await import('./model/User.js')).default;
    const therapists = await User.find({
      role: 'physiotherapist',
      status: 'approved'
    }).select('-password');

    res.status(200).json({
      success: true,
      data: therapists
    });
  } catch (error) {
    console.error('Error fetching approved therapists:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Routes that need file upload only for specific methods
app.use('/api/therapist', (req, res, next) => {
  // Skip fileUpload middleware for profile update route which uses multer
  if (req.method === 'PUT' && req.path.includes('/profile')) {
    next();
  } else if (req.method === 'GET') {
    next();
  } else {
    fileUploadMiddleware(req, res, next);
  }
}, apiRoutes);

app.use('/api/patient', (req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    fileUploadMiddleware(req, res, next);
  }
}, patientRoutes);

// Error handling middleware
// This should typically be defined after all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled routes (404)
// This should be the last middleware to catch all unhandled requests
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});