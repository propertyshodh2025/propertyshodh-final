import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TranslatableText } from '@/components/TranslatableText';
import { Settings, Users, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SuperAdminDashboard: React.FC = () => {
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadingSettings(true);
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
      setCentralContactNumber('');
    }
    setLoadingSettings(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    let errorOccurred = false;

    const { data: updateData, error: updateError } = await supabase
      .from('site_settings')
      .update({ central_contact_number: centralContactNumber, updated_at: new Date().toISOString() })
      .limit(1)
      .select();

    if (updateError) {
      console.error('Error updating site settings:', updateError);
      errorOccurred = true;
    }

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
    setIsSavingSettings(false);
    fetchSettings();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        <TranslatableText text="Super Admin Dashboard" />
      </h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center justify-center py-2 h-auto">
            <LayoutDashboard className="h-5 w-5 mb-1" />
            <span className="text-xs"><TranslatableText text="Overview" /></span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex flex-col items-center justify-center py-2 h-auto">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs"><TranslatableText text="Users" /></span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex flex-col items-center justify-center py-2 h-auto">
            <ShieldCheck className="h-5 w-5 mb-1" />
            <span className="text-xs"><TranslatableText text="Roles" /></span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center justify-center py-2 h-auto">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs"><TranslatableText text="Settings" /></span>
          </TabsTrigger>
          {/* Add more tabs as needed */}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle><TranslatableText text="Dashboard Overview" /></CardTitle>
              </CardHeader>
              <CardContent>
                <p><TranslatableText text="Welcome to the Super Admin Dashboard. Here you can manage various aspects of the application with elevated privileges." /></p>
                {/* Add more overview content here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle><TranslatableText text="User Management" /></CardTitle>
              </CardHeader>
              <CardContent>
                <p><TranslatableText text="Manage all user accounts, including their roles and permissions." /></p>
                {/* User management components will go here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle><TranslatableText text="Role Management" /></CardTitle>
              </CardHeader>
              <CardContent>
                <p><TranslatableText text="Define and assign roles to administrators and other privileged users." /></p>
                {/* Role management components will go here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <TranslatableText text="Global Site Settings" />
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
                    disabled={loadingSettings || isSavingSettings}
                  />
                  <p className="text-sm text-muted-foreground">
                    <TranslatableText text="This number will be displayed on all property detail pages for inquiries." />
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button onClick={handleSaveSettings} disabled={loadingSettings || isSavingSettings}>
                  {isSavingSettings ? <TranslatableText text="Saving..." /> : <TranslatableText text="Save Settings" />}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};