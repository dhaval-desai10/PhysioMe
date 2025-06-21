import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'react-hot-toast';
import { CheckCircle2, PlayCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';

// Placeholder data - replace with API calls
const placeholderExercisePlan = {
  _id: '1',
  title: 'Knee Strength Recovery - Week 1',
  description: 'This plan focuses on rebuilding strength in your knee after surgery. Start slowly and gradually increase intensity as comfort allows.',
  therapist: {
    _id: '101',
    name: 'Dr. Emily Carter',
    specialization: 'Sports Injury'
  },
  createdAt: '2023-10-15',
  exercises: [
    { 
      _id: 'ex1', 
      name: 'Quad Sets', 
      sets: 3, 
      reps: 15, 
      instructions: 'Sit with your leg extended. Tighten your thigh muscle, pushing the back of your knee down. Hold for 5 seconds, then relax.', 
      videoLink: 'https://www.youtube.com/watch?v=example1' 
    },
    { 
      _id: 'ex2', 
      name: 'Heel Slides', 
      sets: 3, 
      reps: 10, 
      instructions: 'Lie on your back. Slowly bend and straighten your knee by sliding your heel forward and backward.', 
      videoLink: 'https://www.youtube.com/watch?v=example2' 
    },
    { 
      _id: 'ex3', 
      name: 'Straight Leg Raises', 
      sets: 3, 
      reps: 10, 
      instructions: 'Lie on your back with one knee bent and the other straight. Lift the straight leg up about 12 inches, hold briefly, then lower.', 
      videoLink: 'https://www.youtube.com/watch?v=example3' 
    },
  ]
};

export default function PatientExercisePlan() {
  const { planId } = useParams();
  const { user } = useAuth();
  const [exercisePlan, setExercisePlan] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plan');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchExercisePlan();
    // Load any saved progress from localStorage
    const savedProgress = localStorage.getItem(`exercisePlan_${planId || '1'}_progress`);
    if (savedProgress) {
      setCompletedExercises(JSON.parse(savedProgress));
    }
  }, [planId]);

  useEffect(() => {
    // Calculate progress whenever completedExercises changes
    if (exercisePlan) {
      const totalExercises = exercisePlan.exercises.length;
      const completedCount = Object.values(completedExercises).filter(Boolean).length;
      setProgress(Math.round((completedCount / totalExercises) * 100));
    }
  }, [completedExercises, exercisePlan]);

  const fetchExercisePlan = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await axios.get(`/api/patient/exercise-plans/${planId}`);
      // setExercisePlan(response.data);
      
      // Using placeholder data for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setExercisePlan(placeholderExercisePlan);
    } catch (error) {
      console.error('Error fetching exercise plan:', error);
      toast.error('Failed to load exercise plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleExerciseCompletion = (exerciseId) => {
    const updatedCompletions = {
      ...completedExercises,
      [exerciseId]: !completedExercises[exerciseId]
    };
    setCompletedExercises(updatedCompletions);
    
    // Save progress to localStorage
    localStorage.setItem(`exercisePlan_${planId || '1'}_progress`, JSON.stringify(updatedCompletions));
    
    // Optionally, send to server
    // axios.post('/api/patient/exercise-progress', { planId, exerciseId, completed: updatedCompletions[exerciseId] });
  };

  const logDailyProgress = async () => {
    try {
      // Replace with actual API call
      // await axios.post('/api/patient/daily-progress', { planId, completedExercises, date: new Date() });
      toast.success('Progress logged successfully!');
      
      // Reset completions after logging
      setCompletedExercises({});
      localStorage.removeItem(`exercisePlan_${planId || '1'}_progress`);
    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error('Failed to log progress');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading exercise plan...</div>;
  }

  if (!exercisePlan) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">No exercise plan found.</p>
        <Link to="/patient/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/patient/dashboard" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{exercisePlan.title}</h1>
        </div>
        
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">Assigned by: {exercisePlan.therapist.name}</p>
                  <p className="text-muted-foreground mb-4">Date: {new Date(exercisePlan.createdAt).toLocaleDateString()}</p>
                  <p>{exercisePlan.description}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-8 flex flex-col items-center">
                  <div className="relative h-24 w-24">
                    <svg className="h-24 w-24" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{progress}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Today's Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">Exercise Plan</TabsTrigger>
            <TabsTrigger value="progress">Track Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan" className="mt-6">
            <div className="space-y-6">
              {exercisePlan.exercises.map((exercise, index) => (
                <Card key={exercise._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      {exercise.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{exercise.sets} sets</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{exercise.reps} reps</span>
                      </div>
                      {exercise.videoLink && (
                        <a 
                          href={exercise.videoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <PlayCircle className="h-5 w-5 mr-2" />
                          Watch Video
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground">{exercise.instructions}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Track Today's Progress</CardTitle>
                <CardDescription>Check off exercises as you complete them</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercisePlan.exercises.map((exercise) => (
                    <div key={exercise._id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50">
                      <Checkbox 
                        id={`exercise-${exercise._id}`} 
                        checked={!!completedExercises[exercise._id]}
                        onCheckedChange={() => toggleExerciseCompletion(exercise._id)}
                      />
                      <label 
                        htmlFor={`exercise-${exercise._id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">{exercise.sets} sets × {exercise.reps} reps</div>
                      </label>
                      {completedExercises[exercise._id] && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={logDailyProgress} 
                  disabled={Object.values(completedExercises).filter(Boolean).length === 0}
                  className="w-full"
                >
                  Log Today's Progress
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}