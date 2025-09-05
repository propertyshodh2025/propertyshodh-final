"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TranslatableText } from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary dark:text-white">
          PropertyShodh
        </Link>

        {/* Navigation Links (Hidden on small screens) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <TranslatableText text="Home" />
          </Link>
          <Link to="/properties" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <TranslatableText text="Properties" />
          </Link>
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <TranslatableText text="About Us" />
          </Link>
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <TranslatableText text="Contact" />
          </Link>
        </nav>

        {/* Auth Buttons & Language Selector */}
        <div className="flex items-center space-x-4">
          <Select value={language} onValueChange={(value: 'en' | 'mr') => setLanguage(value)}>
            <SelectTrigger className="w-[80px] bg-gray-100 dark:bg-gray-800 border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="mr">MR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" className="hidden md:inline-flex">
            <TranslatableText text="Login" />
          </Button>
          <Button className="hidden md:inline-flex">
            <TranslatableText text="Sign Up" />
          </Button>
          {/* Mobile Menu Toggle (for later implementation) */}
          <Button variant="ghost" className="md:hidden">
            {/* Icon for mobile menu */}
            ☰
          </Button>
        </div>
      </div>
    </header>
  );
};

export { Header };