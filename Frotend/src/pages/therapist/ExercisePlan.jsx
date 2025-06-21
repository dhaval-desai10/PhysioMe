import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'react-hot-toast';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';

export default function ExercisePlan() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      patientId: patientId || '',
      exercises: [
        { name: '', sets: 3, reps: 10, instructions: '', videoLink: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises"
  });

  useEffect(() => {
    // Fetch patients list for the dropdown if patientId is not provided
    if (!patientId) {
      fetchPatients();
    }
    setLoading(false);
  }, [patientId]);

  const fetchPatients = async () => {
    try {
      // Replace with actual API call
      // const response = await axios.get('/api/therapist/patients');
      // setPatients(response.data);
      
      // Placeholder data
      setPatients([
        { _id: '1', firstName: 'John', lastName: 'Doe' },
        { _id: '2', firstName: 'Jane', lastName: 'Smith' },
        { _id: '3', firstName: 'Mike', lastName: 'Johnson' }
      ]);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients list');
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Replace with actual API call
      // await axios.post('/api/therapist/exercise-plans', data);
      console.log('Exercise plan data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      toast.success('Exercise plan created successfully!');
      navigate('/therapist/dashboard');
    } catch (error) {
      console.error('Error creating exercise plan:', error);
      toast.error('Failed to create exercise plan');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    append({ name: '', sets: 3, reps: 10, instructions: '', videoLink: '' });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Create Exercise Plan</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Create a personalized exercise plan for your patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title</Label>
                  <Input 
                    id="title" 
                    {...register('title', { required: 'Plan title is required' })} 
                    placeholder="e.g., Knee Rehabilitation - Week 1"
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>
                
                {!patientId && (
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Select Patient</Label>
                    <select
                      id="patientId"
                      className="w-full p-2 border rounded-md"
                      {...register('patientId', { required: 'Patient selection is required' })}
                    >
                      <option value="">Select a patient</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && <p className="text-sm text-red-500">{errors.patientId.message}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Plan Description</Label>
                <Textarea 
                  id="description" 
                  {...register('description', { required: 'Description is required' })} 
                  placeholder="Provide an overview of this exercise plan and its goals"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>Add exercises to this plan</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="mb-8 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Exercise {index + 1}</h3>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Exercise Name</Label>
                      <Input 
                        {...register(`exercises.${index}.name`, { required: 'Exercise name is required' })} 
                        placeholder="e.g., Knee Extensions"
                      />
                      {errors.exercises?.[index]?.name && (
                        <p className="text-sm text-red-500">{errors.exercises[index].name.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sets</Label>
                        <Input 
                          type="number" 
                          {...register(`exercises.${index}.sets`, { 
                            required: 'Required', 
                            valueAsNumber: true,
                            min: { value: 1, message: 'Min 1' } 
                          })} 
                        />
                        {errors.exercises?.[index]?.sets && (
                          <p className="text-sm text-red-500">{errors.exercises[index].sets.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Reps</Label>
                        <Input 
                          type="number" 
                          {...register(`exercises.${index}.reps`, { 
                            required: 'Required', 
                            valueAsNumber: true,
                            min: { value: 1, message: 'Min 1' } 
                          })} 
                        />
                        {errors.exercises?.[index]?.reps && (
                          <p className="text-sm text-red-500">{errors.exercises[index].reps.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label>Instructions</Label>
                    <Textarea 
                      {...register(`exercises.${index}.instructions`, { required: 'Instructions are required' })} 
                      placeholder="Detailed instructions for performing this exercise"
                    />
                    {errors.exercises?.[index]?.instructions && (
                      <p className="text-sm text-red-500">{errors.exercises[index].instructions.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Video Link (Optional)</Label>
                    <Input 
                      {...register(`exercises.${index}.videoLink`)} 
                      placeholder="e.g., https://youtube.com/watch?v=example"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addExercise}
                className="w-full mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Another Exercise
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Exercise Plan'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}