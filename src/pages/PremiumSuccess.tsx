
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ShieldCheck, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PremiumSuccess = () => {
  const { currentUser, cancelPremium, withdrawPremium } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [daysSincePurchase, setDaysSincePurchase] = useState<number>(0);
  const [canWithdraw, setCanWithdraw] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.isPremium) {
      navigate("/premium");
      return;
    }

    // Calculate days since purchase
    if (currentUser.premiumPurchaseDate) {
      const purchaseDate = new Date(currentUser.premiumPurchaseDate);
      const currentDate = new Date();
      
      // Calculate days for cancellation
      const daysDiff = 7 - Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      setRemainingDays(Math.max(0, daysDiff));
      
      // Calculate days since purchase for withdrawal
      const totalDaysSincePurchase = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      setDaysSincePurchase(totalDaysSincePurchase);
      setCanWithdraw(totalDaysSincePurchase > 7);
    }
  }, [currentUser, navigate]);

  const handleCancelPremium = async () => {
    try {
      await cancelPremium();
      setDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to cancel premium:", error);
    }
  };

  const handleWithdrawPremium = async () => {
    try {
      await withdrawPremium();
      setWithdrawDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to withdraw premium:", error);
      
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal request.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Premium Upgrade Successful!</CardTitle>
              <CardDescription>
                Thank you for upgrading to our premium plan. You now have access to all premium features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Real-time crowd data and analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Exclusive access to top-rated guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Detailed trip planning tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Trip photo gallery</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Next Steps</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Try the premium trip planner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Access real-time crowd data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Book exclusive experiences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Create a photo gallery for your trips</span>
                    </li>
                  </ul>
                </div>
              </div>

              {daysSincePurchase > 0 && (
                <div className={`border rounded-lg p-4 mt-6 ${canWithdraw ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${canWithdraw ? 'text-blue-600' : 'text-amber-600'}`} />
                    <div>
                      <h4 className={`font-medium ${canWithdraw ? 'text-blue-800' : 'text-amber-800'}`}>
                        {canWithdraw ? 'Premium Withdrawal Available' : 'Cancellation Policy'}
                      </h4>
                      <p className={`text-sm mt-1 ${canWithdraw ? 'text-blue-700' : 'text-amber-700'}`}>
                        {canWithdraw 
                          ? 'Your premium subscription has been active for more than 7 days. You can withdraw with a 25% refund.'
                          : `You can cancel your premium subscription within 7 days of purchase for a full refund. You have ${remainingDays} day${remainingDays !== 1 ? 's' : ''} remaining to cancel.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button variant="default" onClick={() => navigate("/trip-planner")}>
                Try Premium Trip Planner
              </Button>
              
              <div className="flex gap-3">
                {canWithdraw && (
                  <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                        Withdraw Premium (25% Refund)
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Withdraw Premium Subscription?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to withdraw your premium subscription? You will receive a 25% refund of your payment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>When you withdraw premium:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                          <li>You'll immediately lose access to premium features</li>
                          <li>You'll receive 25% of your payment back</li>
                          <li>Your premium trips will be converted to standard trips</li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                          Keep Premium
                        </Button>
                        <Button variant="destructive" onClick={handleWithdrawPremium}>
                          Yes, Withdraw Premium
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              
                {remainingDays !== null && remainingDays > 0 && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                        Cancel Premium
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Premium Subscription?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your premium subscription? You will lose access to all premium features immediately.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Your premium benefits include:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                          <li>Real-time crowd data</li>
                          <li>Exclusive guides and experiences</li>
                          <li>Advanced trip planning tools</li>
                          <li>Photo galleries for trips</li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Keep Premium
                        </Button>
                        <Button variant="destructive" onClick={handleCancelPremium}>
                          Yes, Cancel Premium
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PremiumSuccess;
