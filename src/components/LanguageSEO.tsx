import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// Keeps document title, meta description and html lang in sync with selected language
export const LanguageSEO: React.FC = () => {
  const { pathname } = useLocation();
  const { language, t } = useLanguage();

  useEffect(() => {
    // Update <html lang="...">
    const html = document.documentElement;
    html.setAttribute('lang', language === 'marathi' ? 'mr' : 'en');

    // Resolve route-based SEO keys
    let titleKey = 'seo.home.title';
    let descKey = 'seo.home.description';

    if (pathname.startsWith('/search')) {
      titleKey = 'seo.search.title';
      descKey = 'seo.search.description';
    } else if (pathname.startsWith('/properties')) {
      titleKey = 'seo.properties.title';
      descKey = 'seo.properties.description';
    } else if (pathname.startsWith('/property/')) {
      titleKey = 'seo.property.title';
      descKey = 'seo.property.description';
    }

    const title = t(titleKey);
    const description = t(descKey);

    // Title
    document.title = title;

    // Description meta
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [language, pathname, t]);

  return null;
};

export default LanguageSEO;
