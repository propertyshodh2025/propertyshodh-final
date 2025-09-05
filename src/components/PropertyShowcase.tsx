"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText';

const PropertyShowcase: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Placeholder for property cards */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800"><TranslatableText text="Property 1" /></h3>
        <p className="text-gray-600"><TranslatableText text="Beautiful apartment in the city center." /></p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800"><TranslatableText text="Property 2" /></h3>
        <p className="text-gray-600"><TranslatableText text="Spacious villa with a garden." /></p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800"><TranslatableText text="Property 3" /></h3>
        <p className="text-gray-600"><TranslatableText text="Commercial office space for rent." /></p>
      </div>
    </div>
  );
};

export { PropertyShowcase };