import { useState, useEffect } from 'react';
import { progressService, treatmentPlanService } from '../../services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MOOD_COLORS = {
  great: '#4CAF50',
  good: '#8BC34A',
  okay: '#FFC107',
  bad: '#FF9800',
  terrible: '#F44336'
};

export default function ProgressReport() {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreatmentPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      fetchProgressStats();
    }
  }, [selectedPlan]);

  const fetchTreatmentPlans = async () => {
    try {
      const response = await treatmentPlanService.getTreatmentPlans();
      setTreatmentPlans(response.data);
      if (response.data.length > 0) {
        setSelectedPlan(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const response = await progressService.getProgressStats(selectedPlan._id);
      setProgressStats(response.data);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedPlan || !progressStats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">No Progress Data</h1>
        <p>No treatment plans or progress data available.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Progress Report</h1>

      <div className="mb-6">
        <Label htmlFor="planSelect">Select Treatment Plan</Label>
        <Select
          id="planSelect"
          value={selectedPlan._id}
          onChange={(e) => setSelectedPlan(treatmentPlans.find(p => p._id === e.target.value))}
        >
          {treatmentPlans.map(plan => (
            <option key={plan._id} value={plan._id}>{plan.title}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Level Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Pain Level Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressStats.painLevelTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    labelFormatter={formatDate}
                    formatter={(value) => [`Pain Level: ${value}`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#ff0000"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(progressStats.exerciseCompletion).map(([id, stats]) => ({
                    name: selectedPlan.exercises.find(ex => ex.exercise._id === id)?.exercise.name || 'Unknown',
                    completedDays: stats.completedDays,
                    averagePainLevel: stats.averagePainLevel
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="completedDays" fill="#8884d8" name="Days Completed" />
                  <Bar yAxisId="right" dataKey="averagePainLevel" fill="#82ca9d" name="Avg Pain Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(progressStats.moodDistribution).map(([mood, count]) => ({
                      name: mood,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(progressStats.moodDistribution).map(([mood]) => (
                      <Cell key={mood} fill={MOOD_COLORS[mood]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {Object.entries(MOOD_COLORS).map(([mood, color]) => (
                  <div key={mood} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm capitalize">{mood}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Total Progress Entries</h3>
                <p className="text-2xl">{progressStats.totalEntries}</p>
              </div>
              <div>
                <h3 className="font-semibold">Current Pain Level Trend</h3>
                <p className="text-lg">
                  {progressStats.painLevelTrend.length > 1 
                    ? progressStats.painLevelTrend[progressStats.painLevelTrend.length - 1].level < 
                      progressStats.painLevelTrend[0].level
                      ? 'Improving 📉'
                      : 'Needs Attention 📈'
                    : 'Not enough data'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Most Common Mood</h3>
                <p className="text-lg capitalize">
                  {Object.entries(progressStats.moodDistribution)
                    .reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}