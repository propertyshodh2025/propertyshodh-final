import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header Skeleton */}
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <div className="flex flex-wrap items-center gap-6">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
            
            <div className="lg:text-right space-y-4">
              <Skeleton className="h-16 w-32 ml-auto" />
              <div className="flex gap-3 justify-start lg:justify-end">
                <Skeleton className="h-10 w-20 rounded-full" />
                <Skeleton className="h-10 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* Image Gallery Skeleton */}
            <div className="overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl">
              <Skeleton className="w-full h-[400px] md:h-[500px]" />
              <div className="p-4 bg-white/10 dark:bg-black/10">
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>

            {/* Content Cards Skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-6">
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-1 w-full" />
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};