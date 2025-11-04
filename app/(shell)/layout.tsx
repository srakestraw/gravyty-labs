'use client';

import { AppHeader } from './components/app-header';
import { AppSidebar } from './components/app-sidebar';
import { usePlatformStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = usePlatformStore();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppSidebar />
      <main 
        className={cn(
          'pt-14 min-h-screen transition-all duration-300',
          // Mobile: no padding when sidebar is closed
          'md:pl-16',
          // Desktop: adjust padding based on sidebar state
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        )}
      >
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
