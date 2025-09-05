"use client";

import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TranslatableText } from '@/components/TranslatableText'; // Ensure named import

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Property Approved!',
    message: 'Your property "Luxury Apartment" has been approved and is now live.',
    read: false,
    createdAt: '2023-10-26T12:00:00Z',
  },
  {
    id: '2',
    title: 'New Inquiry',
    message: 'You have a new inquiry for "Spacious Villa".',
    read: true,
    createdAt: '2023-10-25T10:00:00Z',
  },
  {
    id: '3',
    title: 'Verification Update',
    message: 'Your property "Cozy Home" verification status has been updated.',
    read: false,
    createdAt: '2023-10-24T16:00:00Z',
  },
];

const NotificationPanel: React.FC = () => {
  const [notifications] = React.useState<Notification[]>(dummyNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">
            <TranslatableText text="Notifications" />
          </h4>
          {unreadCount > 0 && (
            <Button variant="link" size="sm">
              <TranslatableText text="Mark all as read" />
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              <TranslatableText text="No new notifications." />
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col p-4 border-b last:border-b-0 ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <h5 className="font-medium text-sm">
                  <TranslatableText text={notification.title} />
                </h5>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                  <TranslatableText text={notification.message} />
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export { NotificationPanel };