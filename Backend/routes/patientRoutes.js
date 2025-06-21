import express from 'express';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get patient profile
router.get('/profile/:id', auth, getPatientProfile);

// Update patient profile
router.put('/profile/:id', auth, upload.single('profilePicture'), updatePatientProfile);

export default router; 