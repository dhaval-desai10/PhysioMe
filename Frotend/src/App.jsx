import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientExercisePlan from './pages/patient/ExercisePlan';
import BookAppointment from './pages/patient/BookAppointment';

// Therapist Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import TherapistProfile from './pages/therapist/TherapistProfile';
import TherapistAvailability from './pages/therapist/TherapistAvailability';
import Patients from './pages/therapist/Patients';
import TherapistExercisePlan from './pages/therapist/ExercisePlan';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TherapistApprovals from './pages/admin/TherapistApprovals';
import TherapistDetails from './pages/admin/TherapistDetails';
import PatientDetails from './pages/admin/PatientDetails';
import LoadingScreen from './components/LoadingScreen';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      >
        {/* Nested Patient Routes */}
        <Route path="profile" element={<PatientProfile />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="exercise-plan/:planId" element={<PatientExercisePlan />} />
        <Route path="exercise-plan" element={<PatientExercisePlan />} />
      </Route>

      {/* Book Appointment Route */}
      <Route 
        path="/therapist/:therapistId/book" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />

      {/* Protected Therapist Routes */}
      <Route
        path="/therapist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['physiotherapist']}>
            <TherapistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/patients"
        element={
          <ProtectedRoute allowedRoles={['physiotherapist']}>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/profile"
        element={
          <ProtectedRoute allowedRoles={['physiotherapist']}>
            <TherapistProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/availability"
        element={
          <ProtectedRoute allowedRoles={['physiotherapist']}>
            <TherapistAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/exercise-plan"
        element={
          <ProtectedRoute allowedRoles={['physiotherapist']}>
            <TherapistExercisePlan />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/therapist-approvals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TherapistApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/therapists"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TherapistApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/therapists/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TherapistDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PatientDetails />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
