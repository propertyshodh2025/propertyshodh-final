"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText';
import { Brain, TrendingUp, DollarSign } from 'lucide-react'; // Example icons

const MarketInsights: React.FC = () => {
  const insights = [
    {
      id: 1,
      title: "Property Value Appreciation",
      description: "Average property values increased by 7% in the last quarter.",
      value: "+7%",
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      colorScheme: "from-green-500 to-teal-600"
    },
    {
      id: 2,
      title: "Rental Yields",
      description: "Rental yields remain strong, averaging 4.5% across residential properties.",
      value: "4.5%",
      icon: <DollarSign className="h-8 w-8 text-white" />,
      colorScheme: "from-yellow-500 to-orange-600"
    },
    {
      id: 3,
      title: "New Developments",
      description: "Several new residential and commercial projects launched this month.",
      value: "15+",
      icon: <Brain className="h-8 w-8 text-white" />,
      colorScheme: "from-blue-500 to-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {insights.map(insight => (
        <div
          key={insight.id}
          className={`relative p-6 rounded-xl shadow-lg overflow-hidden bg-gradient-to-br ${insight.colorScheme}`}
        >
          <div className="absolute inset-0 opacity-20 flex items-center justify-center">
            {insight.icon}
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center mb-3">
              {insight.icon}
              <h3 className="text-xl font-semibold ml-3"><TranslatableText text={insight.title} /></h3>
            </div>
            <p className="text-3xl font-bold mb-2">{insight.value}</p>
            <p className="text-sm opacity-90"><TranslatableText text={insight.description} /></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export { MarketInsights };