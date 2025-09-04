import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TranslatableText } from '@/components/TranslatableText';
import { Settings } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

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
        title: <TranslatableText text="Error" />,
        description: <TranslatableText text="Failed to fetch site settings." />,
        variant: "destructive",
      });
    } else if (data) {
      setCentralContactNumber(data.central_contact_number || '');
    } else {
      // If no settings exist, we might need to create a default entry
      // For now, we'll just set an empty string and allow saving
      setCentralContactNumber('');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let errorOccurred = false;

    // First, try to update an existing entry
    const { data: updateData, error: updateError } = await supabase
      .from('site_settings')
      .update({ central_contact_number: centralContactNumber, updated_at: new Date().toISOString() })
      .limit(1)
      .select();

    if (updateError) {
      console.error('Error updating site settings:', updateError);
      errorOccurred = true;
    }

    // If no row was updated (meaning it didn't exist), try to insert
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({ central_contact_number: centralContactNumber })
        .select();

      if (insertError) {
        console.error('Error inserting site settings:', insertError);
        errorOccurred = true;
      }
    }

    if (!errorOccurred) {
      toast({
        title: <TranslatableText text="Success" />,
        description: <TranslatableText text="Central contact number updated successfully!" />,
      });
    } else {
      toast({
        title: <TranslatableText text="Error" />,
        description: <TranslatableText text="Failed to update central contact number." />,
        variant: "destructive",
      });
    }
    setIsSaving(false);
    fetchSettings(); // Re-fetch to ensure state is consistent
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <TranslatableText text="Admin Settings" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <TranslatableText text="Manage global settings for the application, such as the centralized contact number for all property listings." />
          </p>
          <div className="space-y-2">
            <Label htmlFor="centralContactNumber">
              <TranslatableText text="Central PropertyShodh Contact Number" />
            </Label>
            <Input
              id="centralContactNumber"
              type="tel"
              value={centralContactNumber}
              onChange={(e) => setCentralContactNumber(e.target.value)}
              placeholder="e.g., +91 98765 43210"
              disabled={loading || isSaving}
            />
            <p className="text-sm text-muted-foreground">
              <TranslatableText text="This number will be displayed on all property detail pages for inquiries." />
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button onClick={handleSave} disabled={loading || isSaving}>
            {isSaving ? <TranslatableText text="Saving..." /> : <TranslatableText text="Save Settings" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;