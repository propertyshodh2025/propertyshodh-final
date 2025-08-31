import React from 'react';
import { EnhancedSearchEngine } from '@/components/EnhancedSearchEngine';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const SearchPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('search_page.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('search_page.description')}
          </p>
        </div>
        
        <div className="mb-12">
          <EnhancedSearchEngine />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchPage;