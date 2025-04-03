
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const ProfileCompletion: React.FC = () => {
  const { completeProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(zipCode)) {
      newErrors.zipCode = 'ZIP code must be 6 digits';
    }
    
    if (!emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await completeProfile({
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        emergencyContact,
        preferences: {
          notifications: notificationsEnabled,
          newsletter: newsletterEnabled
        }
      });
      
      navigate('/destinations');
    } catch (error) {
      console.error('Failed to complete profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to complete your profile</h1>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">We need some additional information to complete your profile</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              This information will be used for your bookings and emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Enter your state"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter your 6-digit ZIP code"
                    maxLength={6}
                    className={errors.zipCode ? 'border-red-500' : ''}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Emergency contact number"
                    className={errors.emergencyContact ? 'border-red-500' : ''}
                  />
                  {errors.emergencyContact && (
                    <p className="text-sm text-red-500">{errors.emergencyContact}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer">
                    Enable notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter" className="cursor-pointer">
                    Subscribe to newsletter
                  </Label>
                  <Switch
                    id="newsletter"
                    checked={newsletterEnabled}
                    onCheckedChange={setNewsletterEnabled}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileCompletion;
