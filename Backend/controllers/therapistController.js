import User from '../model/User.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// Get therapist profile
export const getTherapistProfile = async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'physiotherapist'
    }).select('-password');

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    res.status(200).json({
      success: true,
      data: therapist
    });
  } catch (error) {
    console.error('Error in getTherapistProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update therapist profile
export const updateTherapistProfile = async (req, res) => {
  try {
    const therapistId = req.params.id;
    
    // Validate therapist ID
    if (!therapistId) {
      return res.status(400).json({
        success: false,
        message: 'Therapist ID is required'
      });
    }
    
    // Log request details for debugging
    console.log('Update request headers:', req.headers);
    console.log('Update request body type:', typeof req.body);
    console.log('Request file:', req.file);
    
    // Create an empty body object if it doesn't exist
    if (!req.body) {
      req.body = {};
      console.log('Created empty req.body object');
    }
    
    // If req.body is empty and no file was uploaded, return error
    if (Object.keys(req.body).length === 0 && !req.file) {
      console.error('Request body is empty and no file was uploaded');
      return res.status(400).json({
        success: false,
        message: 'No data provided for update'
      });
    }

    // Find therapist by ID
    const therapist = await User.findOne({
      _id: therapistId,
      role: 'physiotherapist'
    });
    
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    // Log the received data for debugging
    console.log('Received update data:', req.body);

    // Handle profile picture upload if present
    if (req.file) {
      try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          console.log('Cloudinary configuration missing, skipping profile picture upload');
        } else {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'physiome/therapists',
            width: 500,
            crop: 'scale'
          });

          // Delete old profile picture if exists
          if (therapist.profilePictureUrl) {
            try {
              const publicId = therapist.profilePictureUrl.split('/').pop().split('.')[0];
              if (publicId) {
                await cloudinary.uploader.destroy(`physiome/therapists/${publicId}`);
                console.log('Deleted old profile picture');
              }
            } catch (deleteError) {
              console.error('Error deleting old profile picture:', deleteError);
              // Continue with the update even if deleting old picture fails
            }
          }

          therapist.profilePictureUrl = result.secure_url;
          
          // Delete the temporary file
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile picture'
        });
      }
    }

    // Update therapist data
    const updateData = {};
    
    // Process name field (single field, not firstName/lastName)
    if (req.body.name) {
      updateData.name = req.body.name.trim();
    }
    
    // Process other fields
    const fields = [
      'email', 'phone', 'specialization', 'experience',
      'licenseNumber', 'clinicName', 'clinicAddress', 'bio',
      'appointmentDuration'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Process working hours
    if (req.body.workingHours) {
      try {
        // Parse workingHours if it's a JSON string
        updateData.workingHours = typeof req.body.workingHours === 'string' 
          ? JSON.parse(req.body.workingHours) 
          : req.body.workingHours;
      } catch (error) {
        console.error('Error parsing workingHours:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid working hours format'
        });
      }
    }
    
    // Process working days
    if (req.body.workingDays) {
      try {
        // Parse workingDays if it's a JSON string
        updateData.workingDays = typeof req.body.workingDays === 'string' 
          ? JSON.parse(req.body.workingDays) 
          : req.body.workingDays;
      } catch (error) {
        console.error('Error parsing workingDays:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid working days format'
        });
      }
    }
    
    // Process appointment duration
    if (req.body.appointmentDuration !== undefined) {
      const appointmentDuration = parseInt(req.body.appointmentDuration);
      if (!isNaN(appointmentDuration) && appointmentDuration >= 15 && appointmentDuration <= 120) {
        updateData.appointmentDuration = appointmentDuration;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment duration. Must be between 15 and 120 minutes.'
        });
      }
    }
    
    // If profile picture was uploaded, add the URL to updateData
    if (therapist.profilePictureUrl) {
      updateData.profilePictureUrl = therapist.profilePictureUrl;
    }
    
    console.log('Final update data:', updateData);
    
    // Update the therapist in the database
    const updatedTherapist = await User.findByIdAndUpdate(
      therapistId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedTherapist) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update therapist profile'
      });
    }

    // Return the updated profile data from our updatedTherapist object
    const updatedProfile = {
      _id: updatedTherapist._id,
      name: updatedTherapist.name,
      email: updatedTherapist.email,
      phone: updatedTherapist.phone,
      specialization: updatedTherapist.specialization,
      experience: updatedTherapist.experience,
      licenseNumber: updatedTherapist.licenseNumber,
      clinicName: updatedTherapist.clinicName,
      clinicAddress: updatedTherapist.clinicAddress,
      bio: updatedTherapist.bio,
      profilePictureUrl: updatedTherapist.profilePictureUrl,
      workingHours: updatedTherapist.workingHours,
      workingDays: updatedTherapist.workingDays,
      appointmentDuration: updatedTherapist.appointmentDuration
    };

    // Log the response data for debugging
    console.log('Sending response:', updatedProfile);

    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error in updateTherapistProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Get therapist dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'physiotherapist'
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    // Add your logic to get dashboard stats
    // This is a placeholder - implement actual stats calculation
    const stats = {
      totalPatients: 0,
      appointmentsToday: 0,
      completedSessions: 0,
      pendingReports: 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get therapist appointments
export const getAppointments = async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'physiotherapist'
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }

    // Add your logic to get appointments
    // This is a placeholder - implement actual appointments fetching
    const appointments = [];

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error in getAppointments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 

// Get all approved therapists for patients
export const getAllApprovedTherapists = async (req, res) => {
  try {
    const therapists = await User.find({
      role: 'physiotherapist',
      status: 'approved'
    }).select('-password');

    res.status(200).json({
      success: true,
      data: therapists
    });
  } catch (error) {
    console.error('Error in getAllApprovedTherapists:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};