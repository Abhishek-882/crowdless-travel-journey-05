import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DestinationProvider } from "./context/DestinationContext";
import { BookingProvider } from "./context/BookingContext";
import { TripPlanningProvider } from "./context/TripPlanningContext";
import RouteGuard from "./components/RouteGuard";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileCompletion from "./pages/ProfileCompletion";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import About from "./pages/About";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import TripPlanner from "./pages/TripPlanner";
import PremiumFeatures from "./pages/PremiumFeatures";
import PremiumSuccess from "./pages/PremiumSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DestinationProvider>
        <BookingProvider>
          <TripPlanningProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/destinations" element={<Destinations />} />
                  <Route 
                    path="/destinations/:id" 
                    element={<DestinationDetail />} 
                  />
                  <Route path="/premium" element={<PremiumFeatures />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/profile-completion" 
                    element={
                      <RouteGuard requireAuth>
                        <ProfileCompletion />
                      </RouteGuard>
                    } 
                  />
                  
                  <Route 
                    path="/premium-success" 
                    element={
                      <RouteGuard requireAuth>
                        <PremiumSuccess />
                      </RouteGuard>
                    } 
                  />
                  
                  <Route 
                    path="/bookings" 
                    element={
                      <RouteGuard requireAuth>
                        <MyBookings />
                      </RouteGuard>
                    } 
                  />
                  
                  <Route 
                    path="/bookings/:id" 
                    element={
                      <RouteGuard requireAuth>
                        <BookingDetails />
                      </RouteGuard>
                    } 
                  />

                  <Route 
                    path="/trip-planner" 
                    element={
                      <RouteGuard requireAuth requireProfileComplete>
                        <TripPlanner />
                      </RouteGuard>
                    } 
                  />
                  
                  <Route 
                    path="/profile" 
                    element={
                      <RouteGuard requireAuth>
                        <div>Profile Page (To be implemented)</div>
                      </RouteGuard>
                    } 
                  />
                  
                  {/* Catch-all Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TripPlanningProvider>
        </BookingProvider>
      </DestinationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
