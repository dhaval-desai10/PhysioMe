import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import { getTherapistProfile, updateTherapistProfile, getDashboardStats, getAppointments } from '../controllers/therapistController.js';
import { upload, logFormData } from '../utils/multer.js';

const router = express.Router();

// Get therapist profile
router.get('/:id/profile', verifyToken, getTherapistProfile);

// Update therapist profile
router.put('/:id/profile', verifyToken, checkRole(['physiotherapist']), upload, logFormData, updateTherapistProfile);

// Get therapist dashboard stats
router.get('/:id/dashboard', verifyToken, checkRole(['physiotherapist']), getDashboardStats);

// Get therapist appointments
router.get('/:id/appointments', verifyToken, checkRole(['physiotherapist']), getAppointments);

export default router;