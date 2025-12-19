'use client';

import React, { Suspense } from 'react';
import { AppHeader } from './components/app-header';
import { AppSidebar } from './components/app-sidebar';
import { usePlatformStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { PersonaProvider } from './contexts/persona-context';
import { AppChromeProvider, useAppChrome } from './contexts/app-chrome-context';

function ShellContent({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = usePlatformStore();
  const { chromeVisibility } = useAppChrome();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {chromeVisibility.header !== false && <AppHeader />}
      {chromeVisibility.sidebar !== false && (
        <Suspense fallback={<div className="w-16 md:w-64" />}>
          <AppSidebar />
        </Suspense>
      )}
      <main 
        className={cn(
          'flex-1 overflow-hidden transition-all duration-300',
          chromeVisibility.header !== false && 'pt-14',
          // Mobile: no padding when sidebar is closed
          chromeVisibility.sidebar !== false && 'md:pl-16',
          // Desktop: adjust padding based on sidebar state
          chromeVisibility.sidebar !== false && sidebarOpen ? 'md:pl-64' : chromeVisibility.sidebar !== false ? 'md:pl-16' : ''
        )}
      >
        <div className={cn(
          'h-full overflow-auto',
          // Only add padding when chrome is visible (to avoid double padding in focus mode)
          chromeVisibility.header !== false || chromeVisibility.sidebar !== false ? 'p-4 sm:p-6' : ''
        )}>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonaProvider>
      <AppChromeProvider>
        <ShellContent>{children}</ShellContent>
      </AppChromeProvider>
    </PersonaProvider>
  );
}
