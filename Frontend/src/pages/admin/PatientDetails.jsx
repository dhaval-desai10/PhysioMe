import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../lib/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { adminApi } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function PatientDetails() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        navigate('/admin/login');
        return false;
      }
      
      if (user.role !== 'admin') {
        navigate('/admin/login');
        return false;
      }
      
      return true;
    };

    if (checkAuth() && patientId) {
      fetchPatientDetails();
    } else if (!patientId) {
      setError('Patient ID is missing');
      setLoading(false);
    }
  }, [patientId, navigate]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getPatientDetails(patientId);
      
      if (response.data?.success) {
        setPatient(response.data.data);
      } else {
        throw new Error('Patient data not found');
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      if (err.message === 'Authentication required') {
        navigate('/admin/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch patient details');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Patient not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                  {patient.profilePictureUrl ? (
                    <img
                      src={patient.profilePictureUrl}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-2xl">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{patient.name}</h3>
                  <p className="text-gray-500">{patient.email}</p>
                  <p className="text-gray-500">{patient.phone || 'No phone number'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Date of Birth</h4>
                <p className="text-gray-600">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Gender</h4>
                <p className="text-gray-600">{patient.gender || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium">Medical History</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{patient.medicalHistory || 'No medical history provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Address</h4>
                <p className="text-gray-600">{patient.address || 'No address provided'}</p>
              </div>
              <div>
                <h4 className="font-medium">Emergency Contact</h4>
                <p className="text-gray-600">{patient.emergencyContact || 'No emergency contact provided'}</p>
              </div>
              <div>
                <h4 className="font-medium">Registration Date</h4>
                <p className="text-gray-600">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Status</h4>
                <p className="text-gray-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {patient.status || 'active'}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="font-medium">Last Login</h4>
                <p className="text-gray-600">
                  {patient.lastLogin ? new Date(patient.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
              {patient.assignedTherapist && (
                <div>
                  <h4 className="font-medium">Assigned Therapist</h4>
                  <p className="text-gray-600">
                    {patient.assignedTherapist.name || 'Not assigned'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}