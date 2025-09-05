"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon as LucideIcon } from 'lucide-react';
import { TranslatableText } from '@/components/TranslatableText';

interface ServiceCardProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, titleKey, descriptionKey }) => {
  return (
    <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="flex flex-col items-center p-0 mb-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-semibold mb-2">
          <TranslatableText text={titleKey} />
        </CardTitle>
      </CardHeader>
      <CardDescription className="text-muted-foreground flex-grow">
        <TranslatableText text={descriptionKey} />
      </CardDescription>
    </Card>
  );
};