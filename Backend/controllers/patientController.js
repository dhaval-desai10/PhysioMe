import User from '../model/User.js';
import Patient from '../model/Patient.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    console.log('Fetching profile for patient ID:', patientId);

    // Find patient by ID
    const patient = await User.findOne({
      _id: patientId,
      role: 'patient'
    }).select('-password');

    if (!patient) {
      console.log('Patient not found in User collection');
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    console.log('Found patient in User collection:', patient);

    // Get additional patient data
    const patientData = await Patient.findOne({ userId: patientId });
    console.log('Found patient data:', patientData);

    // Combine user and patient data
    const profileData = {
      ...patient.toObject(),
      ...(patientData ? patientData.toObject() : {}),
      // Ensure these fields are always present
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patientData?.dateOfBirth || '',
      gender: patientData?.gender || '',
      address: patientData?.address || '',
      medicalHistory: patientData?.medicalHistory || '',
      allergies: patientData?.allergies || '',
      medications: patientData?.medications || '',
      emergencyContact: patientData?.emergencyContact || {
        name: '',
        relationship: '',
        phone: ''
      },
      insuranceInfo: patientData?.insuranceInfo || {
        provider: '',
        policyNumber: '',
        expiryDate: ''
      },
      profilePictureUrl: patient.profilePictureUrl || ''
    };

    console.log('Sending combined profile data:', profileData);

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error in getPatientProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching patient profile'
    });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    console.log('Updating profile for patient ID:', patientId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Find patient
    const patient = await User.findOne({
      _id: patientId,
      role: 'patient'
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Handle profile picture upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'physiome/patients',
          width: 500,
          crop: 'scale'
        });

        // Delete old profile picture if exists
        if (patient.profilePictureUrl) {
          try {
            const publicId = patient.profilePictureUrl.split('/').pop().split('.')[0];
            if (publicId) {
              await cloudinary.uploader.destroy(`physiome/patients/${publicId}`);
              console.log('Deleted old profile picture');
            }
          } catch (deleteError) {
            console.error('Error deleting old profile picture:', deleteError);
          }
        }

        patient.profilePictureUrl = result.secure_url;
        
        // Delete the temporary file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture'
        });
      }
    }

    // Update basic fields
    if (req.body.firstName) patient.firstName = req.body.firstName;
    if (req.body.lastName) patient.lastName = req.body.lastName;
    if (req.body.phone) patient.phone = req.body.phone;

    await patient.save();

    // Update or create patient-specific data
    let patientData = await Patient.findOne({ userId: patientId });
    if (!patientData) {
      patientData = new Patient({ userId: patientId });
    }

    // Update patient-specific fields
    if (req.body.dateOfBirth) patientData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender) patientData.gender = req.body.gender;
    if (req.body.address) patientData.address = req.body.address;
    if (req.body.medicalHistory) patientData.medicalHistory = req.body.medicalHistory;
    if (req.body.allergies) patientData.allergies = req.body.allergies;
    if (req.body.medications) patientData.medications = req.body.medications;
    if (req.body.emergencyContact) {
      try {
        patientData.emergencyContact = JSON.parse(req.body.emergencyContact);
      } catch (error) {
        console.error('Error parsing emergency contact:', error);
        patientData.emergencyContact = req.body.emergencyContact;
      }
    }
    if (req.body.insuranceInfo) {
      try {
        patientData.insuranceInfo = JSON.parse(req.body.insuranceInfo);
      } catch (error) {
        console.error('Error parsing insurance info:', error);
        patientData.insuranceInfo = req.body.insuranceInfo;
      }
    }

    await patientData.save();

    // Combine updated data
    const updatedProfile = {
      ...patient.toObject(),
      ...patientData.toObject(),
      profilePictureUrl: patient.profilePictureUrl
    };

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error in updatePatientProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 