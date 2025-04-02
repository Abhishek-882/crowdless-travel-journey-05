
import React from 'react';
import Layout from '../components/Layout';
import { 
  Users, Clock, Search, MapPin, CheckCircle, 
  BarChart3, Calendar, Compass
} from 'lucide-react';

const About: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How CrowdLess Works</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Our innovative platform helps you discover and enjoy destinations without the crowds
          </p>
        </div>
      </section>
      
      {/* Our Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              At CrowdLess, we believe that the best travel experiences happen when you can fully immerse yourself in a destination without the distraction and stress of large crowds. Our mission is to help travelers find peaceful moments in popular places by providing real-time crowd data and intelligent recommendations.
            </p>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How Our Platform Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Discover</h3>
              <p className="text-gray-600">
                Browse our curated collection of destinations across India with detailed information and crowd predictions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Analyze</h3>
              <p className="text-gray-600">
                Check real-time crowd levels and predictions to find the perfect time for your visit.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Book</h3>
              <p className="text-gray-600">
                Secure your tickets, accommodations, and transportation for your preferred low-crowd time slot.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">4. Enjoy</h3>
              <p className="text-gray-600">
                Experience the destination without the crowds, making the most of your travel time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Crowd Prediction Technology */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Crowd Prediction Technology</h2>
              <p className="text-lg text-gray-600 mb-6">
                CrowdLess uses advanced algorithms to analyze visitor patterns and predict crowd levels throughout the day. Our technology helps you make informed decisions about when to visit popular destinations.
              </p>
              
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span>Historical visitation data analysis</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span>Real-time crowd monitoring</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span>AI-powered prediction models</span>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span>Weather and seasonal trend integration</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">How We Calculate Crowd Levels</h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-gray-600">
                      We gather information from multiple sources including historical visitation data, ticket sales, and local reports.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Time Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Our algorithms identify patterns based on time of day, day of week, and seasonal variations.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Location-Specific Factors</h4>
                    <p className="text-sm text-gray-600">
                      Each destination has unique crowd patterns influenced by local events, holidays, and accessibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Using CrowdLess</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Enhanced Travel Experience</h3>
              <p className="text-gray-600">
                Enjoy attractions without long lines, overcrowded spaces, or photo-bombers. Take your time to truly appreciate the beauty of each destination.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Time & Money Savings</h3>
              <p className="text-gray-600">
                Spend less time waiting in lines and more time enjoying your trip. Many destinations also offer lower prices during off-peak times.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Stress-Free Planning</h3>
              <p className="text-gray-600">
                Our intuitive platform makes it easy to plan your entire trip around optimal visiting times for a more relaxed travel experience.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">How accurate is your crowd prediction?</h3>
              <p className="text-gray-600">
                Our predictions are typically accurate within 10-15% of actual crowd levels. We continuously improve our algorithms based on real-world data and feedback.
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my booking if plans change?</h3>
              <p className="text-gray-600">
                Yes, most bookings can be canceled with a full refund up to 24 hours before the scheduled date. Some special bookings may have different policies, which will be clearly indicated.
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">How do you determine the "best time to visit"?</h3>
              <p className="text-gray-600">
                We analyze historical crowd data to find the times with consistently lowest crowd levels while still offering a full experience (i.e., when all attractions are open and accessible).
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer group bookings?</h3>
              <p className="text-gray-600">
                Yes, we can accommodate group bookings. For groups larger than 10 people, please contact our customer support for special arrangements and potential discounts.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Crowd-Free Travel?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of travelers who are discovering the joy of visiting amazing places without the crowds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border border-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-colors">
              View Destinations
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
