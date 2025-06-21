import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function PatientAppointments() {
  const { patientId } = useParams();
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: 'consultation',
    duration: 30,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      const [patientRes, appointmentsRes] = await Promise.all([
        axios.get(`/api/therapist/patients/${patientId}`),
        axios.get(`/api/therapist/patients/${patientId}/appointments`)
      ]);

      setPatientInfo(patientRes.data);
      setAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!newAppointment.date) {
      toast.error('Please select a date first');
      return;
    }

    try {
      const response = await axios.get('/api/therapist/availability', {
        params: {
          date: newAppointment.date,
          duration: newAppointment.duration
        }
      });
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/therapist/patients/${patientId}/appointments`, {
        ...newAppointment,
        datetime: `${newAppointment.date}T${newAppointment.time}`
      });

      setAppointments(prev => [response.data, ...prev]);
      setNewAppointment({
        date: '',
        time: '',
        type: 'consultation',
        duration: 30,
        notes: ''
      });
      setAvailableSlots([]);
      toast.success('Appointment created successfully');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await axios.patch(`/api/therapist/appointments/${appointmentId}`, {
        status: newStatus
      });

      setAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!patientInfo) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Appointments - {patientInfo.firstName} {patientInfo.lastName}
        </h1>
        <p className="text-gray-500">{patientInfo.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Schedule New Appointment */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => {
                    setNewAppointment({ ...newAppointment, date: e.target.value });
                    setAvailableSlots([]);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  id="type"
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                >
                  <option value="consultation">Consultation</option>
                  <option value="assessment">Assessment</option>
                  <option value="treatment">Treatment</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="video">Video Consultation</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  id="duration"
                  value={newAppointment.duration}
                  onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={checkAvailability}
              >
                Check Available Slots
              </Button>

              {availableSlots.length > 0 && (
                <div>
                  <Label htmlFor="time">Available Time Slots</Label>
                  <Select
                    id="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  >
                    <option value="">Select a time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Add any notes about the appointment"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!newAppointment.date || !newAppointment.time}
              >
                Schedule Appointment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {appointments.map(appointment => (
              <Card key={appointment._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {appointment.type} Session
                      </h3>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(appointment.datetime)}
                      </div>
                      <div className="text-sm">
                        Duration: {appointment.duration} minutes
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-gray-600">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {appointments.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No appointments found for this patient
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}