import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

export const MaintenanceDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const testMaintenanceQuery = async () => {
      console.log('🔧 Testing maintenance query...');
      
      try {
        // Test basic connection
        const { data: testData, error: testError } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1);
        
        console.log('🔗 Basic connection test:', { testData, testError });
        
        // Test specific columns
        const { data: specificData, error: specificError } = await supabase
          .from('site_settings')
          .select('maintenance_mode, maintenance_message, maintenance_enabled_at');
        
        console.log('🎯 Specific columns test:', { specificData, specificError });
        
        setDebugInfo({
          basicQuery: { testData, testError },
          specificQuery: { specificData, specificError },
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('💥 Debug query failed:', error);
        setDebugInfo({
          error: error,
          timestamp: new Date().toISOString()
        });
      }
    };

    testMaintenanceQuery();
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <Card className="p-4 m-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-bold text-yellow-800 mb-2">🔧 Maintenance Mode Debug</h3>
      <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </Card>
  );
};

export default MaintenanceDebug;