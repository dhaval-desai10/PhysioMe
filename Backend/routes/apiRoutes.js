import express from 'express';
import { protect, isTherapist, isPatient } from '../middlewares/authMiddleware.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as exerciseController from '../controllers/exerciseController.js';
import * as treatmentPlanController from '../controllers/treatmentPlanController.js';
import * as progressController from '../controllers/progressController.js';
import * as therapistController from '../controllers/therapistController.js';
import fileUpload from 'express-fileupload';
import authRoutes from './authRoutes.js';
import therapistRoutes from './therapistRoutes.js';
import patientRoutes from './patientRoutes.js';
import adminRoutes from './adminRoutes.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Configure file upload middleware
const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true,
  debug: true
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/therapist', verifyToken, therapistRoutes);
router.use('/patient', verifyToken, patientRoutes);
router.use('/admin', verifyToken, adminRoutes);

// Get all approved therapists (accessible to patients)
router.get('/therapists/approved', therapistController.getAllApprovedTherapists);

// Therapist profile routes - removing fileUploadMiddleware as it's handled by multer in therapistRoutes.js
router.route('/:id/profile')
  .get(protect, therapistController.getTherapistProfile)
  .put(protect, isTherapist, therapistController.updateTherapistProfile);

// Appointment routes
router.route('/appointments')
  .post(protect, isPatient, appointmentController.createAppointment)
  .get(protect, appointmentController.getAppointments);

router.route('/appointments/:id')
  .get(protect, appointmentController.getAppointmentById)
  // .put(protect, isTherapist, appointmentController.updateAppointment) // Needs implementation or use updateAppointmentStatus
  // .delete(protect, isTherapist, appointmentController.deleteAppointment); // Needs implementation

router.put('/appointments/:id/status', protect, isTherapist, appointmentController.updateAppointmentStatus);
// router.get('/appointments/available-slots', protect, appointmentController.getAvailableTimeSlots); // Needs implementation
// router.get('/appointments/therapist/:therapistId', protect, appointmentController.getTherapistAppointments); // Needs implementation
// router.get('/appointments/patient/:patientId', protect, isTherapist, appointmentController.getPatientAppointments); // Needs implementation

// Exercise routes
router.route('/exercises')
  .post(protect, isTherapist, exerciseController.createExercise)
  .get(protect, exerciseController.getExercises);

router.route('/exercises/:id')
  .get(protect, exerciseController.getExerciseById)
  .put(protect, isTherapist, exerciseController.updateExercise)
  .delete(protect, isTherapist, exerciseController.deleteExercise);

// router.get('/exercises/category/:category', protect, exerciseController.getExercisesByCategory); // Needs implementation
// router.get('/exercises/search', protect, exerciseController.searchExercises); // Needs implementation
// router.post('/exercises/:id/feedback', protect, isPatient, exerciseController.addExerciseFeedback); // Needs implementation

// Treatment plan routes
router.route('/treatment-plans')
  .post(protect, isTherapist, treatmentPlanController.createTreatmentPlan)
  .get(protect, treatmentPlanController.getTreatmentPlans);

router.route('/treatment-plans/:id')
  .get(protect, treatmentPlanController.getTreatmentPlanById)
  .put(protect, isTherapist, treatmentPlanController.updateTreatmentPlan)
  .delete(protect, isTherapist, treatmentPlanController.deleteTreatmentPlan);

// router.get('/treatment-plans/patient/:patientId', protect, isTherapist, treatmentPlanController.getPatientTreatmentPlans); // Check if this exists or needs implementation
// router.post('/treatment-plans/:id/exercises', protect, isTherapist, treatmentPlanController.addExercisesToPlan); // Check if this exists or needs implementation
// router.delete('/treatment-plans/:id/exercises/:exerciseId', protect, isTherapist, treatmentPlanController.removeExerciseFromPlan); // Check if this exists or needs implementation
// router.put('/treatment-plans/:id/status', protect, isTherapist, treatmentPlanController.updatePlanStatus); // Check if this exists or needs implementation

// Progress routes
router.route('/progress')
  .post(protect, isPatient, progressController.createProgress)
  // .get(protect, progressController.getProgressHistory); // Needs implementation (or use getProgressByTreatmentPlan)

// Temporarily remove the /progress/:id route to bypass the error
// router.route('/progress/:id')
//   .get(protect, progressController.getProgressById)
//   .put(protect, isPatient, progressController.updateProgress)
//   .delete(protect, isPatient, progressController.deleteProgress);

// router.get('/progress/stats/:treatmentPlanId', protect, progressController.getProgressStats); // Needs implementation
// router.get('/progress/patient/:patientId', protect, isTherapist, progressController.getPatientProgress); // Needs implementation
// router.post('/progress/:id/notes', protect, isTherapist, progressController.addProgressNote); // Needs implementation
// router.get('/progress/summary/:patientId', protect, isTherapist, progressController.getProgressSummary); // Needs implementation

// Get available time slots for a therapist
router.get('/therapists/:therapistId/available-slots/:date', appointmentController.getAvailableTimeSlots);

export default router;