"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText'; // Corrected to named import
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to PropertyShodh!',
    message: 'Explore our new features and find your dream property.',
    type: 'info',
    read: false,
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    title: 'Property Approved!',
    message: 'Your listing "Luxury Apartment" has been approved and is now live.',
    type: 'success',
    read: false,
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    title: 'New Inquiry Received',
    message: 'A potential buyer is interested in your property "Spacious Villa".',
    type: 'warning',
    read: true,
    createdAt: '2023-10-24T09:15:00Z',
  },
];

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>(dummyNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">
            <TranslatableText text="Notifications" /> ({unreadCount})
          </h4>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllAsRead}>
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
                className={`flex items-start gap-3 p-4 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0">
                  {notification.type === 'info' && <Bell className="h-5 w-5 text-blue-500" />}
                  {notification.type === 'success' && <Bell className="h-5 w-5 text-green-500" />}
                  {notification.type === 'warning' && <Bell className="h-5 w-5 text-orange-500" />}
                  {notification.type === 'error' && <Bell className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-900 dark:text-white">
                    <TranslatableText text={notification.title} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <TranslatableText text={notification.message} />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export { NotificationPanel };