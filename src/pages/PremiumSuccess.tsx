
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Users, Clock, MapPin, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PremiumSuccess: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!currentUser?.isPremium) {
      navigate('/premium');
      return;
    }
    
    toast({
      title: 'Premium Activated!',
      description: 'You now have access to all premium features.',
      variant: 'default',
    });
  }, [currentUser, navigate, toast]);

  if (!currentUser?.isPremium) {
    return null;
  }

  const premiumBenefits = [
    {
      title: 'Live Crowd Analytics',
      description: 'Access real-time and historical crowd data for all destinations',
      icon: <Users className="h-6 w-6 text-primary" />,
      accessMethod: 'Hover over any crowd indicator to see detailed percentages'
    },
    {
      title: 'Best Time Predictions',
      description: 'Get AI-powered recommendations on the best times to visit each destination',
      icon: <Clock className="h-6 w-6 text-primary" />,
      accessMethod: 'Click "Best Time" on any destination card for hourly predictions'
    },
    {
      title: 'Free Tour Guides',
      description: 'Enjoy one free tour guide at each destination on your trip',
      icon: <MapPin className="h-6 w-6 text-primary" />,
      accessMethod: 'Guide fees automatically waived during booking'
    },
    {
      title: 'Advanced Trip Planning',
      description: 'Access advanced trip planning tools with predicted crowd levels',
      icon: <Star className="h-6 w-6 text-primary" />,
      accessMethod: 'Use the Trip Planner with premium optimization features'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-8 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-200 text-amber-800 px-4 py-1 rounded-bl-lg">
            Premium Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to Premium!</h1>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            You now have access to exclusive features designed to enhance your travel experience.
            Let's explore what's now available to you!
          </p>
          <Badge variant="outline" className="bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-300">
            Premium Member
          </Badge>
        </div>

        <h2 className="text-2xl font-bold mb-6">Your Premium Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {premiumBenefits.map((benefit, index) => (
            <Card key={index} className="border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  {benefit.icon}
                  <CardTitle>{benefit.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardDescription className="text-base text-gray-600 mb-4">
                  {benefit.description}
                </CardDescription>
                <div className="flex items-start gap-2 bg-blue-50 p-4 rounded-md">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700">How to access</p>
                    <p className="text-sm text-blue-600">{benefit.accessMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-amber-200 bg-amber-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              Track Your Premium Value
            </CardTitle>
            <CardDescription>
              See how much you're saving with your premium benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Guides Discount</p>
                <p className="text-2xl font-bold text-amber-600">₹0</p>
                <p className="text-xs text-gray-400">Start booking to see savings</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Premium Insights</p>
                <p className="text-2xl font-bold text-amber-600">0</p>
                <p className="text-xs text-gray-400">Times used premium data</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Time Saved</p>
                <p className="text-2xl font-bold text-amber-600">0 min</p>
                <p className="text-xs text-gray-400">Using crowd data insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/destinations')} className="px-8">
            Explore Destinations
          </Button>
          <Button onClick={() => navigate('/trip-planner')} variant="outline" className="px-8">
            Plan Your Trip
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PremiumSuccess;
