import React, { useState, useEffect } from 'react';
import { Home, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  central_contact_number?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('central_contact_number, facebook_url, instagram_url, linkedin_url, twitter_url, youtube_url')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching site settings in footer:', error);
      } else if (data) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings in footer:', error);
    } finally {
      setLoading(false);
    }
  };

  const footerSections = [
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.aboutUs'), href: '/about' },
        { label: t('footer.contactUs'), href: '/contact' },
        { label: t('footer.careers'), href: '/careers' },
        { label: t('footer.privacyPolicy'), href: '/privacy' },
        { label: t('footer.termsOfService'), href: '/terms' },
      ]
    },
    {
      title: t('footer.properties'),
      links: [
        { label: t('footer.buyProperties'), href: '/search?type=buy' },
        { label: t('footer.rentProperties'), href: '/search?type=rent' },
        { label: t('footer.commercial'), href: '/search?type=commercial' },
        { label: t('footer.plotsLand'), href: '/search?type=plots' },
        { label: t('footer.allProperties'), href: '/properties' },
      ]
    },
    {
      title: t('footer.services'),
      links: [
        { label: t('footer.homeLoans'), href: '/services/loans' },
        { label: t('footer.propertyValuation'), href: '/services/valuation' },
        { label: t('footer.legalServices'), href: '/services/legal' },
        { label: t('footer.interiorDesign'), href: '/services/interior' },
        { label: t('footer.propertyManagement'), href: '/services/management' },
      ]
    },
    {
      title: t('footer.popularAreas'),
      links: [
        { label: 'CIDCO Aurangabad', href: '/search?location=cidco' },
        { label: 'Waluj Industrial Area', href: '/search?location=waluj' },
        { label: 'Kanchanwadi', href: '/search?location=kanchanwadi' },
        { label: 'Garkheda', href: '/search?location=garkheda' },
        { label: 'Osmanpura', href: '/search?location=osmanpura' },
      ]
    }
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-secondary-foreground">PropertyShodh</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Dargah, A-3, Sagar Apartment, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra 431001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{loading ? 'Loading...' : (siteSettings.central_contact_number || '+91 98765 43210')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@propertyshodh.com</span>
              </div>
            </div>
            
            {/* Social Media Links */}
            {!loading && Object.values(siteSettings).some(url => url && url.trim() !== '') && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-secondary-foreground">Follow Us</h4>
                <div className="flex items-center gap-3">
                  {siteSettings.facebook_url && (
                    <button 
                      onClick={() => window.open(siteSettings.facebook_url, '_blank')}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Follow us on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                  )}
                  {siteSettings.instagram_url && (
                    <button 
                      onClick={() => window.open(siteSettings.instagram_url, '_blank')}
                      className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
                      title="Follow us on Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </button>
                  )}
                  {siteSettings.linkedin_url && (
                    <button 
                      onClick={() => window.open(siteSettings.linkedin_url, '_blank')}
                      className="w-8 h-8 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Connect with us on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                  )}
                  {siteSettings.twitter_url && (
                    <button 
                      onClick={() => window.open(siteSettings.twitter_url, '_blank')}
                      className="w-8 h-8 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Follow us on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                  )}
                  {siteSettings.youtube_url && (
                    <button 
                      onClick={() => window.open(siteSettings.youtube_url, '_blank')}
                      className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Subscribe to our YouTube channel"
                    >
                      <Youtube className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-lg text-secondary-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button 
                      onClick={() => navigate(link.href)}
                      className="text-muted-foreground hover:text-secondary-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 lg:mt-12 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm text-center md:text-left">
              {t('footer.rights')}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/privacy')} className="hover:text-secondary-foreground transition-colors">
                {t('footer.privacyPolicy')}
              </button>
              <button onClick={() => navigate('/terms')} className="hover:text-secondary-foreground transition-colors">
                {t('footer.termsOfService')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};