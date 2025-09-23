import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Phone, RefreshCw } from 'lucide-react';
import { useSimpleCentralContact } from '@/hooks/useSimpleCentralContact';

export const SimpleCentralContactAdmin: React.FC = () => {
  const { contactNumber, isLoading, updateContact, refreshContact } = useSimpleCentralContact();
  const [inputValue, setInputValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update input value when contact number changes
  useEffect(() => {
    setInputValue(contactNumber);
    console.log('📝 SIMPLE ADMIN: Contact number updated:', contactNumber);
  }, [contactNumber]);

  const handleSave = async () => {
    console.log('💾 SIMPLE ADMIN: Saving contact number:', inputValue);
    setIsSaving(true);
    
    try {
      const success = await updateContact(inputValue);
      console.log('💾 SIMPLE ADMIN: Save result:', success);
    } catch (error) {
      console.error('💾 SIMPLE ADMIN: Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 SIMPLE ADMIN: Manual refresh triggered');
    setIsRefreshing(true);
    
    try {
      await refreshContact();
      console.log('🔄 SIMPLE ADMIN: Refresh completed');
    } catch (error) {
      console.error('🔄 SIMPLE ADMIN: Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>📞 Central Contact Number</CardTitle>
          <CardDescription>Loading contact settings...</CardDescription>
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
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <CardTitle>📞 Central Contact Number Management</CardTitle>
        </div>
        <CardDescription>
          Manage the central contact number that appears across your entire website.
          This number will be shown in the footer, contact page, and all property listings.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Number Display */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Label className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Current Number in Database:
          </Label>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {contactNumber || '(Not set)'}
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <Label htmlFor="contactInput" className="text-base font-medium">
            Update Contact Number:
          </Label>
          <Input
            id="contactInput"
            type="tel"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter new contact number (e.g., +91 98765 43210)"
            className="text-lg p-4"
            disabled={isSaving}
          />
          <p className="text-sm text-muted-foreground">
            Enter the complete phone number with country code.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isRefreshing || inputValue === contactNumber}
            size="lg"
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Contact Number
              </>
            )}
          </Button>

          <Button 
            onClick={handleRefresh}
            variant="outline" 
            disabled={isSaving || isRefreshing}
            size="lg"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
            ✅ After Updating:
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <li>• The number will instantly appear in the website footer</li>
            <li>• Contact page will show the new number with call/WhatsApp buttons</li>
            <li>• All property listings will use this number for contact</li>
            <li>• Changes are applied in real-time across the entire website</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border rounded-lg">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              🔧 Debug Information (Click to expand)
            </summary>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Current Contact: "{contactNumber}"</div>
              <div>Input Value: "{inputValue}"</div>
              <div>Is Loading: {isLoading.toString()}</div>
              <div>Is Saving: {isSaving.toString()}</div>
              <div>Check browser console for detailed logs</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};