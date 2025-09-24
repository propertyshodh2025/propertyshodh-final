import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';

interface SavedPropertiesContextType {
  savedProperties: Property[];
  saveProperty: (propertyId: string) => Promise<void>;
  removeSavedProperty: (propertyId: string) => Promise<void>;
  isPropertySaved: (propertyId: string) => boolean;
  loading: boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (context === undefined) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};

export const SavedPropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedProperties();
    } else {
      // For non-authenticated users, use localStorage
      const saved = localStorage.getItem('savedProperties');
      if (saved) {
        setSavedPropertyIds(new Set(JSON.parse(saved)));
      }
      setLoading(false);
    }
  }, [user]);

  const fetchSavedProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get saved property IDs from user_activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('property_id')
        .eq('user_id', user.id)
        .eq('activity_type', 'property_saved')
        .not('property_id', 'is', null);

      if (activities && activities.length > 0) {
        const propertyIds = activities.map(a => a.property_id).filter(Boolean);
        setSavedPropertyIds(new Set(propertyIds));

        // Fetch the actual property details
        const { data: properties } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        setSavedProperties(properties || []);
      } else {
        setSavedProperties([]);
        setSavedPropertyIds(new Set());
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProperty = async (propertyId: string) => {
    if (user) {
      try {
        // Check if already saved
        const { data: existing } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .eq('activity_type', 'property_saved')
          .single();

        if (!existing) {
          // Save to database
          await supabase
            .from('user_activities')
            .insert({
              user_id: user.id,
              property_id: propertyId,
              activity_type: 'property_saved'
            });

          // Update local state
          setSavedPropertyIds(prev => new Set([...prev, propertyId]));
          
          // Fetch the property details and add to savedProperties
          const { data: property } = await supabase
            .from('properties')
            .select('*')
            .eq('id', propertyId)
            .single();

          if (property) {
            setSavedProperties(prev => [...prev, property]);
          }
        }
      } catch (error) {
        console.error('Error saving property:', error);
        throw error;
      }
    } else {
      // For non-authenticated users, use localStorage
      const saved = localStorage.getItem('savedProperties');
      const savedArray = saved ? JSON.parse(saved) : [];
      if (!savedArray.includes(propertyId)) {
        savedArray.push(propertyId);
        localStorage.setItem('savedProperties', JSON.stringify(savedArray));
        setSavedPropertyIds(new Set(savedArray));
      }
    }
  };

  const removeSavedProperty = async (propertyId: string) => {
    if (user) {
      try {
        // Remove from database
        await supabase
          .from('user_activities')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .eq('activity_type', 'property_saved');

        // Update local state
        setSavedPropertyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        
        setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
      } catch (error) {
        console.error('Error removing saved property:', error);
        throw error;
      }
    } else {
      // For non-authenticated users, use localStorage
      const saved = localStorage.getItem('savedProperties');
      if (saved) {
        const savedArray = JSON.parse(saved);
        const filteredArray = savedArray.filter((id: string) => id !== propertyId);
        localStorage.setItem('savedProperties', JSON.stringify(filteredArray));
        setSavedPropertyIds(new Set(filteredArray));
      }
    }
  };

  const isPropertySaved = (propertyId: string) => {
    return savedPropertyIds.has(propertyId);
  };

  const value = {
    savedProperties,
    saveProperty,
    removeSavedProperty,
    isPropertySaved,
    loading
  };

  return (
    <SavedPropertiesContext.Provider value={value}>
      {children}
    </SavedPropertiesContext.Provider>
  );
};