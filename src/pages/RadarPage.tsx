
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ModernHeroSection } from '@/components/ModernHeroSection';
import { ModernServicesSection } from '@/components/ModernServicesSection';
import { ModernFeaturedSection } from '@/components/ModernFeaturedSection';
import { EnhancedSearchEngine } from '@/components/EnhancedSearchEngine';
import { ModernMarketIntelligence } from '@/components/ModernMarketIntelligence';
import { RecentlyViewedProperties } from '@/components/RecentlyViewedProperties';
import { Footer } from '@/components/Footer';
import { QuestionFlow } from '@/components/QuestionFlow';
import { UserPropertyForm } from '@/components/UserPropertyForm';
import { QuestionFlowState } from '@/types/property';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PropertyCounter from '@/components/PropertyCounter';
import MRTPLinksSection from '@/components/MRTPLinksSection';

const Index = () => {
  const { user } = useAuth();
  const [isQuestionFlowOpen, setIsQuestionFlowOpen] = useState(false);
  const [isUserPropertyFormOpen, setIsUserPropertyFormOpen] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const navigate = useNavigate();

  const handleInitiateScan = () => {
    setIsQuestionFlowOpen(true);
  };

  const handleQuestionFlowComplete = (answers: QuestionFlowState) => {
    console.log('Search parameters:', answers);
    setIsQuestionFlowOpen(false);
    
    // Navigate to search results with parameters
    const searchParams = new URLSearchParams();
    if (answers.propertyType && answers.propertyType !== 'all') {
      searchParams.set('type', answers.propertyType);
    }
    if (answers.budgetRange && answers.budgetRange !== 'all') {
      searchParams.set('budget', answers.budgetRange);
    }
    if (answers.location && answers.location !== 'all') {
      searchParams.set('location', answers.location);
    }
    if (answers.bedrooms && answers.bedrooms !== 'all') {
      searchParams.set('bedrooms', answers.bedrooms);
    }
    
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleCloseQuestionFlow = () => {
    setIsQuestionFlowOpen(false);
  };

  const handleOpenUserPropertyForm = () => {
    if (!user) {
      // This will be handled by Header component
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleCloseUserPropertyForm = () => {
    setIsUserPropertyFormOpen(false);
  };

  const handlePropertyTypeSelect = (type: string) => {
    console.log('Selected property type:', type);
    // Navigate to search results with the selected type
    const searchParams = new URLSearchParams();
    searchParams.set('bedrooms', type.toLowerCase().replace(' ', ''));
    navigate(`/search?${searchParams.toString()}`);
  };

  useEffect(() => {
    const fetchPropertyCount = async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('listing_status', 'Active');
      
      setTotalProperties(count || 0);
    };
    
    fetchPropertyCount();
  }, []);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Header */}
      <Header />

      {/* Modern Hero Section */}
      <ModernHeroSection totalProperties={totalProperties} />

      {/* Modern Services Section */}
      <ModernServicesSection />

      {/* Modern Featured Properties */}
      <ModernFeaturedSection />

      {/* Recently Viewed Properties for logged-in users */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <RecentlyViewedProperties />
        </div>
      )}

      {/* Modern Market Intelligence */}
      <ModernMarketIntelligence />

      {/* MRTP Links Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MRTPLinksSection />
      </div>

      {/* Property Counter below MRTP Links */}
      <PropertyCounter />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <QuestionFlow
        isOpen={isQuestionFlowOpen}
        onClose={handleCloseQuestionFlow}
        onComplete={handleQuestionFlowComplete}
      />
      
      <UserPropertyForm
        isOpen={isUserPropertyFormOpen}
        onClose={handleCloseUserPropertyForm}
      />
    </div>
  );
};

export default Index;
