import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'english' ? 'marathi' : 'english')}
      className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 hover:bg-accent/80 transition-colors"
    >
      <div className="flex items-center justify-center">
        <Globe className="h-4 w-4 text-foreground mr-1" />
        <span className="text-xs font-medium text-foreground">
          {language === 'english' ? 'मर' : 'EN'}
        </span>
      </div>
      <span className="sr-only">Toggle language</span>
    </Button>
  );
};