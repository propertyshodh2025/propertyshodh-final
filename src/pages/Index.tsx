"use client";

import React, { useState, useEffect } from 'react';
import { ModernHeroSection } from '@/components/ModernHeroSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [totalProperties, setTotalProperties] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTotalProperties = async () => {
      try {
        const { count, error } = await supabase
          .from('properties')
          .select('id', { count: 'exact' })
          .eq('approval_status', 'approved')
          .eq('listing_status', 'active');

        if (error) throw error;
        setTotalProperties(count || 0);
      } catch (error) {
        console.error('Error fetching total properties:', error);
        toast({
          title: "Error",
          description: "Failed to load property count.",
          variant: "destructive",
        });
      }
    };

    fetchTotalProperties();
  }, [toast]);

  return (
    <div className="min-h-screen">
      <ModernHeroSection totalProperties={totalProperties} />
    </div>
  );
};

export default Index;