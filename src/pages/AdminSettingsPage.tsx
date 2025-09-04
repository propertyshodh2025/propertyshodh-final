import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [centralContactNumber, setCentralContactNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('id, central_contact_number')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          setCentralContactNumber(data.central_contact_number);
          setSettingsId(data.id);
        } else {
          // If no settings exist, we'll create one on save
          setCentralContactNumber('');
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
        toast({
          title: t('error'),
          description: t('failed_to_fetch_settings'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast, t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (settingsId) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update({ central_contact_number: centralContactNumber, updated_at: new Date().toISOString() })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        // Insert new settings if none exist
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ central_contact_number: centralContactNumber })
          .select('id')
          .single();

        if (error) throw error;
        setSettingsId(data.id);
      }

      toast({
        title: t('success'),
        description: t('settings_saved_successfully'),
      });
    } catch (err) {
      console.error('Error saving site settings:', err);
      toast({
        title: t('error'),
        description: t('failed_to_save_settings'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('loading_settings')}...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('back')}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings size={28} className="text-primary" />
            <TranslatableText text="Site Settings" />
          </h1>
        </div>

        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-foreground">
              <TranslatableText text="Central Contact Number" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label htmlFor="centralContactNumber" className="text-foreground">
                  <TranslatableText text="PropertyShodh Contact Number" />
                </Label>
                <Input
                  id="centralContactNumber"
                  type="text"
                  value={centralContactNumber}
                  onChange={(e) => setCentralContactNumber(e.target.value)}
                  placeholder={t('enter_contact_number')}
                  className="mt-2 bg-white/5 border-white/20 text-foreground"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  <TranslatableText text="This number will be displayed on all property listings for inquiries." />
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl h-12 font-medium transition-all duration-300 shadow-lg"
                disabled={isSaving}
              >
                {isSaving ? t('saving') + '...' : t('save_settings')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;