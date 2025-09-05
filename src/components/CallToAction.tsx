"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { TranslatableText } from '@/components/TranslatableText';
import { useNavigate } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate('/contact'); // Assuming a contact page exists
  };

  return (
    <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16 md:py-24 text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          <TranslatableText text="Ready to find your perfect property?" />
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          <TranslatableText text="Contact us today for personalized assistance." />
        </p>
        <Button
          onClick={handleContactClick}
          className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <TranslatableText text="Contact Us" />
        </Button>
      </div>
    </section>
  );
};

export { CallToAction };