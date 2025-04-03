
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock, Users, Map } from 'lucide-react';

const PremiumFeatures: React.FC = () => {
  const { currentUser, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!currentUser) return;
    
    setUpgrading(true);
    try {
      await upgradeToPremium();
      navigate('/premium-success');
    } catch (error) {
      console.error('Failed to upgrade:', error);
    } finally {
      setUpgrading(false);
    }
  };

  // Redirect if already premium
  React.useEffect(() => {
    if (currentUser?.isPremium) {
      navigate('/premium-success');
    }
  }, [currentUser, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get exclusive access to crowd data, better trip planning, and free tour guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Crowd Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Access real-time and historical crowd data for all destinations, so you can plan your visit during less crowded times.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Real-time crowd levels</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Historical trends</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Best time recommendations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Free Tour Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Enjoy one free tour guide at each destination on your trip, enhancing your experience with local expertise.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>One free guide per destination</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Professional local experts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Multilingual options</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-primary" />
                Advanced Trip Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Get access to advanced trip planning tools, including predicted crowd levels for future dates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Future crowd predictions</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Personalized itineraries</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  <span>Priority booking</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-center text-2xl">Premium Membership</CardTitle>
            <CardDescription className="text-center text-lg">
              ₹999/year
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span>Access to all premium features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span>One free tour guide per destination</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span>Complete crowd analytics and predictions</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-primary" />
                <span>No ads or promotional content</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleUpgrade} 
              disabled={upgrading || currentUser?.isPremium}
              className="w-full"
              size="lg"
            >
              {upgrading 
                ? 'Processing...' 
                : currentUser?.isPremium 
                  ? 'Already a Premium Member' 
                  : 'Upgrade to Premium'
              }
            </Button>
            {!currentUser && (
              <p className="text-center text-sm text-gray-500">
                You need to{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={() => navigate('/login')}
                >
                  log in
                </Button>{' '}
                to upgrade to premium
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PremiumFeatures;
