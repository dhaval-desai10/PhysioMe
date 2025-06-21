import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Camera } from 'lucide-react'; // Icon for profile picture

export default function TherapistProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm();

  const profilePictureFile = watch('profilePicture');
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profilePictureFile && profilePictureFile[0]) {
      const newPreviewUrl = URL.createObjectURL(profilePictureFile[0]);
      setPreviewUrl(newPreviewUrl);
      return () => URL.revokeObjectURL(newPreviewUrl);
    } else if (profileData?.profilePictureUrl) {
      setPreviewUrl(profileData.profilePictureUrl);
    } else {
      setPreviewUrl('https://via.placeholder.com/200?text=No+Image'); // Default placeholder
    }
  }, [profilePictureFile, profileData?.profilePictureUrl]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/therapist/profile');
      setProfileData(response.data);
      reset(response.data);
      if (response.data.profilePictureUrl) {
        setPreviewUrl(response.data.profilePictureUrl);
      } else {
        setPreviewUrl('https://via.placeholder.com/200?text=No+Image');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'profilePicture') {
        if (data.profilePicture && data.profilePicture[0]) {
          formData.append('profileImage', data.profilePicture[0]); // Backend expects 'profileImage'
        }
      } else if (key === 'workingHours' || key === 'workingDays') {
        // Stringify nested objects for FormData if backend expects them this way
        // Or handle them as individual fields if backend expects flat structure like workingHours[start]
        if (data[key]) {
            Object.keys(data[key]).forEach(nestedKey => {
                formData.append(`${key}[${nestedKey}]`, data[key][nestedKey]);
            });
        }
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    try {
      const response = await axios.put('/api/therapist/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully!');
      setProfileData(response.data);
      setIsEditing(false);
      reset(response.data);
      if (response.data.profilePictureUrl) {
        setPreviewUrl(response.data.profilePictureUrl);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update profile. Check image size/format.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    reset(profileData);
    if (profileData?.profilePictureUrl) {
      setPreviewUrl(profileData.profilePictureUrl);
    } else {
      setPreviewUrl('https://via.placeholder.com/200?text=No+Image');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading profile...</p></div>;
  }

  if (!profileData && !loading) {
    return <div className="text-center mt-20"><p className="text-xl text-red-500">Could not load profile data. Please try again later.</p></div>;
  }

  const renderInfoField = (label, value, className = '') => (
    <div className={`mb-4 ${className}`}>
      <Label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</Label>
      <p className="mt-1 text-md text-gray-800 dark:text-gray-200 p-2 bg-gray-50 dark:bg-gray-700 rounded-md min-h-[40px]">
        {value || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
      </p>
    </div>
  );

  const renderEditableField = (label, fieldName, type = 'text', options = {}, Component = Input, customProps = {}) => {
    const fieldError = errors[fieldName] || (fieldName.includes('.') && errors[fieldName.split('.')[0]]?.[fieldName.split('.')[1]]);
    return (
      <div className="mb-4">
        <Label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        <Component
          id={fieldName}
          type={type}
          {...register(fieldName, options)}
          defaultValue={profileData?.[fieldName] || (fieldName.includes('.') ? profileData?.[fieldName.split('.')[0]]?.[fieldName.split('.')[1]] : '')}
          className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${fieldError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary focus:border-primary'}`}
          {...customProps}
        />
        {fieldError && <p className="mt-1 text-xs text-red-500">{fieldError.message}</p>}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          {!isEditing && (
            <Button onClick={handleEdit} size="lg" className="mt-4 sm:mt-0 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150">
              Edit Profile
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Profile Header: Picture and Basic Info */}
          <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
              <div className="relative group w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Profile Preview"
                  className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg"
                />
                {isEditing && (
                  <label htmlFor="profilePictureInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input 
                      id="profilePictureInput" 
                      type="file" 
                      {...register('profilePicture')} 
                      accept="image/png, image/jpeg, image/gif" 
                      className="sr-only" 
                    />
                  </label>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                {isEditing ? (
                  <>
                    {renderEditableField('First Name', 'firstName', 'text', { required: 'First name is required' })}
                    {renderEditableField('Last Name', 'lastName', 'text', { required: 'Last name is required' })}
                    {renderEditableField('Email', 'email', 'email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }}, Input, { readOnly: true })}
                    {renderEditableField('Phone Number', 'phone', 'tel', { required: 'Phone number is required', pattern: { value: /^[+]?[\d\s()-]*$/, message: 'Invalid phone number' }})}
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{profileData?.firstName || ''} {profileData?.lastName || ''}</h2>
                    {renderInfoField('Email', profileData?.email)}
                    {renderInfoField('Phone Number', profileData?.phone)}
                  </>
                )}
              </div>
            </div>
             {isEditing && errors.profilePicture && <p className="mt-2 text-xs text-red-500 text-center md:text-left md:pl-[calc(12rem+2.5rem)]">{errors.profilePicture.message}</p>}
          </section>

          {/* Professional Information */}
          <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-3">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {isEditing ? renderEditableField('Specialization', 'specialization', 'text', { required: 'Specialization is required' }) : renderInfoField('Specialization', profileData?.specialization)}
              {isEditing ? renderEditableField('Years of Experience', 'experience', 'number', { required: 'Experience is required', valueAsNumber: true, min: { value: 0, message: 'Must be non-negative' }}) : renderInfoField('Years of Experience', profileData?.experience)}
              {isEditing ? renderEditableField('License Number', 'licenseNumber', 'text', { required: 'License number is required' }) : renderInfoField('License Number', profileData?.licenseNumber)}
            </div>
            {isEditing ? renderEditableField('Qualifications', 'qualifications', 'text', { required: 'Qualifications are required' }, Textarea, {rows:3}) : renderInfoField('Qualifications', profileData?.qualifications, 'mt-4')}
            {isEditing ? renderEditableField('Professional Bio', 'bio', 'text', { required: 'Bio is required', minLength: { value: 30, message: 'Min 30 chars' }}, Textarea, {rows:4}) : renderInfoField('Professional Bio', profileData?.bio, 'mt-4')}
          </section>

          {/* Availability Settings */}
          <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-3">Availability Settings</h3>
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Working Hours</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {isEditing ? renderEditableField('Start Time', 'workingHours.start', 'time', { required: 'Start time is required' }) : renderInfoField('Start Time', profileData?.workingHours?.start)}
                {isEditing ? renderEditableField('End Time', 'workingHours.end', 'time', { required: 'End time is required' }) : renderInfoField('End Time', profileData?.workingHours?.end)}
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Working Days</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center space-x-2 p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <input type="checkbox" id={`workingDays.${day}`} {...register(`workingDays.${day}`)} defaultChecked={!!profileData?.workingDays?.[day]} className="form-checkbox h-4 w-4 text-primary focus:ring-primary-dark rounded"/>
                      <Label htmlFor={`workingDays.${day}`} className="capitalize text-sm font-normal text-gray-700 dark:text-gray-200 cursor-pointer select-none">{day}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                renderInfoField('Working Days', profileData?.workingDays ? Object.entries(profileData.workingDays).filter(([, checked]) => checked).map(([day]) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') : '')
              )}
            </div>
          </section>

          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving} size="lg" className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !isDirty} size="lg" className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-150">
                {saving ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</span>) : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}