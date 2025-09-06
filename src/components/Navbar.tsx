"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="PropertyShodh Logo" className="h-6 w-6" />
          <span className="font-bold text-lg hidden sm:inline-block">PropertyShodh</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/properties">
            <Button variant="ghost">{t('properties')}</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost">{t('about')}</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost">{t('contact')}</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;