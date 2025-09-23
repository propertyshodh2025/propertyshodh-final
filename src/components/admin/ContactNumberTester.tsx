import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCentralContact } from '@/hooks/useCentralContact';

export const ContactNumberTester: React.FC = () => {
  const { centralContactNumber, loading, updateContactNumber } = useCentralContact();
  const [testNumber, setTestNumber] = useState('+91 98765 43210');
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    console.log('🧪 TESTING: Starting contact number test with:', testNumber);
    
    try {
      const success = await updateContactNumber(testNumber);
      console.log('🧪 TESTING: Result:', success);
    } catch (error) {
      console.error('🧪 TESTING: Error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Contact Number Tester</CardTitle>
        <CardDescription>Test the central contact number update functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Number:</label>
          <div className="text-lg font-bold text-green-600">
            {loading ? 'Loading...' : (centralContactNumber || 'Not set')}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Number:</label>
          <Input
            type="tel"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            placeholder="Enter test number"
          />
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isTesting || loading}
          className="w-full"
        >
          {isTesting ? '🔄 Testing...' : '🧪 Test Update'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
};