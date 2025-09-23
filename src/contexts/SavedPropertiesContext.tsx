"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SavedProperty {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
}

interface SavedPropertiesContextType {
  savedProperties: SavedProperty[];
  loading: boolean;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
  isPropertySaved: (propertyId: string) => boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export const SavedPropertiesProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_activities')
          .select('id, property_id, user_id, created_at')
          .eq('user_id', user.id)
          .eq('activity_type', 'property_saved');

        if (error) {
          console.error('Error fetching saved properties:', error.message);
        } else {
          setSavedProperties(data as SavedProperty[]);
        }
        setLoading(false);
      } else {
        setSavedProperties([]);
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSavedProperties();
    }
  }, [user, authLoading]);

  const toggleSavedProperty = async (propertyId: string) => {
    if (!user) {
      console.warn('User not logged in. Cannot save property.');
      return;
    }

    const isCurrentlySaved = isPropertySaved(propertyId);

    if (isCurrentlySaved) {
      // Remove from saved
      const { error } = await supabase
        .from('user_activities')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .eq('activity_type', 'property_saved');

      if (error) {
        console.error('Error unsaving property:', error.message);
      } else {
        setSavedProperties((prev) => prev.filter((p) => p.property_id !== propertyId));
      }
    } else {
      // Add to saved
      const { data, error } = await supabase
        .from('user_activities')
        .insert({ user_id: user.id, property_id: propertyId, activity_type: 'property_saved' })
        .select();

      if (error) {
        console.error('Error saving property:', error.message);
      } else if (data) {
        setSavedProperties((prev) => [...prev, data[0] as SavedProperty]);
      }
    }
  };

  const isPropertySaved = (propertyId: string) => {
    return savedProperties.some((p) => p.property_id === propertyId);
  };

  return (
    <SavedPropertiesContext.Provider value={{ savedProperties, loading, toggleSavedProperty, isPropertySaved }}>
      {children}
    </SavedPropertiesContext.Provider>
  );
};

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (context === undefined) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};