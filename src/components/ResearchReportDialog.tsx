import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, FileText, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResearchReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isUserLoggedIn: boolean;
}

export const ResearchReportDialog: React.FC<ResearchReportDialogProps> = ({
  isOpen,
  onClose,
  userEmail,
  isUserLoggedIn
}) => {
  const [email, setEmail] = useState(userEmail || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      // Insert research report lead
      const { error } = await supabase
        .from('research_report_leads')
        .insert({
          email: email.trim().toLowerCase(),
          user_id: session?.user?.id || null,
          is_verified_user: isUserLoggedIn
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Full research report will be sent to your email shortly",
      });

      onClose();
      setEmail('');
    } catch (error: any) {
      console.error('Error submitting research report request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Full Market Research Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Get Your Detailed Report</h3>
            <p className="text-muted-foreground text-sm">
              We'll send a comprehensive market analysis report with detailed insights, trends, and investment opportunities directly to your email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {isUserLoggedIn && userEmail && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Account email: {userEmail}</span>
                {email !== userEmail && (
                  <button
                    type="button"
                    onClick={() => setEmail(userEmail)}
                    className="text-primary hover:underline"
                  >
                    Use account email
                  </button>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};