import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Plus, Menu } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GoogleSignInDialog } from '@/components/auth/GoogleSignInDialog';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isUserDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-background/80 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-2xl shadow-primary/10' 
          : 'py-4 bg-background/60 backdrop-blur-xl border-b border-white/30 dark:border-white/15 shadow-xl shadow-primary/5'
      }`}>
        <div className="w-full pl-1 pr-4 sm:pl-2 sm:pr-6 lg:pl-3 lg:pr-8">
          <div className="flex items-center justify-between h-20 gap-4 min-w-0">
            
            {/* Left: Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0 ml-0"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 overflow-hidden">
                <img 
                  src="/uploads/324f6fd3-8142-434c-a7ea-4f1aabf59921.png" 
                  alt="Property Radar Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('NEW LOGO FAILED TO LOAD:', e.currentTarget.src);
                    e.currentTarget.src = "/uploads/1e2142da-86ba-43de-8e5f-fcbca8ec3cf4.png";
                  }}
                  onLoad={() => console.log('NEW LOGO LOADED SUCCESSFULLY!')}
                />
              </div>
              <span className="text-3xl font-bold text-primary dark:text-blue-400 whitespace-nowrap">PropertyShodh</span>
            </div>

            {/* Center: Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {t('home') || 'Home'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/about')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === '/about' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {t('about') || 'About'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/services')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname.startsWith('/services') 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {t('services') || 'Services'}
              </Button>
            </div>

            {/* Right: Actions */}

            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              
              {/* List New Property Button - Only show on user dashboard */}
              {isUserDashboard && user && (
                <Button 
                  onClick={() => navigate('/dashboard?tab=properties')}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:scale-105 hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('list_new_property')}
                </Button>
              )}

              {/* Post Property Button - Show on other pages */}
              {!isUserDashboard && (
                <Button 
                  onClick={() => {
                    if (!user) {
                      setShowAuthDialog(true);
                    } else {
                      navigate('/dashboard?tab=properties');
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105 hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('post_property')}
                </Button>
              )}

              {/* User Actions */}
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline" 
                  className="bg-background/40 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="hidden md:inline font-medium">{user.email?.split('@')[0]}</span>
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowAuthDialog(true)}
                  variant="outline"
                  className="bg-background/40 backdrop-blur-sm border border-white/20 hover:border-primary/50 rounded-xl transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('login')}
                </Button>
              )}

              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-background/40 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-background/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl">
                  <div className="flex flex-col gap-6 mt-6">
                    
                    {/* Mobile Navigation */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/')}
                      >
                        {t('home') || 'Home'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/about')}
                      >
                        {t('about') || 'About'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/services')}
                      >
                        {t('services') || 'Services'}
                      </Button>
                    </div>
                    
                    {/* Mobile User Section */}
                    {user ? (
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.email?.split('@')[0]}</div>
                            <div className="text-sm text-muted-foreground">{t('verified_user')}</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleNavigation('/dashboard')}
                        >
                          {t('go_to_dashboard')}
                        </Button>
                      </div>
                    ) : (
                      <div className="border-b pb-4">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => setShowAuthDialog(true)}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          {t('login_sign_up')}
                        </Button>
                      </div>
                    )}

                    {/* Mobile Post Property */}
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (!user) {
                          setShowAuthDialog(true);
                          setIsMobileMenuOpen(false);
                        } else {
                          handleNavigation('/dashboard?tab=properties');
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('post_property')}
                    </Button>

                    {/* Mobile Sign Out */}
                    {user && (
                      <Button 
                        variant="ghost" 
                        className="w-full text-destructive hover:bg-destructive/10"
                        onClick={signOut}
                      >
                        {t('sign_out')}
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <GoogleSignInDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </>
  );
};