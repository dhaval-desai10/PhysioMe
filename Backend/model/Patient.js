import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  conditions: [{
    type: String
  }],
  allergies: {
    type: String,
    default: ''
  },
  medications: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  }
}, {
  timestamps: true
});

// Add pre-save hook to update timestamps
patientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient; 