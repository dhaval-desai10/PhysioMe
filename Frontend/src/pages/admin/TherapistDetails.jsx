import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAuth } from '../../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TherapistDetails = () => {
  const { id: therapistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
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

    if (checkAuth() && therapistId) {
      fetchTherapistDetails();
    } else if (!therapistId) {
      setError('Therapist ID is missing');
      setLoading(false);
    }
  }, [therapistId, navigate]);

    const fetchTherapistDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
      const response = await adminApi.getTherapistDetails(therapistId);

      if (response.data?.success) {
        setTherapist(response.data.data);
        } else {
          throw new Error('Therapist data not found');
        }
      } catch (err) {
        console.error('Error fetching therapist details:', err);
        if (err.message === 'Authentication required') {
          navigate('/admin/login');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to fetch therapist details');
        }
      } finally {
        setLoading(false);
      }
    };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await adminApi.approveTherapist(therapistId);
      
      if (response.data?.success) {
      setTherapist(prev => ({ ...prev, status: 'approved' }));
        toast.success('Therapist approved successfully');
      } else {
        throw new Error('Failed to approve therapist');
      }
    } catch (err) {
      console.error('Error approving therapist:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to approve therapist');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await adminApi.rejectTherapist(therapistId);
      
      if (response.data?.success) {
      setTherapist(prev => ({ ...prev, status: 'rejected' }));
        toast.success('Therapist rejected successfully');
      } else {
        throw new Error('Failed to reject therapist');
      }
    } catch (err) {
      console.error('Error rejecting therapist:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to reject therapist');
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

  if (error) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate('/admin/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Therapist not found</p>
                <Button onClick={() => navigate('/admin/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Therapist Details</h1>
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
                  {therapist.profilePictureUrl ? (
                    <img
                      src={therapist.profilePictureUrl}
                      alt={therapist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-2xl">
                        {therapist.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{therapist.name}</h3>
                  <p className="text-gray-500">{therapist.email}</p>
                  <p className="text-gray-500">{therapist.phone || 'No phone number'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Specialization</h4>
                <p className="text-gray-600">{therapist.specialization || 'Not specified'}</p>
              </div>
              <div>
                <h4 className="font-medium">Experience</h4>
                <p className="text-gray-600">{therapist.experience || 0} years</p>
              </div>
              <div>
                <h4 className="font-medium">License Number</h4>
                <p className="text-gray-600">{therapist.licenseNumber || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="font-medium">Clinic Name</h4>
                <p className="text-gray-600">{therapist.clinicName || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="font-medium">Clinic Address</h4>
                <p className="text-gray-600">{therapist.clinicAddress || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Working Days</h4>
                <p className="text-gray-600">
                  {therapist.workingDays?.join(', ') || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Working Hours</h4>
                <p className="text-gray-600">
                  {therapist.workingHours ? 
                    `${therapist.workingHours.start} - ${therapist.workingHours.end}` : 
                    'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status and Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Status</h4>
                <p className="text-gray-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            therapist.status === 'approved' ? 'bg-green-100 text-green-800' :
            therapist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
                    {therapist.status?.toUpperCase() || 'PENDING'}
          </span>
                </p>
        </div>
        {therapist.status === 'pending' && (
                <div className="flex space-x-4">
                  <Button
              onClick={handleApprove}
              disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
            >
              Approve
                  </Button>
                  <Button
              onClick={handleReject}
              disabled={loading}
                    variant="destructive"
            >
              Reject
                  </Button>
          </div>
        )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetails;