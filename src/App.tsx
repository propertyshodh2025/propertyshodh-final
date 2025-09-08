import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserContactProvider } from "@/contexts/UserContactContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SavedPropertiesProvider } from "@/contexts/SavedPropertiesContext";
import { AdminRouteProtection } from "@/components/auth/AdminRouteProtection";
import { useSessionCleanup } from "@/hooks/useSessionCleanup";
import RadarPage from "./pages/RadarPage";
import SearchResults from "./pages/SearchResults";
import EnhancedPropertyDetailsWrapper from "./pages/EnhancedPropertyDetailsWrapper";
import Properties from "./pages/Properties";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import { SuperSuperAdminDashboard } from "./pages/SuperSuperAdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import PresentationPage from "./pages/PresentationPage";
import NotFound from "./pages/NotFound";
import ServicesPage from "./pages/ServicesPage";
import LanguageSEO from "@/components/LanguageSEO";

import { PhoneVerificationGate } from "@/components/auth/PhoneVerificationGate";
import { MobileVerificationGuard } from "@/components/auth/MobileVerificationGuard";
import { AdminManagementContent } from "@/components/admin/AdminManagementContent";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize session cleanup on app start
  useSessionCleanup();

  return (
    <BrowserRouter>
      <LanguageSEO />
      
      <PhoneVerificationGate />
      <Routes>
        <Route path="/" element={<RadarPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/property/:id" element={<EnhancedPropertyDetailsWrapper />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/dashboard" element={
          <MobileVerificationGuard>
            <UserDashboard />
          </MobileVerificationGuard>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRouteProtection requiredRole="admin">
            <MobileVerificationGuard>
              <AdminDashboard />
            </MobileVerificationGuard>
          </AdminRouteProtection>
        } />
        <Route path="/admin/users" element={
          <AdminRouteProtection requiredRole="admin">
            <MobileVerificationGuard>
              <AdminManagementContent />
            </MobileVerificationGuard>
          </AdminRouteProtection>
        } />
        <Route path="/superadmin/*" element={
          <AdminRouteProtection requiredRole="superadmin">
            <MobileVerificationGuard>
              <SuperAdminDashboard />
            </MobileVerificationGuard>
          </AdminRouteProtection>
        } />
        <Route path="/omega-admin" element={
          <AdminRouteProtection requiredRole="super_super_admin">
            <MobileVerificationGuard>
              <SuperSuperAdminDashboard />
            </MobileVerificationGuard>
          </AdminRouteProtection>
        } />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/loans" element={<ServicesPage />} />
        <Route path="/services/valuation" element={<ServicesPage />} />
        <Route path="/services/legal" element={<ServicesPage />} />
        <Route path="/services/interior" element={<ServicesPage />} />
        <Route path="/services/management" element={<ServicesPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <SavedPropertiesProvider>
          <UserContactProvider>
            <LanguageProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
              </TooltipProvider>
            </LanguageProvider>
          </UserContactProvider>
        </SavedPropertiesProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;