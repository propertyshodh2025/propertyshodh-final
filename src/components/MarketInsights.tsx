"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslatableText } from '@/components/TranslatableText';
import { Brain, TrendingUp, DollarSign, Home } from 'lucide-react';

const iconMap = {
  Brain: Brain,
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  Home: Home,
};

const MarketInsights: React.FC = () => {
  const insights = [
    {
      id: 1,
      title: "Property Value Appreciation",
      description: "Aurangabad's property values have seen a steady 7% appreciation over the last year.",
      value: "+7%",
      iconType: "TrendingUp",
      colorScheme: "from-green-500 to-teal-600",
    },
    {
      id: 2,
      title: "Rental Yield",
      description: "Average rental yield in prime areas is currently at 4.5%, offering good returns.",
      value: "4.5%",
      iconType: "DollarSign",
      colorScheme: "from-yellow-500 to-orange-600",
    },
    {
      id: 3,
      title: "New Projects Launched",
      description: "Over 50 new residential and commercial projects launched in the last quarter.",
      value: "50+",
      iconType: "Home",
      colorScheme: "from-blue-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {insights.map((insight) => {
        const IconComponent = iconMap[insight.iconType as keyof typeof iconMap] || Brain;
        return (
          <Card key={insight.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                <TranslatableText text={insight.title} />
              </CardTitle>
              <IconComponent className={`h-6 w-6 text-gray-500 dark:text-gray-400`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold bg-gradient-to-r ${insight.colorScheme} bg-clip-text text-transparent mb-2`}>
                {insight.value}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <TranslatableText text={insight.description} />
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export { MarketInsights };