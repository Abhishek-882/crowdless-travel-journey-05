
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const travelPreferences = [
  { id: 'adventure', label: 'Adventure' },
  { id: 'beach', label: 'Beach' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'city', label: 'City Exploration' },
  { id: 'cultural', label: 'Cultural Experiences' },
  { id: 'food', label: 'Food & Cuisine' },
  { id: 'nature', label: 'Nature & Wildlife' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'historical', label: 'Historical Sites' },
  { id: 'shopping', label: 'Shopping' },
];

const ProfileCompletion: React.FC = () => {
  const { currentUser, completeProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    street: '',
    landmark: '',
    pincode: '',
    preferences: [] as string[],
    profilePicture: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    street: '',
    landmark: '',
    pincode: '',
    preferences: '',
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const validateForm = () => {
    const errors = {
      street: '',
      landmark: '',
      pincode: '',
      preferences: '',
    };
    
    if (!formData.street.trim()) {
      errors.street = 'Street address is required';
    }
    
    if (!formData.landmark.trim()) {
      errors.landmark = 'Landmark is required';
    }
    
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    
    if (formData.preferences.length === 0) {
      errors.preferences = 'Please select at least one preference';
    }
    
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== '');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePreferenceChange = (checked: boolean, value: string) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, preferences: [...prev.preferences, value] };
      } else {
        return { ...prev, preferences: prev.preferences.filter((p) => p !== value) };
      }
    });
    
    if (formErrors.preferences) {
      setFormErrors((prev) => ({ ...prev, preferences: '' }));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulate image upload with a data URL (in a real app, this would be uploaded to storage)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      setFormData((prev) => ({ ...prev, profilePicture: result }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      try {
        await completeProfile({
          address: {
            street: formData.street,
            landmark: formData.landmark,
            pincode: formData.pincode,
          },
          preferences: formData.preferences,
          profilePicture: previewImage || undefined,
        });
        
        toast({
          title: 'Profile completed!',
          description: 'Your profile has been successfully updated.',
        });
        
        // Redirect to the destination page
        navigate('/destinations');
      } catch (err) {
        console.error('Profile completion error:', err);
        toast({
          title: 'Error',
          description: 'There was an error completing your profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Add a few more details to enhance your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Address Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  placeholder="Enter your street address"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={formErrors.street ? 'border-red-500' : ''}
                />
                {formErrors.street && (
                  <p className="text-sm text-red-500">{formErrors.street}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  name="landmark"
                  placeholder="Enter a nearby landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className={formErrors.landmark ? 'border-red-500' : ''}
                />
                {formErrors.landmark && (
                  <p className="text-sm text-red-500">{formErrors.landmark}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={formErrors.pincode ? 'border-red-500' : ''}
                />
                {formErrors.pincode && (
                  <p className="text-sm text-red-500">{formErrors.pincode}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Travel Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the types of travel experiences you enjoy
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {travelPreferences.map((preference) => (
                    <div key={preference.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference.id}
                        checked={formData.preferences.includes(preference.id)}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(checked as boolean, preference.id)
                        }
                      />
                      <Label htmlFor={preference.id}>{preference.label}</Label>
                    </div>
                  ))}
                </div>
                {formErrors.preferences && (
                  <p className="text-sm text-red-500 mt-2">{formErrors.preferences}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="relative">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">?</span>
                    </div>
                  )}
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                </div>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Click the icon to upload a profile picture
                </p>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
