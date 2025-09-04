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

interface EditAdminUsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  currentUsername: string;
  onSuccess: () => void;
}

export const EditAdminUsernameDialog: React.FC<EditAdminUsernameDialogProps> = ({
  isOpen,
  onClose,
  adminId,
  currentUsername,
  onSuccess,
}) => {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_admin_username', {
        _admin_id: adminId,
        _new_username: newUsername,
      });

      if (error) {
        console.error('Error updating username:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_update_username'),
          variant: 'destructive',
        });
      } else if (data) {
        toast({
          title: t('success'),
          description: t('username_updated_successfully'),
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: t('error'),
          description: t('failed_to_update_username_no_data'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Unexpected error updating username:', err);
      toast({
        title: t('error'),
        description: t('failed_to_update_username'),
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
          <DialogTitle><TranslatableText text="Edit Admin Username" /></DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername"><TranslatableText text="New Username" /></Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t('enter_new_username')}
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
                <TranslatableText text="Save Changes" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};