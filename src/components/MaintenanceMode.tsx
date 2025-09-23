import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Clock, Mail, Phone } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceModeProps {
  message?: string;
  enabledAt?: string | null;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ 
  message = 'We are currently performing scheduled maintenance. We\'ll be back shortly!',
  enabledAt 
}) => {
  const [centralContactNumber, setCentralContactNumber] = useState<string>('');

  useEffect(() => {
    const fetchContactNumber = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('central_contact_number')
          .single();
        
        if (data?.central_contact_number) {
          setCentralContactNumber(data.central_contact_number);
        }
      } catch (error) {
        console.error('Error fetching contact number:', error);
      }
    };

    fetchContactNumber();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900/20 flex items-center justify-center p-4">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIxIj4KPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjIiLz4KPC9nPgo8L2c+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="relative max-w-2xl w-full">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg animate-pulse">
                <Construction className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-2">
              <TranslatableText text="Under Maintenance" />
            </CardTitle>
            <div className="space-y-4">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
              
              {enabledAt && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>Maintenance started: {formatDate(enabledAt)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                <TranslatableText text="What's happening?" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Our team is working hard to improve your experience. We're performing essential updates and optimizations to serve you better.
              </p>
              <div className="flex justify-center items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  System Updates
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Performance Improvements
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Security Enhancements
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                <TranslatableText text="Need immediate assistance?" />
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a 
                  href="mailto:support@propertyshodh.com"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  support@propertyshodh.com
                </a>
                {centralContactNumber && (
                  <a 
                    href={`tel:${centralContactNumber}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Emergency Support: {centralContactNumber}
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Thank you for your patience. We'll be back online shortly!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceMode;