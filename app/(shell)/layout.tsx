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
          sidebarOpen ? 'pl-64' : 'pl-16'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
