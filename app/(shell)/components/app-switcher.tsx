'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePlatformStore } from '@/lib/store';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { useAuth } from '@/lib/firebase/auth-context';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';

const apps = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    shortName: 'Dashboard',
    icon: 'fa-solid fa-house',
    color: '#3B82F6',
    path: '/dashboard',
  },
  {
    id: 'admissions',
    name: 'Admissions Management',
    shortName: 'Admissions',
    icon: 'fa-solid fa-clipboard-check',
    color: '#00B8D9',
    path: '/admissions',
  },
  {
    id: 'sis',
    name: 'Student Information System',
    shortName: 'SIS',
    icon: 'fa-solid fa-graduation-cap',
    color: '#7C3AED',
    path: '/sis',
  },
  {
    id: 'ai-assistants',
    name: 'AI Assistants',
    shortName: 'AI Assistants',
    icon: 'fa-solid fa-user-robot',
    color: '#8B5CF6',
    path: '/ai-assistants',
    requiresRole: true,
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    shortName: 'Admin',
    icon: 'fa-solid fa-cog',
    color: '#DC2626',
    path: '/admin',
  },
];

export function AppSwitcher() {
  const { activeApp, setActiveApp } = usePlatformStore();
  const { user } = useAuth();
  const router = useRouter();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const [open, setOpen] = useState(false);

  // Filter apps based on feature flags and roles - memoize to prevent array recreation
  const visibleApps = useMemo(() => {
    return apps.filter(app => {
      if (app.id === 'ai-assistants') {
        return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
      }
      return true;
    });
  }, [aiAssistantsEnabled, user?.email, user?.uid]);

  const handleAppSelect = (app: typeof apps[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown first
    setOpen(false);
    setActiveApp(app);
    
    // Use Next.js router for smooth client-side navigation
    // This prevents the error page flash that occurs with window.location
    router.push(app.path);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <FontAwesomeIcon icon="fa-solid fa-grid" className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-96 bg-white border border-gray-200 shadow-lg"
      >
        <DropdownMenuLabel className="text-gray-900 font-semibold">Switch Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="grid grid-cols-3 gap-2 p-2">
          {visibleApps.map((app) => {
            const isActive = activeApp.id === app.id;
            
            return (
              <div key={app.id} className="contents">
                <div
                  onClick={(e) => handleAppSelect(app, e)}
                  className="flex flex-col items-start p-3 h-auto cursor-pointer relative bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg"
                >
                  <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center">
                    {isActive ? (
                      <FontAwesomeIcon icon="fa-solid fa-check" className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="w-4 h-4" />
                    )}
                  </span>
                  
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg mb-2"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <FontAwesomeIcon 
                      icon={app.icon}
                      className="h-6 w-6"
                      style={{ color: app.color }}
                    />
                  </div>
                  
                  <div className="w-full">
                    <div className="font-medium text-sm">
                      {app.shortName}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                    {app.name}
                  </div>
                </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-xs text-gray-500 justify-center bg-white hover:bg-gray-50">
          More apps coming soon...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
