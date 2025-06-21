import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Loader2, Camera } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { patientApi } from '../../services/api';

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile picture preview
  useEffect(() => {
    const profilePicture = watch('profilePicture');
    if (profilePicture && profilePicture.length > 0) {
      const file = profilePicture[0];
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  }, [watch('profilePicture')]);

  const fetchProfile = async () => {
    try {
      if (!user || !user._id) {
        toast.error('User information not available');
        setLoading(false);
        return;
      }
      
      const response = await patientApi.getProfile(user._id);
      const profileData = response.data.data;
      
      // Set profile picture preview if available
      if (profileData.profilePictureUrl) {
        setPreviewUrl(profileData.profilePictureUrl);
      }
      
      // Parse name into firstName and lastName
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      reset({
        ...profileData,
        firstName,
        lastName
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!user || !user._id) {
        throw new Error('User information not available');
      }
      
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Handle name (combine firstName and lastName)
      const firstName = data.firstName?.trim() || '';
      const lastName = data.lastName?.trim() || '';
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      
      // Add other form fields
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('gender', data.gender);
      formData.append('address', data.address);
      formData.append('medicalHistory', data.medicalHistory || '');
      
      // Handle emergency contact
      if (data.emergencyContact) {
        formData.append('emergencyContact', JSON.stringify({
          name: data.emergencyContact.name,
          phone: data.emergencyContact.phone
        }));
      }
      
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
        
        formData.append('profilePicture', file);
      }
      
      const response = await patientApi.updateProfile(user._id, formData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        
        // Update the user data in localStorage to persist changes
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: response.data.data.name,
            profilePictureUrl: response.data.data.profilePictureUrl,
            phone: response.data.data.phone,
            dateOfBirth: response.data.data.dateOfBirth,
            address: response.data.data.address,
            medicalHistory: response.data.data.medicalHistory,
            emergencyContact: response.data.data.emergencyContact
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update the auth context
          setUser(updatedUser);
        }
        
        // Update form with new data
        const updatedData = response.data.data;
        const nameParts = updatedData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        reset({
          ...updatedData,
          firstName,
          lastName
        });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="profilePicture" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                >
                  <Camera size={16} />
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register('profilePicture')}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Click the camera icon to upload a profile picture</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName', { required: 'First name is required' })}
                  error={errors.firstName?.message}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={errors.lastName?.message}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.email?.message}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d\s-+()]+$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  error={errors.phone?.message}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  error={errors.dateOfBirth?.message}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="w-full p-2 border rounded-md"
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address', { required: 'Address is required' })}
                error={errors.address?.message}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                {...register('medicalHistory')}
                placeholder="Please list any relevant medical conditions, surgeries, or injuries"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Contact Name"
                    {...register('emergencyContact.name', {
                      required: 'Emergency contact name is required'
                    })}
                  />
                  {errors.emergencyContact?.name && (
                    <p className="text-red-500 text-sm">{errors.emergencyContact.name.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Contact Phone"
                    {...register('emergencyContact.phone', {
                      required: 'Emergency contact phone is required',
                      pattern: {
                        value: /^[\d\s-+()]+$/,
                        message: 'Invalid phone number'
                      }
                    })}
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="text-red-500 text-sm">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}