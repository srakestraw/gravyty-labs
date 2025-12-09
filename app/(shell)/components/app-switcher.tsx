'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

interface AppItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  color?: string;
  requiresRole?: boolean;
  poweredBy?: string | string[];
  description?: string; // Short description shown under the label
}

// Main apps - flat list without section headers
const mainApps: AppItem[] = [
  {
    id: 'home',
    name: 'Home',
    icon: 'fa-solid fa-house',
    path: '/dashboard',
    color: '#3B82F6',
    poweredBy: 'Platform',
    description: 'Your unified dashboard with insights, alerts, and shortcuts across your programs.',
  },
  {
    id: 'student-lifecycle-ai',
    name: 'Student Lifecycle AI',
    icon: 'fa-solid fa-robot',
    path: '/ai-assistants',
    color: '#8B5CF6',
    requiresRole: true,
    description: 'AI assistants for admissions, financial aid, registrar, student success, and workflows.',
  },
  {
    id: 'ai-chatbots-messaging',
    name: 'AI Chatbots & Messaging',
    icon: 'fa-solid fa-comments',
    path: '/ai-assistants/assistant',
    color: '#8B5CF6',
    requiresRole: true,
    description: '24/7 student-facing chatbot and messaging powered by Ivy & Ocelot.',
  },
  {
    id: 'engagement-hub',
    name: 'Engagement Hub',
    icon: 'fa-solid fa-users',
    path: '/community',
    color: '#7C3AED',
    poweredBy: 'Platform',
    description: 'Community and alumni engagement — events, volunteering, mentoring, groups, and messaging. Includes: Graduway & Athlete Network.',
  },
  {
    id: 'advancement-philanthropy',
    name: 'Advancement & Philanthropy',
    icon: 'fa-solid fa-gift',
    path: '/advancement',
    color: '#DC2626',
    poweredBy: 'Platform',
    description: 'Fundraising and annual giving — giving forms, campaigns, appeals, Giving Day, recurring gifts, stewardship, and fundraising ambassadors. Includes: Advance, Raise, Gratavid.',
  },
  {
    id: 'career-services',
    name: 'Career Services',
    icon: 'fa-solid fa-briefcase',
    path: '/career',
    color: '#00B8D9',
    poweredBy: ['AI Career Hub', 'Graduway', 'Athlete Network'],
    description: 'Career Hub for students and alumni – jobs, internships, and employer recruiting.',
  },
  {
    id: 'insights',
    name: 'Insights',
    icon: 'fa-solid fa-chart-bar',
    path: '/data',
    color: '#059669',
    poweredBy: 'Platform',
    description: 'Reporting and data across all products.',
  },
  {
    id: 'admin-settings',
    name: 'Admin & Settings',
    icon: 'fa-solid fa-shield',
    path: '/admin',
    color: '#059669',
    poweredBy: 'Platform',
    description: 'Organization, users & permissions, AI policies, and platform configuration.',
  },
];

