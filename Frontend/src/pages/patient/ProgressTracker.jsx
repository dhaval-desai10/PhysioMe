import { useState, useEffect } from 'react';
import { progressService, treatmentPlanService } from '../../services/apiService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';

export default function ProgressTracker() {
  const [activePlans, setActivePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [progressData, setProgressData] = useState({
    exercises: [],
    overallPainLevel: 0,
    mood: 'okay',
    notes: '',
    images: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePlans();
  }, []);

  const fetchActivePlans = async () => {
    try {
      const response = await treatmentPlanService.getTreatmentPlans();
      const plans = response.data.filter(plan => plan.status === 'active');
      setActivePlans(plans);
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
        initializeExerciseProgress(plans[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      setLoading(false);
    }
  };

  const initializeExerciseProgress = (plan) => {
    const exercises = plan.exercises.map(ex => ({
      exercise: ex.exercise._id,
      setsCompleted: 0,
      repsCompleted: 0,
      painLevel: 0,
      difficulty: 3,
      notes: ''
    }));
    setProgressData(prev => ({ ...prev, exercises }));
  };

  const handlePlanChange = (planId) => {
    const plan = activePlans.find(p => p._id === planId);
    setSelectedPlan(plan);
    initializeExerciseProgress(plan);
  };

  const handleExerciseProgressChange = (exerciseId, field, value) => {
    setProgressData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.exercise === exerciseId
          ? { ...ex, [field]: value }
          : ex
      )
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProgressData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('treatmentPlanId', selectedPlan._id);
      formData.append('exercises', JSON.stringify(progressData.exercises));
      formData.append('overallPainLevel', progressData.overallPainLevel);
      formData.append('mood', progressData.mood);
      formData.append('notes', progressData.notes);

      progressData.images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      await progressService.createProgress(formData);

      // Reset form
      initializeExerciseProgress(selectedPlan);
      setProgressData(prev => ({
        ...prev,
        overallPainLevel: 0,
        mood: 'okay',
        notes: '',
        images: []
      }));

      alert('Progress logged successfully!');
    } catch (error) {
      console.error('Error logging progress:', error);
      alert('Error logging progress. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedPlan) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">No Active Treatment Plans</h1>
        <p>You don't have any active treatment plans to track progress for.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Daily Progress Tracker</h1>

      <div className="mb-6">
        <Label htmlFor="planSelect">Select Treatment Plan</Label>
        <Select
          id="planSelect"
          value={selectedPlan._id}
          onChange={(e) => handlePlanChange(e.target.value)}
        >
          {activePlans.map(plan => (
            <option key={plan._id} value={plan._id}>{plan.title}</option>
          ))}
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Exercise Progress</h2>
          {selectedPlan.exercises.map((planEx, index) => {
            const exercise = progressData.exercises[index];
            return (
              <Card key={planEx.exercise._id}>
                <CardHeader>
                  <CardTitle>{planEx.exercise.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sets Completed</Label>
                      <Input
                        type="number"
                        value={exercise.setsCompleted}
                        onChange={(e) => handleExerciseProgressChange(
                          planEx.exercise._id,
                          'setsCompleted',
                          parseInt(e.target.value)
                        )}
                        min="0"
                        max={planEx.sets}
                      />
                      <span className="text-sm text-muted-foreground">
                        Target: {planEx.sets} sets
                      </span>
                    </div>
                    <div>
                      <Label>Reps Completed</Label>
                      <Input
                        type="number"
                        value={exercise.repsCompleted}
                        onChange={(e) => handleExerciseProgressChange(
                          planEx.exercise._id,
                          'repsCompleted',
                          parseInt(e.target.value)
                        )}
                        min="0"
                        max={planEx.reps}
                      />
                      <span className="text-sm text-muted-foreground">
                        Target: {planEx.reps} reps
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Pain Level (0-10)</Label>
                    <Slider
                      value={[exercise.painLevel]}
                      onValueChange={([value]) => handleExerciseProgressChange(
                        planEx.exercise._id,
                        'painLevel',
                        value
                      )}
                      max={10}
                      step={1}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>No Pain</span>
                      <span>Severe Pain</span>
                    </div>
                  </div>

                  <div>
                    <Label>Difficulty Level (1-5)</Label>
                    <Slider
                      value={[exercise.difficulty]}
                      onValueChange={([value]) => handleExerciseProgressChange(
                        planEx.exercise._id,
                        'difficulty',
                        value
                      )}
                      min={1}
                      max={5}
                      step={1}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Very Easy</span>
                      <span>Very Hard</span>
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={exercise.notes}
                      onChange={(e) => handleExerciseProgressChange(
                        planEx.exercise._id,
                        'notes',
                        e.target.value
                      )}
                      placeholder="Any specific challenges or improvements?"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Overall Pain Level (0-10)</Label>
              <Slider
                value={[progressData.overallPainLevel]}
                onValueChange={([value]) => setProgressData(prev => ({ ...prev, overallPainLevel: value }))}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>No Pain</span>
                <span>Severe Pain</span>
              </div>
            </div>

            <div>
              <Label>Mood</Label>
              <Select
                value={progressData.mood}
                onChange={(e) => setProgressData(prev => ({ ...prev, mood: e.target.value }))}
              >
                <option value="great">Great</option>
                <option value="good">Good</option>
                <option value="okay">Okay</option>
                <option value="bad">Bad</option>
                <option value="terrible">Terrible</option>
              </Select>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={progressData.notes}
                onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any overall comments about today's session?"
              />
            </div>

            <div>
              <Label>Upload Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload images to document your progress (optional)
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          Log Today's Progress
        </Button>
      </form>
    </div>
  );
}