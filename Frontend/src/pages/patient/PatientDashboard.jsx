import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { patientApi } from '../../services/api';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, CalendarDays, ListChecks, BarChart3, XCircle, CheckCircle2, AlertTriangle, Loader2, User, Calendar, Clock, MapPin } from 'lucide-react';

// State will hold real data from API

const placeholderAppointments = [
  { id: 1, therapistName: 'Dr. Emily Carter', service: 'Knee Injury Assessment', date: '2023-10-25', time: '10:00 AM', status: 'approved' },
  { id: 2, therapistName: 'Dr. Johnathan Lee', service: 'Post-stroke mobility session', date: '2023-10-28', time: '02:00 PM', status: 'pending' },
  { id: 3, therapistName: 'Dr. Sarah Woods', service: 'Developmental check-up', date: '2023-11-05', time: '11:30 AM', status: 'rejected' },
  { id: 4, therapistName: 'Dr. Emily Carter', service: 'Follow-up session', date: '2023-11-10', time: '09:00 AM', status: 'pending' }, 
];

const placeholderExercisePlan = {
  planName: 'Knee Strength Recovery - Week 1',
  assignedBy: 'Dr. Emily Carter',
  exercises: [
    { name: 'Quad Sets', sets: 3, reps: 15, instructions: 'Tighten thigh muscle, hold for 5s.' },
    { name: 'Heel Slides', sets: 3, reps: 10, instructions: 'Gently bend and straighten knee.' },
    { name: 'Straight Leg Raises', sets: 3, reps: 10, instructions: 'Lift leg 6 inches off bed, keep knee straight.' },
  ]
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Get user from AuthContext
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved therapists
  useEffect(() => {
    const fetchApprovedTherapists = async () => {
      try {
        setLoading(true);
        console.log('Fetching approved therapists...'); // Debug log
        
        const response = await patientApi.getApprovedTherapists();
        console.log('Approved therapists response:', response); // Debug log
        
        if (response.data && response.data.data) {
          // Format therapist data
          const approvedTherapists = response.data.data.map(therapist => ({
            ...therapist,
            name: therapist.name || 'Unknown Therapist',
            specialization: therapist.specialization || 'General Physiotherapy',
            experience: therapist.experience || '0',
            clinicAddress: therapist.clinicAddress || {
              city: 'Location not specified'
            },
            status: 'approved' // Ensure status is set
          }));
          
          console.log('Formatted approved therapists:', approvedTherapists); // Debug log
          setTherapists(approvedTherapists);
          setError(null);
        } else {
          console.log('No therapists data in response'); // Debug log
          setTherapists([]);
          setError('No therapists available at the moment.');
        }
      } catch (err) {
        console.error('Error fetching approved therapists:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 403) {
          setError('You do not have permission to view therapists. Please contact support.');
        } else if (err.response?.status === 401) {
          setError('Please log in to view therapists.');
          // Redirect to login if not authenticated
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('The therapists list is currently unavailable. Please try again later.');
        } else {
          setError('Failed to load therapists. Please try again later.');
        }
        setTherapists([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'patient') {
      fetchApprovedTherapists();
    } else {
      setError('Please log in as a patient to view therapists.');
      setTherapists([]);
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
      navigate('/'); // Redirect if not authenticated or not a patient
    }
  }, [isAuthenticated, user, navigate]);

  // Filter logic for therapists
  const filteredTherapists = therapists.filter(therapist => 
    therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterSpecialization === '' || therapist.specialization?.toLowerCase() === filterSpecialization.toLowerCase()) &&
    (filterCity === '' || therapist.clinicAddress?.city?.toLowerCase() === filterCity.toLowerCase())
  );

  const handleCancelBooking = (appointmentId) => {
    // Placeholder: Implement actual cancellation logic
    console.log(`Cancel booking for appointment ID: ${appointmentId}`);
    alert(`Booking cancellation requested for appointment ${appointmentId}.`);
  };

  if (!user) {
    return <div className="p-8 text-center">Loading dashboard...</div>; // Or a loading spinner
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="py-8 min-h-screen bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container px-4 mx-auto">
        <motion.div 
          className="flex flex-col justify-between items-start mb-8 md:flex-row md:items-center"
          variants={itemVariants}
        >
          <div>
            <h1 className="mb-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Patient Dashboard</h1>
            <p className="flex items-center text-muted-foreground">
              <User size={16} className="mr-2 text-primary/70" />
              Welcome, {user.name || 'Patient'}!
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/patient/profile">
              <Button variant="outline" className="mt-4 md:mt-0 border-primary/20 hover:border-primary/50">
                View/Edit My Profile
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (or Main Content for smaller screens) */}
          <div className="space-y-8 lg:col-span-2">
            {/* Find a Therapist Section */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-md transition-shadow duration-300 border-primary/10 hover:shadow-lg">
                <CardHeader className="border-b bg-primary/5 border-primary/10">
                  <CardTitle className="flex items-center text-primary">
                    <Search className="mr-2 w-5 h-5 text-primary"/> 
                    Find a Physiotherapist
                  </CardTitle>
                  <CardDescription>Search and filter to find the right therapist for your needs.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <motion.div 
                    className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 transition-colors md:col-span-1 border-primary/20 focus:border-primary/50"
                      />
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                        <SelectTrigger className="w-full transition-colors border-primary/20 focus:border-primary/50">
                          <div className="flex items-center">
                            <Filter className="mr-2 w-4 h-4 text-primary/70" />
                            <SelectValue placeholder="Filter by Specialization" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Specializations</SelectItem>
                          {/* Dynamically generate specialization options */}
                          {Array.from(new Set(therapists.map(t => t.specialization)))
                            .filter(Boolean)
                            .sort()
                            .map(spec => (
                              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <Select value={filterCity} onValueChange={setFilterCity}>
                        <SelectTrigger className="w-full transition-colors border-primary/20 focus:border-primary/50">
                          <div className="flex items-center">
                            <MapPin className="mr-2 w-4 h-4 text-primary/70" />
                            <SelectValue placeholder="Filter by City" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          {/* Dynamically generate city options */}
                          {Array.from(new Set(therapists.map(t => t.clinicAddress?.city)))
                            .filter(Boolean)
                            .sort()
                            .map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="overflow-y-auto pr-1 space-y-4 max-h-96"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {loading ? (
                      <motion.div 
                        className="flex justify-center items-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 font-medium text-primary/80">Loading therapists...</span>
                      </motion.div>
                    ) : error ? (
                      <motion.div 
                        className="py-6 text-center text-red-500 bg-red-50 rounded-lg dark:bg-red-900/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertTriangle className="mx-auto mb-2 w-8 h-8" />
                        <p className="font-medium">{error}</p>
                      </motion.div>
                    ) : filteredTherapists.length > 0 ? filteredTherapists.map((therapist, index) => (
                      <motion.div
                        key={therapist._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      >
                        <Card className="flex overflow-hidden flex-col justify-between items-start p-4 sm:flex-row sm:items-center border-primary/10">
                          <div>
                            <h3 className="text-lg font-semibold text-primary/90">{therapist.name}</h3>
                            <p className="flex items-center mt-1 text-sm text-muted-foreground">
                              <MapPin size={14} className="mr-1 text-primary/70" />
                              {therapist.specialization} - {therapist.clinicAddress?.city || 'Location not specified'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary/80">
                                {therapist.experience} years exp.
                              </Badge>
                              {therapist.status === 'approved' && (
                                <Badge className="flex gap-1 items-center text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle2 size={12} />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to={`/therapist/${therapist._id}/book`}>
                              <Button size="sm" className="mt-3 shadow-sm sm:mt-0">
                                Book Appointment
                              </Button>
                            </Link>
                          </motion.div>
                        </Card>
                      </motion.div>
                    )) : (
                      <motion.div
                        className="py-8 text-center rounded-lg bg-primary/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Search className="mx-auto mb-2 w-10 h-10 text-primary/40" />
                        <p className="font-medium text-muted-foreground">No therapists match your criteria.</p>
                        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
                      </motion.div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Appointments Section */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-md transition-shadow duration-300 border-primary/10 hover:shadow-lg">
                <CardHeader className="border-b bg-primary/5 border-primary/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-primary">
                      <CalendarDays className="mr-2 w-5 h-5 text-primary"/> 
                      My Appointments
                    </CardTitle>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/patient/appointments">
                        <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
                          View All
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {placeholderAppointments.slice(0, 2).length > 0 ? (
                    <motion.ul 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {placeholderAppointments.slice(0, 2).map((appt, index) => (
                        <motion.li 
                          key={appt.id} 
                          className="p-4 rounded-lg border shadow-sm transition-all bg-card dark:bg-card/80 border-primary/10 hover:shadow-md"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-primary/90">{appt.therapistName}</p>
                            <Badge variant={
                                appt.status === 'approved' ? 'default' : 
                                appt.status === 'pending' ? 'secondary' :
                                appt.status === 'rejected' ? 'destructive' :
                                'outline' 
                              }
                              className={`
                                ${appt.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                ${appt.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                ${appt.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                              `}
                            >
                              {appt.status === 'approved' && <CheckCircle2 className="mr-1 w-3 h-3" />}
                              {appt.status === 'pending' && <Clock className="mr-1 w-3 h-3" />}
                              {appt.status === 'rejected' && <XCircle className="mr-1 w-3 h-3" />}
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Calendar className="mr-2 w-4 h-4 text-primary/70" />
                            {new Date(appt.date).toLocaleDateString()} at {appt.time}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">{appt.service}</p>
                          </div>
                          <motion.div 
                            className="mt-3" 
                            whileHover={{ x: 5 }} 
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Link to={`/patient/appointments`}>
                              <Button variant="link" size="sm" className="flex gap-1 items-center p-0 h-auto text-primary">
                                View Details
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Button>
                            </Link>
                          </motion.div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : (
                    <motion.div 
                      className="py-8 text-center rounded-lg bg-primary/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CalendarDays className="mx-auto mb-2 w-10 h-10 text-primary/40" />
                      <p className="font-medium text-muted-foreground">No upcoming appointments.</p>
                      <p className="mt-1 text-sm text-muted-foreground">Book an appointment with a therapist.</p>
                    </motion.div>
                  )}
                  <motion.div 
                    className="mt-6" 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to="/patient/appointments" className="block">
                      <Button className="w-full shadow-sm">Manage Appointments</Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column (Sidebar for larger screens) */}
          <div className="space-y-8 lg:col-span-1">
            {/* My Exercise Plan Section */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-md transition-shadow duration-300 border-primary/10 hover:shadow-lg">
                <CardHeader className="border-b bg-primary/5 border-primary/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-primary">
                      <ListChecks className="mr-2 w-5 h-5 text-primary"/> 
                      My Exercise Plan
                    </CardTitle>
                    {placeholderExercisePlan && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to={`/patient/exercise-plan/${placeholderExercisePlan.id || 'current'}`}> 
                          <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
                            View Plan
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {placeholderExercisePlan ? (
                    <motion.div 
                      className="p-4 rounded-lg border shadow-sm bg-card dark:bg-card/80 border-primary/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    >
                      <h3 className="font-medium text-primary/90">{placeholderExercisePlan.planName}</h3>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <User className="mr-2 w-4 h-4 text-primary/70" />
                        Assigned by: {placeholderExercisePlan.assignedBy}
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        {placeholderExercisePlan.exercises.slice(0, 2).map((exercise, index) => (
                          <motion.div 
                            key={index}
                            className="p-2 text-sm rounded-md bg-primary/5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="font-medium">{exercise.name}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps
                            </div>
                          </motion.div>
                        ))}
                        {placeholderExercisePlan.exercises.length > 2 && (
                          <div className="mt-1 text-xs text-center text-muted-foreground">
                            +{placeholderExercisePlan.exercises.length - 2} more exercises
                          </div>
                        )}
                      </div>
                      
                      <motion.div 
                        className="mt-4" 
                        whileHover={{ x: 5 }} 
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Link to={`/patient/exercise-plan/${placeholderExercisePlan.id || 'current'}`}> 
                          <Button variant="link" size="sm" className="flex gap-1 items-center p-0 h-auto text-primary">
                            Continue Plan
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Button>
                        </Link>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="py-8 text-center rounded-lg bg-primary/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListChecks className="mx-auto mb-2 w-10 h-10 text-primary/40" />
                      <p className="font-medium text-muted-foreground">No active exercise plan.</p>
                      <p className="mt-1 text-sm text-muted-foreground">Your therapist will assign one soon.</p>
                    </motion.div>
                  )}
                  <motion.div 
                    className="mt-6" 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    {!placeholderExercisePlan ? (
                      <Button className="w-full shadow-sm" disabled>No Plan Assigned</Button> 
                    ) : (
                      <Link to={`/patient/exercise-plan/${placeholderExercisePlan.id || 'current'}`} className="block">
                        <Button className="w-full shadow-sm">Access Full Exercise Plan</Button>
                      </Link>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Progress Log & Chart Section */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-md transition-shadow duration-300 border-primary/10 hover:shadow-lg">
                <CardHeader className="border-b bg-primary/5 border-primary/10">
                  <CardTitle className="flex items-center text-primary">
                    <BarChart3 className="mr-2 w-5 h-5 text-primary"/> 
                    Daily Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Placeholder for progress log input and chart */}
                  <motion.p 
                    className="mb-4 text-center text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Log your daily activities and see your progress over time.
                  </motion.p>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="mb-6"
                  >
                    <Button className="w-full bg-gradient-to-r shadow-sm from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      Log Today's Progress
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    className="overflow-hidden rounded-lg border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="p-3 border-b bg-primary/5 border-primary/10">
                      <h3 className="flex items-center text-sm font-medium text-primary/90">
                        <BarChart3 className="mr-2 w-4 h-4" />
                        Weekly Activity
                      </h3>
                    </div>
                    <div className="flex flex-col justify-center items-center p-4 h-48 bg-card dark:bg-card/80">
                      <div className="flex gap-2 justify-around items-end w-full h-full">
                        {[35, 60, 45, 80, 55, 30, 65].map((height, index) => (
                          <motion.div 
                            key={index}
                            className="w-full rounded-t-sm bg-primary/70"
                            style={{ height: `${height}%` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.5, type: "spring" }}
                            whileHover={{ backgroundColor: "var(--primary)" }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-around mt-2 w-full">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                          <div key={index} className="text-xs text-muted-foreground">{day}</div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}