"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslatableText } from '@/components/TranslatableText';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const MarketData: React.FC = () => {
  const marketAreas = [
    {
      id: 1,
      areaName: "CIDCO",
      avgPrice: 4500,
      priceChange: 5.2,
      totalProperties: 1500,
      demandLevel: "High",
      trend: "up",
    },
    {
      id: 2,
      areaName: "Jalna Road",
      avgPrice: 6200,
      priceChange: -1.8,
      totalProperties: 800,
      demandLevel: "Medium",
      trend: "down",
    },
    {
      id: 3,
      areaName: "Waluj MIDC",
      avgPrice: 3100,
      priceChange: 0.5,
      totalProperties: 2000,
      demandLevel: "Medium",
      trend: "stable",
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'bg-green-100 text-green-800';
    if (trend === 'down') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {marketAreas.map((data) => (
        <Card key={data.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              <TranslatableText text={data.areaName} />
            </CardTitle>
            <Badge className={`${getTrendColor(data.trend)} flex items-center gap-1`}>
              {getTrendIcon(data.trend)}
              <TranslatableText text={data.trend.charAt(0).toUpperCase() + data.trend.slice(1)} />
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400"><TranslatableText text="Avg. Price" /></p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{data.avgPrice.toLocaleString('en-IN')}/sqft</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400"><TranslatableText text="Price Change" /></p>
                <p className={`text-lg font-semibold ${data.priceChange > 0 ? 'text-green-600' : data.priceChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {data.priceChange > 0 ? '+' : ''}{data.priceChange}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400"><TranslatableText text="Total Properties" /></p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{data.totalProperties}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400"><TranslatableText text="Demand Level" /></p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white"><TranslatableText text={data.demandLevel} /></p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { MarketData };