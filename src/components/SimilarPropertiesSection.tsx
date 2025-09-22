import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import PropertyCard from '@/components/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';

interface SimilarPropertiesSectionProps {
  currentPropertyId: string;
  propertyType?: string;
  propertyCategory?: string;
  transactionType?: string;
  location?: string;
  city?: string;
}

const SimilarPropertiesSection: React.FC<SimilarPropertiesSectionProps> = ({
  currentPropertyId,
  propertyType,
  propertyCategory,
  transactionType,
  location,
  city,
}) => {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      // Early return if currentPropertyId is not valid
      if (!currentPropertyId || currentPropertyId.trim() === '') {
        console.warn('SimilarPropertiesSection: currentPropertyId is empty or undefined');
        setLoading(false);
        setError('Invalid property ID provided.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .in('approval_status', ['approved', 'pending'])
          .in('listing_status', ['Active', 'active']) // Handle case variations
          .neq('id', currentPropertyId) // Exclude the current property

        // Prioritize filters based on available data
        if (propertyCategory) {
          query = query.eq('property_category', propertyCategory);
        }
        if (propertyType) {
          query = query.eq('property_type', propertyType);
        }
        if (transactionType) {
          query = query.eq('transaction_type', transactionType);
        }
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }
        if (city) {
          query = query.ilike('city', `%${city}%`);
        }

        query = query.order('created_at', { ascending: false }).limit(6); // Limit to 6 similar properties

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        setSimilarProperties(data || []);
        
        // If no similar properties found with strict filters, try with fewer filters
        if (!data || data.length === 0) {
          console.log('No properties found with current filters, trying with fewer filters...');
          
          let fallbackQuery = supabase
            .from('properties')
            .select('*')
            .in('approval_status', ['approved', 'pending'])
            .in('listing_status', ['Active', 'active']);
          
          // Only add the neq filter if currentPropertyId is valid
          if (currentPropertyId && currentPropertyId.trim() !== '') {
            fallbackQuery = fallbackQuery.neq('id', currentPropertyId);
          }
          
          // Try with just city filter
          if (city) {
            fallbackQuery = fallbackQuery.ilike('city', `%${city}%`);
          }
          
          fallbackQuery = fallbackQuery.order('created_at', { ascending: false }).limit(6);
          
          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          
          if (!fallbackError && fallbackData) {
            setSimilarProperties(fallbackData);
          }
        }
      } catch (err) {
        console.error('Error fetching similar properties:', err);
        setError('Failed to load similar properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [currentPropertyId, propertyType, propertyCategory, transactionType, location, city]);

  if (loading) {
    return (
      <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-foreground">
            <TranslatableText text="Similar Properties" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted/30 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted/30 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-foreground">
            <TranslatableText text="Similar Properties" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (similarProperties.length === 0) {
    return null; // Don't show section if no similar properties are found
  }

  return (
    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl text-foreground">
          <TranslatableText text="Similar Properties" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarPropertiesSection;