import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  User, 
  MapPin, 
  Phone, 
  Home, 
  Mail, 
  Star, 
  Clock,
  CalendarDays,
  CreditCard,
  Bell,
  Info,
  Shield
} from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, completeProfile, upgradeToPremium, cancelPremium } = useAuth();
  const { getUserBookings, getUserTripPlans } = useBookings();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: currentUser?.profileData?.phoneNumber || '',
    address: currentUser?.profileData?.address || '',
    city: currentUser?.profileData?.city || '',
    state: currentUser?.profileData?.state || '',
    zipCode: currentUser?.profileData?.zipCode || '',
    emergencyContact: currentUser?.profileData?.emergencyContact || '',
    notificationsEnabled: currentUser?.profileData?.preferences?.notifications || false,
    newsletterEnabled: currentUser?.profileData?.preferences?.newsletter || false
  });
  
  // Fetch user's bookings and trip plans
  const userBookings = currentUser ? getUserBookings(currentUser.id) : [];
  const userTripPlans = currentUser ? getUserTripPlans(currentUser.id) : [];
  
  // Calculate booking statistics
  const upcomingBookings = userBookings.filter(b => b.status === 'confirmed');
  const completedBookings = userBookings.filter(b => b.status === 'confirmed' && new Date(b.checkIn) < new Date());
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');
  
  // Format membership date
  const memberSince = currentUser 
    ? format(new Date(), 'MMMM yyyy')
    : '';
  
  // Premium status and dates
  const premiumPurchaseDate = currentUser?.premiumPurchaseDate 
    ? format(new Date(currentUser.premiumPurchaseDate), 'PP')
    : '';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      await completeProfile({
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        emergencyContact: formData.emergencyContact,
        preferences: {
          notifications: formData.notificationsEnabled,
          newsletter: formData.newsletterEnabled
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleUpgradeToPremium = async () => {
    try {
      await upgradeToPremium();
      navigate('/premium-success');
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
    }
  };
  
  const handleCancelPremium = async () => {
    try {
      await cancelPremium();
    } catch (error) {
      console.error('Failed to cancel premium:', error);
    }
  };
  
  if (!currentUser) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Alert className="max-w-lg mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in to view your profile.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Sidebar */}
          <div className="w-full md:w-1/3 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">{currentUser.fullName}</h2>
                  <p className="text-muted-foreground">{currentUser.email}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Member since {memberSince}</span>
                  </div>
                  
                  {currentUser.isPremium && (
                    <div className="mt-3">
                      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-white" /> Premium Member
                      </Badge>
                      {premiumPurchaseDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Since {premiumPurchaseDate}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/bookings')}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    My Bookings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/trip-planner')}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Plan New Trip
                  </Button>
                  
                  {!currentUser.isPremium ? (
                    <Button 
                      className="w-full mt-2" 
                      onClick={handleUpgradeToPremium}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60" 
                      onClick={handleCancelPremium}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Cancel Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Booking Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Bookings</span>
                    <span className="font-medium">{userBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Upcoming</span>
                    <span className="font-medium">{upcomingBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">{completedBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cancelled</span>
                    <span className="font-medium">{cancelledBookings.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {currentUser.isPremium && (
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Premium Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Real-time crowd predictions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Exclusive transport discounts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Free guide per destination</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="trips">Trip Plans</TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Personal Information</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                    <CardDescription>Manage your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                              id="emergencyContact"
                              name="emergencyContact"
                              value={formData.emergencyContact}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">Preferences</h3>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="notifications">Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive booking updates and travel alerts
                              </p>
                            </div>
                            <Switch
                              id="notifications"
                              name="notificationsEnabled"
                              checked={formData.notificationsEnabled}
                              onCheckedChange={(checked) => 
                                setFormData(prev => ({
                                  ...prev,
                                  notificationsEnabled: checked
                                }))
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="newsletter">Newsletter</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive travel tips and special offers
                              </p>
                            </div>
                            <Switch
                              id="newsletter"
                              name="newsletterEnabled"
                              checked={formData.newsletterEnabled}
                              onCheckedChange={(checked) => 
                                setFormData(prev => ({
                                  ...prev,
                                  newsletterEnabled: checked
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{currentUser.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {currentUser.profileData?.phoneNumber || 
                                    <span className="text-muted-foreground italic">Not provided</span>
                                  }
                                </span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {currentUser.profileData?.emergencyContact || 
                                    <span className="text-muted-foreground italic">No emergency contact</span>
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Address</h3>
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <Home className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                                <div>
                                  {currentUser.profileData?.address ? (
                                    <>
                                      <div>{currentUser.profileData.address}</div>
                                      <div>
                                        {currentUser.profileData.city}
                                        {currentUser.profileData.state && `, ${currentUser.profileData.state}`}
                                        {currentUser.profileData.zipCode && ` ${currentUser.profileData.zipCode}`}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground italic">Address not provided</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Preferences</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Notifications</span>
                              </div>
                              <Badge variant={currentUser.profileData?.preferences?.notifications ? "default" : "outline"}>
                                {currentUser.profileData?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Newsletter</span>
                              </div>
                              <Badge variant={currentUser.profileData?.preferences?.newsletter ? "default" : "outline"}>
                                {currentUser.profileData?.preferences?.newsletter ? 'Subscribed' : 'Not subscribed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </CardFooter>
                  )}
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">Visa •••• 4242</div>
                          <div className="text-xs text-muted-foreground">Expires 12/25</div>
                        </div>
                      </div>
                      <Badge>Default</Badge>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      + Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Your Bookings</CardTitle>
                    <CardDescription>
                      View and manage your destination bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                        <h3 className="font-medium mb-1">No bookings yet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          You haven't made any destination bookings yet
                        </p>
                        <Button onClick={() => navigate('/destinations')}>
                          Browse Destinations
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userBookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between"
                          >
                            <div>
                              <div className="font-medium">
                                {/* Replace with actual destination name */}
                                Destination Name
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.checkIn} • {booking.timeSlot}
                              </div>
                              <div className="flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                <span className="text-xs">{booking.visitors} visitors</span>
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                              <Badge variant={
                                booking.status === 'confirmed' 
                                  ? 'default' 
                                  : booking.status === 'cancelled' 
                                    ? 'destructive' 
                                    : 'outline'
                              }>
                                {booking.status === 'confirmed' ? 'Confirmed' : 
                                  booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                              </Badge>
                              <div className="text-sm font-medium mt-1">
                                ₹{booking.totalAmount}
                              </div>
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-xs"
                                onClick={() => navigate(`/bookings/${booking.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Trip Plans Tab */}
              <TabsContent value="trips" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Your Trip Plans</CardTitle>
                    <CardDescription>
                      View and manage your multi-destination trips
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userTripPlans.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                        <h3 className="font-medium mb-1">No trip plans yet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          You haven't created any trip plans yet
                        </p>
                        <Button onClick={() => navigate('/trip-planner')}>
                          Create a Trip Plan
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userTripPlans.map((trip) => (
                          <div 
                            key={trip.id} 
                            className="border rounded-lg p-3"
                          >
                            <div className="flex flex-col sm:flex-row justify-between">
                              <div>
                                <div className="font-medium">
                                  Trip to {trip.selectedDestinations.length} Destinations
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span>{trip.numberOfPeople} people</span>
                                  </div>
                                  <div className="flex items-center capitalize">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{trip.numberOfDays} days</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                                <Badge variant={
                                  trip.status === 'confirmed' 
                                    ? 'default' 
                                    : trip.status === 'cancelled' 
                                      ? 'destructive' 
                                      : 'outline'
                                }>
                                  {trip.status === 'confirmed' ? 'Confirmed' : 
                                    trip.status === 'cancelled' ? 'Cancelled' : 
                                    trip.status === 'completed' ? 'Completed' : 'Planning'}
                                </Badge>
                                <div className="text-sm font-medium mt-1">
                                  ₹{trip.totalCost}
                                </div>
                                <Button 
                                  variant="link" 
                                  className="h-auto p-0 text-xs"
                                  onClick={() => navigate(`/bookings/${trip.id}`)}
                                >
                                  View Trip Details
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex flex-wrap gap-1">
                                {trip.isPremium && (
                                  <Badge variant="secondary" className="text-xs">
                                    Premium Trip
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs capitalize">
                                  {trip.transportType} transport
                                </Badge>
                                {trip.travelStyle && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {trip.travelStyle} style
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
