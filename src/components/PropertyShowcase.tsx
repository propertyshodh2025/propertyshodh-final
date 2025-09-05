"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranslatableText } from '@/components/TranslatableText';
import { MapPin, IndianRupee } from 'lucide-react';

const PropertyShowcase: React.FC = () => {
  const properties = [
    {
      id: 1,
      title: "Luxury Apartment in City Center",
      location: "Aurangabad",
      price: 12000000,
      image: "/placeholder/img/property1.jpg",
    },
    {
      id: 2,
      title: "Spacious Villa with Garden",
      location: "Deolai, Aurangabad",
      price: 25000000,
      image: "/placeholder/img/property2.jpg",
    },
    {
      id: 3,
      title: "Commercial Office Space",
      location: "CIDCO, Aurangabad",
      price: 8000000,
      image: "/placeholder/img/property3.jpg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              <TranslatableText text={property.title} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="mr-2 h-4 w-4" />
              <TranslatableText text={property.location} />
            </div>
            <div className="flex items-center text-lg font-bold text-primary dark:text-primary-foreground">
              <IndianRupee className="mr-1 h-5 w-5" />
              {property.price.toLocaleString('en-IN')}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <TranslatableText text="View Details" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export { PropertyShowcase };