// SIM Apps - grouped list with section header
const simApps: AppItem[] = [
  {
    id: 'banner-sis-sim',
    name: 'Banner SIS (SIM)',
    icon: 'fa-solid fa-database',
    path: '/sim/banner-sis',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'colleague-sis-sim',
    name: 'Colleague SIS (SIM)',
    icon: 'fa-solid fa-database',
    path: '/sim/colleague-sis',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'slate-sis-sim',
    name: 'Slate SIS (SIM)',
    icon: 'fa-solid fa-layer-group',
    path: '/sim/slate-sis',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'salesforce-crm-sim',
    name: 'Salesforce CRM (SIM)',
    icon: 'fa-solid fa-cloud',
    path: '/sim/salesforce-crm',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'blackbaud-crm-sim',
    name: 'Blackbaud CRM (SIM)',
    icon: 'fa-solid fa-building',
    path: '/sim/blackbaud-crm',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'canvas-lms-sim',
    name: 'Canvas LMS (SIM)',
    icon: 'fa-solid fa-book',
    path: '/sim/canvas-lms',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
  {
    id: 'blackboard-lms-sim',
    name: 'Blackboard LMS (SIM)',
    icon: 'fa-solid fa-desktop',
    path: '/sim/blackboard-lms',
    color: '#6366F1',
    poweredBy: 'Simulation',
  },
];

// Helper component for rendering app rows
function AppRow({ 
  item, 
  isActive, 
  onSelect 
}: { 
  item: AppItem; 
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors relative group"
    >
      {isActive && (
        <FontAwesomeIcon 
          icon="fa-solid fa-check" 
          className="absolute right-3 h-4 w-4 text-primary" 
        />
      )}
      <div 
        className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
        style={{ backgroundColor: `${item.color || '#3B82F6'}15` }}
      >
        <FontAwesomeIcon 
          icon={item.icon}
          className="h-4 w-4"
          style={{ color: item.color || '#3B82F6' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 font-medium block">
          {item.name}
        </span>
        {item.description && (
          <span className="mt-0.5 text-xs text-gray-500 block">
            {item.description}
          </span>
        )}
      </div>
    </div>
  );
}

export function AppSwitcher() {
  const { activeApp, setActiveApp } = usePlatformStore();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const [open, setOpen] = useState(false);

  // Filter main apps based on feature flags and roles
  const visibleMainApps = useMemo(() => {
    return mainApps.filter(item => {
      if (item.requiresRole) {
        return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
      }
      return true;
    });
  }, [aiAssistantsEnabled, user?.email, user?.uid]);

  // SIM Apps don't need filtering, but keep for consistency
  const visibleSimApps = useMemo(() => simApps, []);

  const handleAppSelect = (item: AppItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown first
    setOpen(false);
    
    // Create app object for store
    const app = {
      id: item.id,
      name: item.name,
      shortName: item.name,
      icon: item.icon,
      color: item.color || '#3B82F6',
      path: item.path,
    };
    
    setActiveApp(app);
    
    // Use Next.js router for smooth client-side navigation
    router.push(item.path);
  };

  const getIsActive = (item: AppItem) => {
    return activeApp.id === item.id || 
      (item.id.includes('home') && activeApp.id === 'dashboard') ||
      (item.id === 'student-lifecycle-ai' && activeApp.id === 'ai-assistants') ||
      (item.id === 'ai-chatbots-messaging' && pathname?.startsWith('/ai-assistants/assistant')) ||
      (item.id === 'engagement-hub' && (activeApp.id === 'community' || activeApp.id === 'alumni-engagement' || activeApp.id === 'graduway-community')) ||
      (item.id === 'advancement-philanthropy' && (activeApp.id === 'advancement' || activeApp.id === 'annual-giving' || activeApp.id === 'pipeline-outreach' || activeApp.id === 'stewardship-gratavid')) ||
      (item.id === 'career-services' && (activeApp.id === 'career' || activeApp.id === 'career-hub')) ||
      (item.id === 'insights' && (activeApp.id === 'data' || activeApp.id === 'reporting-analytics')) ||
      (item.id === 'admin-settings' && (activeApp.id === 'admin' || activeApp.id === 'ai-control-center' || activeApp.id === 'settings'));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <FontAwesomeIcon icon="fa-light fa-grid-2" className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-[500px] max-h-[600px] overflow-y-auto bg-white border border-gray-200 shadow-lg"
      >
        <DropdownMenuLabel className="text-gray-900 font-semibold sticky top-0 bg-white z-10 py-3">
          Switch Apps
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="sticky top-[52px] bg-white z-10" />
        
        <div className="px-2 py-2">
          {/* Main apps (no section headers) */}
          <div className="space-y-2">
            {visibleMainApps.map((item) => (
              <AppRow
                key={item.id}
                item={item}
                isActive={getIsActive(item)}
                onSelect={handleAppSelect(item)}
              />
            ))}
          </div>

          {/* SIM Apps section with header */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              SIM Apps
            </div>
            <div className="space-y-2">
              {visibleSimApps.map((item) => (
                <AppRow
                  key={item.id}
                  item={item}
                  isActive={activeApp.id === item.id}
                  onSelect={handleAppSelect(item)}
                />
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
