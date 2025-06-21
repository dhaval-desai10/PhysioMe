import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { toast } from 'react-hot-toast';
import { CalendarDays, Clock, User, MapPin, XCircle, CheckCircle2, AlertTriangle, Hourglass, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';

// Placeholder data - replace with API calls
const placeholderAppointments = [
  {
    _id: 'appt1',
    therapist: { _id: 'therapist1', name: 'Dr. Emily Carter', specialization: 'Sports Injury', clinicName: 'HealWell Clinic', clinicAddress: '123 Wellness St, Cityville' },
    date: '2024-07-25',
    time: '10:00 AM',
    reason: 'Follow-up for knee pain',
    status: 'Confirmed',
  },
  {
    _id: 'appt2',
    therapist: { _id: 'therapist2', name: 'Dr. John Smith', specialization: 'Pediatrics', clinicName: 'KidsPhysio Center', clinicAddress: '456 Child Ave, Townsville' },
    date: '2024-07-28',
    time: '02:30 PM',
    reason: 'Initial consultation for ankle sprain',
    status: 'Pending',
  },
  {
    _id: 'appt3',
    therapist: { _id: 'therapist1', name: 'Dr. Emily Carter', specialization: 'Sports Injury', clinicName: 'HealWell Clinic', clinicAddress: '123 Wellness St, Cityville' },
    date: '2024-07-15',
    time: '09:00 AM',
    reason: 'Post-surgery rehabilitation',
    status: 'Completed',
  },
  {
    _id: 'appt4',
    therapist: { _id: 'therapist3', name: 'Dr. Sarah Lee', specialization: 'Geriatrics', clinicName: 'ActiveLife Physio', clinicAddress: '789 Senior Rd, Oldtown' },
    date: '2024-07-10',
    time: '11:00 AM',
    reason: 'Mobility assessment',
    status: 'Cancelled',
  },
];

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await axios.get(`/api/patient/appointments/${user._id}`);
      // setAppointments(response.data);
      
      // Using placeholder data for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setAppointments(placeholderAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      // Replace with actual API call
      // await axios.put(`/api/patient/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      // Refresh appointments list
      fetchAppointments(); 
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Confirmed</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white"><Hourglass className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'Completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filterAppointments = (statusType) => {
    const now = new Date();
    return appointments.filter(appt => {
      const apptDate = new Date(`${appt.date}T${appt.time.includes('PM') && parseInt(appt.time.split(':')[0]) !== 12 ? (parseInt(appt.time.split(':')[0]) + 12) : appt.time.split(':')[0]}:${appt.time.split(':')[1].substring(0,2)}`);
      if (statusType === 'upcoming') {
        return (appt.status === 'Confirmed' || appt.status === 'Pending') && apptDate >= now;
      }
      if (statusType === 'past') {
        return appt.status === 'Completed' || appt.status === 'Cancelled' || ((appt.status === 'Confirmed' || appt.status === 'Pending') && apptDate < now);
      }
      return true; // For 'all'
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent first
  };

  if (loading) {
    return <div className="p-8 text-center">Loading appointments...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
            <Link to="/patient/dashboard" className="mr-4">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold">My Appointments</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {['upcoming', 'past', 'all'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="mt-6">
              {filterAppointments(tabValue).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments in this category.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filterAppointments(tabValue).map(appt => (
                    <Card key={appt._id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{appt.therapist.name}</CardTitle>
                            {getStatusBadge(appt.status)}
                        </div>
                        <CardDescription>{appt.therapist.specialization}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{appt.time}</span>
                          </div>
                          <div className="flex items-start">
                            <User className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>Reason: {appt.reason}</span>
                          </div>
                           <div className="flex items-start">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>{appt.therapist.clinicName}, {appt.therapist.clinicAddress}</span>
                          </div>
                        </div>
                      </CardContent>
                      {(appt.status === 'Confirmed' || appt.status === 'Pending') && new Date(`${appt.date}T${appt.time}`) >= new Date() && (
                        <div className="p-4 border-t">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-600"
                            onClick={() => cancelAppointment(appt._id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Appointment
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-8 text-center">
          <Link to="/patient/dashboard#find-therapist">
            <Button size="lg">Book New Appointment</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}