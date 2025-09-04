"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

export const AdminSiteSettings: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('central_contact_number')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching site settings:', error);
        toast({
          title: t('error'),
          description: t('failed_to_fetch_site_settings'),
          variant: 'destructive',
        });
      } else if (data) {
        setCentralContactNumber(data.central_contact_number || '');
      }
      setLoading(false);
    };

    fetchSettings();
  }, [t, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if a record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('site_settings')
          .update({ central_contact_number: centralContactNumber })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('site_settings')
          .insert({ central_contact_number: centralContactNumber });

        if (error) throw error;
      }

      toast({
        title: t('success'),
        description: t('site_settings_updated_successfully'),
      });
    } catch (error: any) {
      console.error('Error saving site settings:', error);
      toast({
        title: t('error'),
        description: t('failed_to_update_site_settings', { message: error.message }),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle><TranslatableText text="Site Settings" /></CardTitle>
          <CardDescription><TranslatableText text="Manage global application settings." /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle><TranslatableText text="Site Settings" /></CardTitle>
        <CardDescription><TranslatableText text="Manage global application settings." /></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="centralContactNumber"><TranslatableText text="Central Contact Number" /></Label>
          <Input
            id="centralContactNumber"
            type="tel"
            value={centralContactNumber}
            onChange={(e) => setCentralContactNumber(e.target.value)}
            placeholder={t('enter_central_contact_number')}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          <TranslatableText text="Save Settings" />
        </Button>
      </CardContent>
    </Card>
  );
};