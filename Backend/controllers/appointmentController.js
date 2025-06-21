import Appointment from '../model/Appointment.js';
import User from '../model/User.js';
import { sendAppointmentConfirmationEmail, sendAppointmentStatusUpdateEmail } from '../utils/emailService.js';
import { bookSlot, unbookSlot } from './availabilityController.js';

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { slotId, type, notes } = req.body;

    // Validate required fields
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Get the slot details
    const AvailabilitySlot = (await import('../model/AvailabilitySlot.js')).default;
    const slot = await AvailabilitySlot.findById(slotId);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already booked'
      });
    }

    // Verify therapist exists
    const physiotherapist = await User.findOne({ 
      _id: slot.therapistId, 
      role: 'physiotherapist',
      status: 'approved'
    });
    
    if (!physiotherapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found or not approved'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      physiotherapistId: slot.therapistId,
      date: slot.date,
      time: slot.time,
      type: type || 'initial',
      notes: notes || ''
    });

    // Book the slot
    await bookSlot(slotId, appointment._id);

    // Send confirmation email
    await sendAppointmentConfirmationEmail(req.user, physiotherapist, appointment);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all appointments (filtered by role)
export const getAppointments = async (req, res) => {
  try {
    const query = {};

    // Filter based on user role
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'physiotherapist') {
      query.physiotherapistId = req.user._id;
    }

    // Add date filter if provided
    if (req.query.date) {
      query.date = req.query.date;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('physiotherapistId', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('physiotherapistId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify access rights
    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    if (req.user.role === 'physiotherapist' && appointment.physiotherapistId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only physiotherapist can update status
    if (req.user.role !== 'physiotherapist' || 
        appointment.physiotherapistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    const { status } = req.body;
    appointment.status = status;
    await appointment.save();

    // Get patient details for email
    const patient = await User.findById(appointment.patientId);

    // Send status update email
    await sendAppointmentStatusUpdateEmail(patient, req.user, appointment);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership (both patient and physiotherapist can cancel)
    if (appointment.patientId.toString() !== req.user._id.toString() && 
        appointment.physiotherapistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Only allow cancellation of pending or confirmed appointments
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot cancel appointment with status: ${appointment.status}` });
    }

    // Find and unbook the slot
    const AvailabilitySlot = (await import('../model/AvailabilitySlot.js')).default;
    const slot = await AvailabilitySlot.findOne({
      therapistId: appointment.physiotherapistId,
      date: appointment.date,
      time: appointment.time,
      appointmentId: appointment._id
    });

    if (slot) {
      await unbookSlot(slot._id);
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = req.body.reason;
    await appointment.save();

    // Get other party's details for email
    const otherParty = await User.findById(
      req.user.role === 'patient' ? appointment.physiotherapistId : appointment.patientId
    );

    // Send cancellation email
    await sendAppointmentStatusUpdateEmail(otherParty, req.user, appointment);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get available time slots for a therapist on a specific date
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { therapistId, date } = req.params;
    
    // Verify therapist exists
    const therapist = await User.findOne({ _id: therapistId, role: 'physiotherapist' });
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    // Parse the date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if therapist works on this day
    if (!therapist.workingDays.includes(dayOfWeek)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Therapist does not work on this day'
      });
    }

    // Get therapist's working hours and appointment duration
    const { start: workStart, end: workEnd } = therapist.workingHours;
    const appointmentDuration = therapist.appointmentDuration || 30; // minutes

    // Generate all possible time slots
    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${workStart}`);
    const endTime = new Date(`2000-01-01T${workEnd}`);
    
    while (startTime < endTime) {
      const timeString = startTime.toTimeString().slice(0, 5);
      timeSlots.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + appointmentDuration);
    }

    // Get existing appointments for this therapist on this date
    const existingAppointments = await Appointment.find({
      physiotherapistId: therapistId,
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Remove booked time slots
    const bookedSlots = existingAppointments.map(apt => apt.time);
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        availableSlots,
        workingHours: therapist.workingHours,
        appointmentDuration,
        workingDays: therapist.workingDays
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};