"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MarketData: React.FC = () => {
  const data = [
    {
      id: 1,
      areaName: "CIDCO",
      avgPrice: 5500,
      priceChange: 2.5,
      totalProperties: 1200,
      demandLevel: "High",
      trend: "up",
    },
    {
      id: 2,
      areaName: "Jalna Road",
      avgPrice: 6200,
      priceChange: -1.2,
      totalProperties: 850,
      demandLevel: "Medium",
      trend: "down",
    },
    {
      id: 3,
      areaName: "Waluj MIDC",
      avgPrice: 3800,
      priceChange: 0.8,
      totalProperties: 600,
      demandLevel: "Medium",
      trend: "stable",
    },
    {
      id: 4,
      areaName: "Osmanpura",
      avgPrice: 7100,
      priceChange: 3.1,
      totalProperties: 450,
      demandLevel: "High",
      trend: "up",
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800"><TranslatableText text="Local Market Data" /></h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TranslatableText text="Area" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TranslatableText text="Avg. Price (per sq.ft)" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TranslatableText text="Price Change (3M)" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TranslatableText text="Total Properties" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TranslatableText text="Demand" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <TranslatableText text={item.areaName} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{item.avgPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={`flex items-center ${getPriceChangeColor(item.priceChange)}`}>
                    {getTrendIcon(item.trend)}
                    <span className="ml-1">{item.priceChange > 0 ? '+' : ''}{item.priceChange}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.totalProperties.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <TranslatableText text={item.demandLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { MarketData };