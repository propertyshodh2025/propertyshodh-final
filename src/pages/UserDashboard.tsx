"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslatableText } from '@/components/TranslatableText'; // Corrected to named import
import { NotificationPanel } from '@/components/NotificationPanel'; // Corrected to named import
import { UserActivityPanel } from '@/components/UserActivityPanel'; // Corrected to named import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Bell, Activity, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">
          <TranslatableText text="Welcome to Your Dashboard" />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="My Properties" />
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="Active listings" />
              </p>
              <Button asChild variant="link" className="px-0 mt-2">
                <Link to="/my-properties">
                  <TranslatableText text="View Properties" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="Notifications" />
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="Unread notifications" />
              </p>
              <NotificationPanel /> {/* Using the corrected component */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <TranslatableText text="Recent Activity" />
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <TranslatableText text="Activities this week" />
              </p>
              <UserActivityPanel /> {/* Using the corrected component */}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <TranslatableText text="Profile Information" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <TranslatableText text="Manage your personal details and preferences." />
            </p>
            <Button asChild className="mt-4">
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                <TranslatableText text="Edit Profile" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Add more dashboard sections as needed */}
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;