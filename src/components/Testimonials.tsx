"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Testimonials: React.FC = () => {
  const testimonialsData = [
    {
      id: 1,
      name: "Priya Sharma",
      title: "First-time Home Buyer",
      quote: "Finding my dream home was a breeze with this platform. The detailed listings and responsive agents made the process so smooth!",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PS",
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      title: "Property Investor",
      quote: "The market insights provided here are invaluable. I've made several profitable investments thanks to their accurate data and expert advice.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RK",
    },
    {
      id: 3,
      name: "Anjali Singh",
      title: "Commercial Property Seeker",
      quote: "I needed a new office space urgently, and this platform delivered. The filters were precise, and I found the perfect location in no time.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AS",
    },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">
          <TranslatableText text="What Our Clients Say" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col justify-between">
              <CardContent className="p-0">
                <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                  "{<TranslatableText text={testimonial.quote} />}"
                </p>
              </CardContent>
              <CardHeader className="flex flex-row items-center p-0">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    <TranslatableText text={testimonial.name} />
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <TranslatableText text={testimonial.title} />
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Testimonials };