import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResetAdminPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  onSuccess: () => void;
}

export const ResetAdminPasswordDialog: React.FC<ResetAdminPasswordDialogProps> = ({
  isOpen,
  onClose,
  adminId,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwords_do_not_match'),
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: t('error'),
        description: t('password_too_short'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_admin_password', {
        _admin_id: adminId,
        _new_password: newPassword,
      });

      if (error) {
        console.error('Error resetting password:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_reset_password'),
          variant: 'destructive',
        });
      } else if (data) {
        toast({
          title: t('success'),
          description: t('password_reset_successfully'),
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: t('error'),
          description: t('failed_to_reset_password_no_data'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Unexpected error resetting password:', err);
      toast({
        title: t('error'),
        description: t('failed_to_reset_password'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl">
        <DialogHeader>
          <DialogTitle><TranslatableText text="Reset Admin Password" /></DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword"><TranslatableText text="New Password" /></Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('enter_new_password')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword"><TranslatableText text="Confirm Password" /></Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirm_new_password')}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              <TranslatableText text="Cancel" />
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TranslatableText text="Reset Password" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};