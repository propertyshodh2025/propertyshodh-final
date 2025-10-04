import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedPropertyDetailsPage } from '@/components/EnhancedPropertyDetailsPage';
import { PropertyDetailsSkeleton } from '@/components/PropertyDetailsSkeleton';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';

const EnhancedPropertyDetailsWrapper: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when component mounts or property ID changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [id]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID not found');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (propertyError) {
          console.error('Error fetching property:', propertyError);
          setError('Failed to fetch property details');
          return;
        }

        if (!data) {
          setError('Property not found');
          return;
        }
        
        setProperty(data);
        
        // Log property view for logged-in users
        logPropertyView();
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    const logPropertyView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && id) {
          await supabase.from('user_activities').insert({
            user_id: user.id,
            activity_type: 'property_view',
            property_id: id,
            metadata: {
              timestamp: new Date().toISOString(),
              page: 'property_details'
            }
          });
        }
      } catch (error) {
        console.error('Error logging property view:', error);
      }
    };
    
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-28">
        <Header />
        <PropertyDetailsSkeleton />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-28">
        <Header />
        <div className="flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Home size={32} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Property Not Found</h2>
              <p className="text-muted-foreground text-lg">
                {error || "The property you're looking for doesn't exist or has been removed."}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/search')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Browse Properties
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-white/20 hover:bg-white/10"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-28">
      <Header />
      <EnhancedPropertyDetailsPage property={property} />
    </div>
  );

};

export default EnhancedPropertyDetailsWrapper;