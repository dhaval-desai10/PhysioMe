import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Patients() {
  const [patients] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      condition: 'Lower Back Pain',
      lastVisit: '2024-03-15',
      nextAppointment: '2024-03-22',
      progress: 75
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      condition: 'Shoulder Injury',
      lastVisit: '2024-03-18',
      nextAppointment: '2024-03-25',
      progress: 60
    },
    {
      id: 3,
      name: 'Mike Johnson',
      age: 28,
      condition: 'Sports Rehabilitation',
      lastVisit: '2024-03-19',
      nextAppointment: '2024-03-26',
      progress: 85
    }
  ]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage your patient records and progress</p>
          </div>
          <Button>Add New Patient</Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Patients List */}
        <div className="space-y-6">
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} years • {patient.condition}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end space-y-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Visit</p>
                          <p className="font-medium">{patient.lastVisit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Appointment</p>
                          <p className="font-medium">{patient.nextAppointment}</p>
                        </div>
                      </div>
                      <div className="w-full md:w-48">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{patient.progress}%</span>
                        </div>
                        <div className="h-2 bg-primary/10 rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${patient.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 