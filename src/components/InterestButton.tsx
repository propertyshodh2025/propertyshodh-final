import React, { useState, useEffect } from 'react';
import { Heart, Phone, MessageCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserContact } from '@/contexts/UserContactContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';

interface InterestButtonProps {
  propertyId: string;
  propertyTitle: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const InterestButton: React.FC<InterestButtonProps> = ({ 
  propertyId, 
  propertyTitle, 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { userContact, setUserContact, hasUserContact, hasShownInterest, markInterestShown } = useUserContact();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name?: string, phone_number?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+91',
    message: ''
  });
  const { toast } = useToast();

  // Store user's intent for post-login completion
  useEffect(() => {
    const storedIntent = localStorage.getItem('pendingInterest');
    if (storedIntent && user) {
      const intent = JSON.parse(storedIntent);
      if (intent.propertyId === propertyId) {
        // User just logged in, complete their original intent
        localStorage.removeItem('pendingInterest');
        setTimeout(() => {
          handleInterestClick();
        }, 1000); // Small delay to ensure user data is loaded
      }
    }
  }, [user, propertyId]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleInterestClick = () => {
    if (hasShownInterest(propertyId)) {
      toast({
        title: "Already Interested",
        description: "You have already shown interest in this property.",
      });
      return;
    }

    // If user is not logged in, show choice dialog
    if (!user) {
      setIsChoiceDialogOpen(true);
      return;
    }

    // User is logged in - proceed with normal flow
    // Check if user has profile data from database
    if (userProfile?.full_name && userProfile?.phone_number) {
      // User has complete profile data, submit directly
      submitInterest(userProfile.full_name, userProfile.phone_number, '', true);
    } else if (hasUserContact()) {
      // User has session contact info, submit directly
      submitInterest(userContact!.name, userContact!.countryCode + userContact!.phone, '', true);
    } else {
      // Pre-fill form with available data
      setFormData(prev => ({
        ...prev,
        name: userProfile?.full_name || '',
        phone: userProfile?.phone_number?.replace('+91', '') || ''
      }));
      // Show dialog to collect missing contact info
      setIsDialogOpen(true);
    }
  };

  const handleLoginChoice = () => {
    // Store user's intent for after login
    localStorage.setItem('pendingInterest', JSON.stringify({
      propertyId,
      propertyTitle,
      timestamp: Date.now()
    }));
    setIsChoiceDialogOpen(false);
    setIsGoogleSignInOpen(true);
  };

  const handleGuestChoice = () => {
    setIsChoiceDialogOpen(false);
    setIsDialogOpen(true);
  };

  const submitInterest = async (name: string, phone: string, message: string, isVerified: boolean = false) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('property_inquiries')
        .insert([{
          property_id: propertyId,
          user_name: name,
          user_phone: phone,
          inquiry_type: 'interest',
          message: message || `I'm interested in ${propertyTitle}`,
          is_verified: isVerified
        }]);

      if (error) throw error;

      // Log user activity if user is logged in
      if (user) {
        try {
          console.log('Logging user activity for interest submission:', {
            user_id: user.id,
            activity_type: 'property_inquiry',
            property_id: propertyId
          });
          
          const { error: activityError } = await supabase.from('user_activities').insert({
            user_id: user.id,
            activity_type: 'property_inquiry',
            property_id: propertyId,
            metadata: {
              property_title: propertyTitle,
              inquiry_type: 'interest',
              contact_method: 'website_button'
            }
          });
          
          if (activityError) {
            console.error('Error logging user activity:', activityError);
          } else {
            console.log('User activity logged successfully');
          }
        } catch (error) {
          console.error('Error in activity logging:', error);
        }
      }

      // Mark interest as shown in this session
      markInterestShown(propertyId);

      toast({
        title: "Interest Registered!",
        description: "Your interest has been sent to the property owner. They will contact you soon.",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting interest:', error);
      toast({
        title: "Error",
        description: "Failed to register interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and phone number.",
        variant: "destructive",
      });
      return;
    }

    const fullPhone = formData.countryCode + formData.phone;
    
    // Store contact info for future use
    setUserContact({
      name: formData.name,
      phone: formData.phone,
      countryCode: formData.countryCode,
      sessionStartTime: new Date().toISOString()
    });

    await submitInterest(formData.name, fullPhone, formData.message, !!user);
  };

  return (
    <>
      <Button
        onClick={handleInterestClick}
        variant={hasShownInterest(propertyId) ? 'secondary' : variant}
        size={size}
        className={`${className}`}
        disabled={loading}
      >
        <Heart size={16} className="mr-2" />
        {loading ? 'Submitting...' : hasShownInterest(propertyId) ? 'Interest Shown' : "I'm Interested"}
      </Button>

      {/* Choice Dialog for Non-logged-in Users */}
      <Dialog open={isChoiceDialogOpen} onOpenChange={setIsChoiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Show Interest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To show interest in this property, you can either log in to your account or continue as a guest.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleLoginChoice}
                className="flex items-center gap-2"
              >
                <LogIn size={16} />
                Log In / Sign Up
              </Button>
              <Button
                onClick={handleGuestChoice}
                variant="outline"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Sign In Dialog */}
      <GoogleSignInDialog 
        open={isGoogleSignInOpen}
        onOpenChange={setIsGoogleSignInOpen}
      />

      {/* Interest Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <select
                  className="bg-background border border-border text-foreground rounded-md px-3 py-2 min-w-[100px]"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="10 digit number"
                  maxLength={10}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={`I'm interested in ${propertyTitle}...`}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Interest'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};