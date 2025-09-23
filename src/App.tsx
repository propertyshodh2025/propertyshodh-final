"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserContactProvider } from '@/contexts/UserContactContext';
import { SavedPropertiesProvider } from '@/contexts/SavedPropertiesContext';
import MaintenanceWrapper from '@/components/MaintenanceWrapper'; // Assuming this component exists
import Index from '@/pages/RadarPage'; // Your main page
import PropertiesPage from '@/pages/PropertiesPage'; // Assuming this page exists
import PropertyDetailPage from '@/pages/PropertyDetailPage'; // Assuming this page exists
import LoginPage from '@/pages/Login'; // Assuming this page exists
import DashboardPage from '@/pages/Dashboard'; // Assuming this page exists
import ListPropertyPage from '@/pages/ListPropertyPage'; // Assuming this page exists
import SearchResultsPage from '@/pages/SearchResultsPage'; // Assuming this page exists

const queryClient = new QueryClient();

function AppContent() {
  return (
    <Router>
      <MaintenanceWrapper>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/list-property" element={<ListPropertyPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          {/* Add other routes here */}
        </Routes>
      </MaintenanceWrapper>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserContactProvider>
            <SavedPropertiesProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <AppContent />
                </TooltipProvider>
              </LanguageProvider>
            </SavedPropertiesProvider>
          </UserContactProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;