import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authService';

export default function TherapistDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (response.user.role !== 'therapist') {
          navigate('/');
        }
      } catch (error) {
        navigate('/');
      }
    };

    verifyAuth();
  }, [navigate]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Therapist Dashboard</h1>
      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground">
            Here you can manage your patients, schedule appointments, and create treatment plans.
          </p>
        </div>
      </div>
    </div>
  );
}