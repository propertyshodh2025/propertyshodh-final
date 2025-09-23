"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCentralContact } from '@/hooks/useCentralContact';

export const AdminCentralContactSettings: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { centralContactNumber, loading, updateContactNumber } = useCentralContact();
  const [localContactNumber, setLocalContactNumber] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update local state when centralContactNumber changes
    setLocalContactNumber(centralContactNumber);
  }, [centralContactNumber]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateContactNumber(localContactNumber);
      
      if (success) {
        toast({
          title: t('success'),
          description: 'Central contact number updated successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error saving central contact number:', error);
      toast({
        title: t('error'),
        description: `Failed to update contact number: ${error.message}`,
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
          <CardTitle><TranslatableText text="Central Contact Settings" /></CardTitle>
          <CardDescription><TranslatableText text="Manage the central contact number displayed across the site." /></CardDescription>
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
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <CardTitle><TranslatableText text="Central Contact Information" /></CardTitle>
          </div>
          <CardDescription><TranslatableText text="This contact number will be displayed across the entire website including footer, contact page, and property listings." /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="centralContactNumber"><TranslatableText text="Central Contact Number" /></Label>
            <Input
              id="centralContactNumber"
              type="tel"
              value={localContactNumber}
              onChange={(e) => setLocalContactNumber(e.target.value)}
              placeholder={t('enter_central_contact_number') || "Enter central contact number (e.g., +91 98765 43210)"}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              This number will be used for all call and WhatsApp buttons across the website.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• This number appears in the website footer</li>
              <li>• Shows up on the contact page with call/WhatsApp buttons</li>
              <li>• Used in all property listing contact cards</li>
              <li>• Updates happen in real-time across the entire site</li>
              <li>• If left empty, a default number will be shown</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || localContactNumber === centralContactNumber} 
          size="lg"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          <TranslatableText text="Save Contact Number" />
        </Button>
      </div>
    </div>
  );
};