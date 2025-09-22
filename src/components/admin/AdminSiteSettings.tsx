"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Phone, Facebook, Instagram, Linkedin, Twitter, Youtube, Share2 } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';

export const AdminSiteSettings: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    youtube_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('central_contact_number, facebook_url, instagram_url, linkedin_url, twitter_url, youtube_url')
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
          setSocialMediaLinks({
            facebook_url: data.facebook_url || '',
            instagram_url: data.instagram_url || '',
            linkedin_url: data.linkedin_url || '',
            twitter_url: data.twitter_url || '',
            youtube_url: data.youtube_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
        toast({
          title: t('error'),
          description: t('failed_to_fetch_site_settings'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [t, toast]);

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSocialMediaLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

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

      const updateData = {
        central_contact_number: centralContactNumber,
        ...socialMediaLinks
      };

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('site_settings')
          .insert(updateData);

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

  const socialPlatforms = [
    { key: 'facebook_url', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/yourcompany' },
    { key: 'instagram_url', label: 'Instagram URL', icon: Instagram, placeholder: 'https://instagram.com/yourcompany' },
    { key: 'linkedin_url', label: 'LinkedIn URL', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourcompany' },
    { key: 'twitter_url', label: 'Twitter URL', icon: Twitter, placeholder: 'https://twitter.com/yourcompany' },
    { key: 'youtube_url', label: 'YouTube URL', icon: Youtube, placeholder: 'https://youtube.com/c/yourcompany' }
  ];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <CardTitle><TranslatableText text="Contact Information" /></CardTitle>
          </div>
          <CardDescription><TranslatableText text="Manage contact details displayed across the site." /></CardDescription>
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
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <CardTitle><TranslatableText text="Social Media Links" /></CardTitle>
          </div>
          <CardDescription><TranslatableText text="Configure social media platform URLs that will appear on the contact page and footer." /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.key} className="space-y-2">
                  <Label htmlFor={platform.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </Label>
                  <Input
                    id={platform.key}
                    type="url"
                    value={socialMediaLinks[platform.key as keyof typeof socialMediaLinks]}
                    onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                  />
                </div>
              );
            })}
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Enter the complete URL for each social media platform</li>
              <li>• Leave empty if you don't want to display that platform</li>
              <li>• URLs will appear as clickable links on the contact page</li>
              <li>• Changes take effect immediately after saving</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          <TranslatableText text="Save Settings" />
        </Button>
      </div>
    </div>
  );
};