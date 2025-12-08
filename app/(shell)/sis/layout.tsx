'use client';

import React from 'react';
import { AppHeader } from '@/app/(shell)/components/app-header';
import { AppSidebar } from '@/app/(shell)/components/app-sidebar';
import { usePlatformStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function SISLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = usePlatformStore();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      <AppSidebar />
      <main 
        className={cn(
          'flex-1 pt-14 overflow-hidden transition-all duration-300',
          // Mobile: no padding when sidebar is closed
          'md:pl-16',
          // Desktop: adjust padding based on sidebar state
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        )}
      >
        <div className="h-full p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
