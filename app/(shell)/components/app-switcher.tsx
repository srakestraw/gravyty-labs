'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

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
    id: 'ai-teammates',
    name: 'AI Teammates',
    shortName: 'AI',
    icon: 'fa-solid fa-robot',
    color: '#059669',
    path: '/ai-teammates',
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
  const router = useRouter();
  const { activeApp, setActiveApp } = usePlatformStore();

  return (
    <DropdownMenu>
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
          {apps.map((app) => {
            const isActive = activeApp.id === app.id;
            
            return (
              <DropdownMenuItem
                key={app.id}
                onClick={() => {
                  setActiveApp(app);
                  router.push(app.path);
                }}
                className="flex flex-col items-start p-3 h-auto cursor-pointer relative bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg"
              >
                {isActive && (
                  <FontAwesomeIcon icon="fa-solid fa-check" className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
                
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
              </DropdownMenuItem>
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
