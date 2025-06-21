import AvailabilitySlot from '../model/AvailabilitySlot.js';
import Appointment from '../model/Appointment.js';
import User from '../model/User.js';

// Add new availability slots
export const addAvailabilitySlots = async (req, res) => {
  try {
    const { date, timeSlots, duration = 30 } = req.body;
    const therapistId = req.user._id;

    // Validate input
    if (!date || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slots are required'
      });
    }

    // Check if date is in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add slots for past dates'
      });
    }

    const slotsToAdd = [];
    const errors = [];

    // Process each time slot
    for (const time of timeSlots) {
      try {
        // Check if slot already exists
        const existingSlot = await AvailabilitySlot.findOne({
          therapistId,
          date: selectedDate,
          time
        });

        if (existingSlot) {
          errors.push(`Slot at ${time} already exists`);
          continue;
        }

        slotsToAdd.push({
          therapistId,
          date: selectedDate,
          time,
          duration
        });
      } catch (error) {
        errors.push(`Invalid time format: ${time}`);
      }
    }

    if (slotsToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid slots to add',
        errors
      });
    }

    // Add slots to database
    const addedSlots = await AvailabilitySlot.insertMany(slotsToAdd);

    res.status(201).json({
      success: true,
      message: `Added ${addedSlots.length} availability slots`,
      data: addedSlots,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error adding availability slots:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get therapist's availability slots
export const getTherapistAvailabilitySlots = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const therapistId = req.user._id;

    let query = { therapistId };

    // Filter by date range or specific date
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: selectedDate,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    } else {
      // Default to next 30 days
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      query.date = {
        $gte: today,
        $lte: thirtyDaysLater
      };
    }

    const slots = await AvailabilitySlot.find(query)
      .sort({ date: 1, time: 1 })
      .populate('appointmentId', 'patientId status')
      .populate('appointmentId.patientId', 'name email');

    res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {
    console.error('Error getting availability slots:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available slots for patients (public endpoint)
export const getAvailableSlotsForPatient = async (req, res) => {
  try {
    const { therapistId, date } = req.params;

    // Validate therapist exists and is approved
    const therapist = await User.findOne({
      _id: therapistId,
      role: 'physiotherapist',
      status: 'approved'
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found or not approved'
      });
    }

    // Get available slots for the specific date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const slots = await AvailabilitySlot.find({
      therapistId,
      date: {
        $gte: selectedDate,
        $lt: nextDay
      },
      isBooked: false
    }).sort({ time: 1 });

    res.status(200).json({
      success: true,
      data: {
        availableSlots: slots.map(slot => ({
          id: slot._id,
          time: slot.time,
          duration: slot.duration
        })),
        therapist: {
          name: therapist.name,
          specialization: therapist.specialization,
          workingHours: therapist.workingHours,
          appointmentDuration: therapist.appointmentDuration
        }
      }
    });

  } catch (error) {
    console.error('Error getting available slots for patient:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete availability slot
export const deleteAvailabilitySlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const therapistId = req.user._id;

    const slot = await AvailabilitySlot.findOne({
      _id: slotId,
      therapistId
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a booked slot'
      });
    }

    await AvailabilitySlot.findByIdAndDelete(slotId);

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting availability slot:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Book a slot (called when appointment is created)
export const bookSlot = async (slotId, appointmentId) => {
  try {
    const slot = await AvailabilitySlot.findById(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.isBooked) {
      throw new Error('Slot is already booked');
    }

    slot.isBooked = true;
    slot.appointmentId = appointmentId;
    await slot.save();

    return slot;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

// Unbook a slot (called when appointment is cancelled)
export const unbookSlot = async (slotId) => {
  try {
    const slot = await AvailabilitySlot.findById(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }

    slot.isBooked = false;
    slot.appointmentId = null;
    await slot.save();

    return slot;
  } catch (error) {
    console.error('Error unbooking slot:', error);
    throw error;
  }
}; 