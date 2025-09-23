"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone, Facebook, Instagram, Linkedin, Twitter, Youtube, Share2 } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const AdminSiteSettings: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { siteSettings, loading, updateSettings } = useSiteSettings();
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    youtube_url: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update local state when siteSettings change
    setCentralContactNumber(siteSettings.central_contact_number || '');
    setSocialMediaLinks({
      facebook_url: siteSettings.facebook_url || '',
      instagram_url: siteSettings.instagram_url || '',
      linkedin_url: siteSettings.linkedin_url || '',
      twitter_url: siteSettings.twitter_url || '',
      youtube_url: siteSettings.youtube_url || ''
    });
  }, [siteSettings]);

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSocialMediaLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        central_contact_number: centralContactNumber,
        ...socialMediaLinks
      };

      const success = await updateSettings(updateData);
      
      if (success) {
        toast({
          title: t('success'),
          description: t('site_settings_updated_successfully'),
        });
      }
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