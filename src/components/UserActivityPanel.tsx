"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText'; // Corrected to named import
import { History, Search, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface UserActivity {
  id: string;
  type: 'view' | 'search' | 'saved';
  description: string;
  createdAt: string;
}

const dummyActivities: UserActivity[] = [
  {
    id: '1',
    type: 'view',
    description: 'Viewed "Luxury Apartment in City Center"',
    createdAt: '2023-10-26T11:00:00Z',
  },
  {
    id: '2',
    type: 'search',
    description: 'Searched for "2BHK apartments in CIDCO"',
    createdAt: '2023-10-26T10:30:00Z',
  },
  {
    id: '3',
    type: 'saved',
    description: 'Saved "Spacious Villa with Garden" to favorites',
    createdAt: '2023-10-25T15:00:00Z',
  },
];

const UserActivityPanel: React.FC = () => {
  const [activities] = React.useState<UserActivity[]>(dummyActivities);

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'search':
        return <Search className="h-4 w-4 text-purple-500" />;
      case 'saved':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <History className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">
            <TranslatableText text="Recent Activity" />
          </h4>
        </div>
        <Separator />
        <ScrollArea className="h-72">
          {activities.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              <TranslatableText text="No recent activity." />
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <TranslatableText text={activity.description} />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export { UserActivityPanel };