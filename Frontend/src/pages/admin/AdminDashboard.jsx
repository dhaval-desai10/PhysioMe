import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Users, UserPlus, Calendar } from 'lucide-react';
import { adminApi } from '../../services/api';
import { FaUserMd, FaUserInjured, FaCalendarCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../lib/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTherapists: 0,
    pendingApprovals: 0,
    totalPatients: 0,
    activeAppointments: 0
  });
  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('therapists'); // 'therapists' or 'patients'
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/admin/login');
        return false;
      }
      
      if (user.role !== 'admin') {
        console.log('User is not an admin, redirecting to login');
        navigate('/admin/login');
        return false;
      }
      
      return true;
    };

    const fetchDashboardData = async () => {
      try {
        if (!checkAuth()) return;
        
        setLoading(true);
        setError(null);
        
        // Fetch dashboard stats
        const statsResponse = await adminApi.getDashboardStats();
        setStats(statsResponse.data);
        
        // Fetch therapists
        const therapistsResponse = await adminApi.getAllTherapists();
        setTherapists(therapistsResponse.data.data || []);
        
        // Fetch patients with registration data
        const patientsResponse = await adminApi.getAllPatients();
        if (patientsResponse.data && patientsResponse.data.data) {
          // Map the patient data to include all registration fields
          const formattedPatients = patientsResponse.data.data.map(patient => ({
            ...patient,
            name: patient.name || `${patient.firstName} ${patient.lastName}`,
            age: patient.age || calculateAge(patient.dateOfBirth),
            gender: patient.gender || 'Not specified',
            medicalHistory: patient.medicalHistory || 'No medical history provided'
          }));
          setPatients(formattedPatients);
        } else {
          setPatients([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter therapists based on search term
  const filteredTherapists = therapists.filter(therapist => 
    therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalHistory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
            <span className="ml-3 text-lg">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Therapists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaUserMd className="text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalTherapists}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserPlus className="text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">{stats.pendingApprovals}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaUserInjured className="text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalPatients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FaCalendarCheck className="text-purple-500 mr-2" />
              <span className="text-2xl font-bold">{stats.activeAppointments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Therapist/Patient List Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <Button 
              variant={activeTab === 'therapists' ? 'default' : 'outline'}
              onClick={() => setActiveTab('therapists')}
              className={activeTab === 'therapists' ? 'bg-blue-600' : ''}
            >
              Therapists
            </Button>
            <Button 
              variant={activeTab === 'patients' ? 'default' : 'outline'}
              onClick={() => setActiveTab('patients')}
              className={activeTab === 'patients' ? 'bg-blue-600' : ''}
            >
              Patients
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/approvals')}
            >
              Approvals
            </Button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Therapist List */}
        {activeTab === 'therapists' && (
          <div className="space-y-4">
            {filteredTherapists.length > 0 ? (
              filteredTherapists.map((therapist) => (
                <Card key={therapist._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={therapist.profilePicture} alt={therapist.name} />
                            <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{therapist.name}</h3>
                            <p className="text-sm text-gray-500">{therapist.specialization}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={therapist.status === 'approved' ? 'success' : therapist.status === 'rejected' ? 'destructive' : 'outline'}>
                            {therapist.status.charAt(0).toUpperCase() + therapist.status.slice(1)}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/therapists/${therapist._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No therapists found</p>
              </div>
            )}
          </div>
        )}

        {/* Patient List */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Registered Patients</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="grid gap-4">
              {filteredPatients.map(patient => (
                <Card key={patient._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={patient.profilePicture} alt={patient.name} />
                          <AvatarFallback>{patient.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{patient.name}</h3>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{patient.gender}</Badge>
                            <Badge variant="outline">{patient.age} years</Badge>
                            {patient.medicalHistory && (
                              <Badge variant="outline" className="max-w-[200px] truncate">
                                {patient.medicalHistory}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/patients/${patient._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No patients found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/therapists')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Therapists</h3>
          <p className="text-gray-600">View and manage all registered therapists</p>
        </button>

        <button
          onClick={() => navigate('/admin/patients')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Patients</h3>
          <p className="text-gray-600">View and manage all registered patients</p>
        </button>

        <button
          onClick={() => navigate('/admin/appointments')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Appointments</h3>
          <p className="text-gray-600">Monitor and manage all appointments</p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;