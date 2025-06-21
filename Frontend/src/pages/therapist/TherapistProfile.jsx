import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-hot-toast';
import { therapistApi } from '../../services/api';
import { useAuth } from '../../lib/AuthContext';
import { Camera, Loader2 } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DEFAULT_WORKING_HOURS = {
  start: '09:00',
  end: '17:00'
};

const DEFAULT_APPOINTMENT_DURATION = 30; // Default 30 minutes

const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

export default function TherapistProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      experience: 0,
      licenseNumber: '',
      clinicName: '',
      clinicAddress: '',
      bio: '',
      workingHours: DEFAULT_WORKING_HOURS,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      appointmentDuration: DEFAULT_APPOINTMENT_DURATION
    },
    mode: 'onChange'
  });

  const profilePictureFile = watch('profilePicture');
  const workingDays = watch('workingDays') || [];
  const workingHours = watch('workingHours') || DEFAULT_WORKING_HOURS;
  const appointmentDuration = watch('appointmentDuration') || DEFAULT_APPOINTMENT_DURATION;

  useEffect(() => {
    if (user?._id) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profilePictureFile && profilePictureFile[0]) {
      const newPreviewUrl = URL.createObjectURL(profilePictureFile[0]);
      setPreviewUrl(newPreviewUrl);
      return () => URL.revokeObjectURL(newPreviewUrl);
    } else if (user?.profilePictureUrl) {
      setPreviewUrl(user.profilePictureUrl);
    } else {
      setPreviewUrl('https://ui-avatars.com/api/?name=No+Image&background=random');
    }
  }, [profilePictureFile, user?.profilePictureUrl]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await therapistApi.getProfile(user._id);
      if (response.data.success) {
        const profileData = response.data.data;
        
        // Set profile image preview
        if (profileData.profilePictureUrl) {
          setPreviewUrl(profileData.profilePictureUrl);
        } else {
          setPreviewUrl('https://ui-avatars.com/api/?name=No+Image&background=random');
        }

        // Split name into firstName and lastName
        const nameParts = profileData.name?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Map the data to match the form structure
        const formData = {
          firstName,
          lastName,
          email: profileData.email || '',
          phone: profileData.phone || '',
          specialization: profileData.specialization || '',
          experience: profileData.experience || 0,
          licenseNumber: profileData.licenseNumber || '',
          clinicName: profileData.clinicName || '',
          clinicAddress: profileData.clinicAddress || '',
          bio: profileData.bio || '',
          workingHours: profileData.workingHours || DEFAULT_WORKING_HOURS,
          workingDays: profileData.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          appointmentDuration: profileData.appointmentDuration || DEFAULT_APPOINTMENT_DURATION
        };

        console.log("Fetched profile data:", profileData);
        console.log("Form data to be set:", formData);

        // Set form values
        Object.keys(formData).forEach(key => {
          setValue(key, formData[key]);
        });
        reset(formData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingDayChange = (day) => {
    const currentDays = watch('workingDays') || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setValue('workingDays', newDays);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!user || !user._id) {
        throw new Error('User information not available');
      }

      console.log("Form data being submitted:", data);

      // Create FormData object for file upload
      const formData = new FormData();
      
      // Handle name (combine firstName and lastName)
      const firstName = data.firstName?.trim() || '';
      const lastName = data.lastName?.trim() || '';
      formData.append('name', `${firstName} ${lastName}`.trim());
      
      // Add other form fields with proper validation
      formData.append('email', data.email || '');
      formData.append('phone', data.phone || '');
      formData.append('specialization', data.specialization || '');
      formData.append('experience', data.experience || 0);
      formData.append('licenseNumber', data.licenseNumber || '');
      formData.append('clinicName', data.clinicName || '');
      formData.append('clinicAddress', data.clinicAddress || '');
      formData.append('bio', data.bio || '');
      
      // Handle working hours and days
      const workingHours = data.workingHours || DEFAULT_WORKING_HOURS;
      const workingDays = data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      // Add working hours as JSON string to ensure proper formatting
      formData.append('workingHours', JSON.stringify(workingHours));
      
      // Add working days as JSON string to ensure proper array handling
      formData.append('workingDays', JSON.stringify(workingDays));
      
      // Add appointment duration
      formData.append('appointmentDuration', data.appointmentDuration || DEFAULT_APPOINTMENT_DURATION);
      
      // Handle profile picture if selected
      if (data.profilePicture && data.profilePicture.length > 0) {
        const file = data.profilePicture[0];
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG)');
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        
        // Append the file with the correct field name
        formData.append('profilePicture', file, file.name);
        console.log('Appending profile picture:', file.name, file.type, file.size);
      }

      // Log the FormData contents for debugging
      console.log('FormData contents:', Array.from(formData.entries()).map(entry => {
        if (entry[1] instanceof File) {
          return `${entry[0]}: File(${entry[1].name}, ${entry[1].type}, ${entry[1].size} bytes)`;
        }
        return `${entry[0]}: ${entry[1]}`;
      }));

      const response = await therapistApi.updateProfile(user._id, formData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        
        // Update the user data in localStorage and context
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: response.data.data.name,
            email: response.data.data.email,
            phone: response.data.data.phone,
            specialization: response.data.data.specialization,
            experience: response.data.data.experience,
            licenseNumber: response.data.data.licenseNumber,
            clinicName: response.data.data.clinicName,
            clinicAddress: response.data.data.clinicAddress,
            bio: response.data.data.bio,
            profilePictureUrl: response.data.data.profilePictureUrl,
            workingHours: response.data.data.workingHours,
            workingDays: response.data.data.workingDays,
            appointmentDuration: response.data.data.appointmentDuration
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

        // Update form with new data
        const updatedData = response.data.data;
        console.log("Updated profile data received:", updatedData);
        
        const nameParts = updatedData.name?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        reset({
          firstName,
          lastName,
          email: updatedData.email || '',
          phone: updatedData.phone || '',
          specialization: updatedData.specialization || '',
          experience: updatedData.experience || 0,
          licenseNumber: updatedData.licenseNumber || '',
          clinicName: updatedData.clinicName || '',
          clinicAddress: updatedData.clinicAddress || '',
          bio: updatedData.bio || '',
          workingHours: updatedData.workingHours || DEFAULT_WORKING_HOURS,
          workingDays: updatedData.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          appointmentDuration: updatedData.appointmentDuration || DEFAULT_APPOINTMENT_DURATION
        });

        // Update profile picture preview
        if (updatedData.profilePictureUrl) {
          setPreviewUrl(updatedData.profilePictureUrl);
        }

        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
 
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reload the original data
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Header with Image */}
            <Card className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-primary to-primary-dark">
                <div className="absolute left-8 -bottom-16">
                  <div className="relative group">
                    <div className="overflow-hidden w-32 h-32 bg-white rounded-full border-4 border-white">
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {isEditing && (
                      <label className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-50 rounded-full opacity-0 transition-opacity cursor-pointer group-hover:opacity-100">
                        <Camera className="w-8 h-8 text-white" />
                        <input
                          type="file"
                          {...register('profilePicture')}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="pt-20">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        {...register('firstName', { required: 'First name is required' })}
                      />
                    ) : (
                      <p className="text-lg">{watch('firstName')}</p>
                    )}
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        {...register('lastName', { required: 'Last name is required' })}
                      />
                    ) : (
                      <p className="text-lg">{watch('lastName')}</p>
                    )}
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <p className="text-lg">{watch('email')}</p>
                  </div>
                </div>
                
                {/* Appointment Duration */}
                <div className="space-y-4">
                  <Label htmlFor="appointmentDuration">Appointment Duration</Label>
                  <div className="max-w-xs">
                    {isEditing ? (
                      <Select
                        value={appointmentDuration.toString()}
                        onValueChange={(value) => setValue('appointmentDuration', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {APPOINTMENT_DURATIONS.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value.toString()}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-lg">
                        {APPOINTMENT_DURATIONS.find(d => d.value === appointmentDuration)?.label || '30 minutes'}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    This is the default duration for each appointment slot in your schedule.
                    Patients will be able to book appointments in these time increments.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Your professional details and practice information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    {isEditing ? (
                      <Input
                        id="specialization"
                        {...register('specialization')}
                      />
                    ) : (
                      <p className="text-lg">{watch('specialization')}</p>
                    )}
                    {errors.specialization && <p className="text-sm text-red-500">{errors.specialization.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        {...register('experience', {
                          valueAsNumber: true,
                          min: { value: 0, message: 'Experience cannot be negative' }
                        })}
                      />
                    ) : (
                      <p className="text-lg">{watch('experience')} years</p>
                    )}
                    {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        {...register('phone')}
                      />
                    ) : (
                      <p className="text-lg">{watch('phone')}</p>
                    )}
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    {isEditing ? (
                      <Input
                        id="licenseNumber"
                        {...register('licenseNumber')}
                      />
                    ) : (
                      <p className="text-lg">{watch('licenseNumber')}</p>
                    )}
                    {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    {isEditing ? (
                      <Input
                        id="clinicName"
                        {...register('clinicName')}
                      />
                    ) : (
                      <p className="text-lg">{watch('clinicName') || 'Not specified'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicAddress">Clinic Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="clinicAddress"
                        {...register('clinicAddress')}
                      />
                    ) : (
                      <p className="text-lg">{watch('clinicAddress') || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      {...register('bio', {
                        maxLength: { value: 500, message: 'Bio cannot exceed 500 characters' }
                      })}
                      placeholder="Tell patients about your experience and approach to treatment..."
                    />
                  ) : (
                    <p className="text-lg whitespace-pre-wrap">{watch('bio') || 'No bio provided'}</p>
                  )}
                  {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Working Hours and Appointment Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Settings</CardTitle>
                <CardDescription>Your availability and appointment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workingHours.start">Start Time</Label>
                    {isEditing ? (
                      <Input
                        id="workingHours.start"
                        type="time"
                        {...register('workingHours.start')}
                        defaultValue={workingHours.start}
                        onChange={(e) => {
                          setValue('workingHours.start', e.target.value);
                        }}
                      />
                    ) : (
                      <p className="text-lg">{workingHours.start}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHours.end">End Time</Label>
                    {isEditing ? (
                      <Input
                        id="workingHours.end"
                        type="time"
                        {...register('workingHours.end')}
                        defaultValue={workingHours.end}
                        onChange={(e) => {
                          setValue('workingHours.end', e.target.value);
                        }}
                      />
                    ) : (
                      <p className="text-lg">{workingHours.end}</p>
                    )}
                  </div>
                </div>

                {/* Working Days */}
                <div className="space-y-4">
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {WORKING_DAYS.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`workingDay-${day}`}
                          checked={workingDays.includes(day)}
                          onCheckedChange={() => handleWorkingDayChange(day)}
                          disabled={!isEditing}
                        />
                        <label
                          htmlFor={`workingDay-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}