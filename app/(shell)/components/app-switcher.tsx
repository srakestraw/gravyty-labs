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

interface AppItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  color?: string;
  requiresRole?: boolean;
  poweredBy?: string | string[];
}

interface AppSection {
  title: string;
  items: AppItem[];
  subsection?: {
    title: string;
    items: AppItem[];
  };
}

const appSections: AppSection[] = [
  {
    title: 'HOME',
    items: [
      {
        id: 'home',
        name: 'Home',
        icon: 'fa-solid fa-house',
        path: '/dashboard',
        color: '#3B82F6',
        poweredBy: 'Platform',
      },
    ],
  },
  {
    title: 'AI ASSISTANTS',
    items: [
      {
        id: 'ai-chatbot-messaging',
        name: 'AI Chatbot & Messaging (Ivy & Ocelot)',
        icon: 'fa-solid fa-message',
        path: '/ai-assistants',
        color: '#8B5CF6',
        requiresRole: true,
        poweredBy: ['Ivy', 'Ocelot'],
      },
      {
        id: 'admissions-ai',
        name: 'Admissions AI',
        icon: 'fa-solid fa-graduation-cap',
        path: '/ai-assistants?role=admissions',
        color: '#8B5CF6',
        requiresRole: true,
        poweredBy: ['Ivy', 'Ocelot'],
      },
      {
        id: 'registrar-ai',
        name: 'Registrar AI',
        icon: 'fa-solid fa-book-open',
        path: '/ai-assistants?role=registrar',
        color: '#8B5CF6',
        requiresRole: true,
        poweredBy: ['Ivy', 'Ocelot'],
      },
      {
        id: 'financial-aid-ai',
        name: 'Financial Aid AI',
        icon: 'fa-solid fa-wallet',
        path: '/ai-assistants?role=financial-aid',
        color: '#8B5CF6',
        requiresRole: true,
        poweredBy: ['Ivy', 'Ocelot'],
      },
      {
        id: 'student-success-ai',
        name: 'Student Success AI',
        icon: 'fa-solid fa-arrow-trend-up',
        path: '/ai-assistants?role=student-success',
        color: '#8B5CF6',
        requiresRole: true,
        poweredBy: ['Ivy', 'Ocelot'],
      },
    ],
  },
  {
    title: 'CAREER SERVICES',
    items: [
      {
        id: 'career-hub',
        name: 'Career Hub',
        icon: 'fa-solid fa-briefcase',
        path: '/career-hub',
        color: '#00B8D9',
        poweredBy: ['AI Career Hub', 'Graduway', 'Athlete Network'],
      },
      {
        id: 'employers-recruiting',
        name: 'Employers & Recruiting',
        icon: 'fa-solid fa-users',
        path: '/employers-recruiting',
        color: '#00B8D9',
        poweredBy: ['AI Career Hub', 'Athlete Network'],
      },
    ],
  },
  {
    title: 'COMMUNITY ENGAGEMENT',
    items: [
      {
        id: 'alumni-engagement',
        name: 'Alumni Engagement (Graduway)',
        icon: 'fa-solid fa-users',
        path: '/alumni-engagement',
        color: '#7C3AED',
        poweredBy: 'Graduway',
      },
      {
        id: 'graduway-community',
        name: 'Graduway Community',
        icon: 'fa-solid fa-layer-group',
        path: '/graduway-community',
        color: '#7C3AED',
        poweredBy: 'Graduway',
      },
      {
        id: 'athlete-network',
        name: 'Athlete Network',
        icon: 'fa-solid fa-dumbbell',
        path: '/athlete-network',
        color: '#7C3AED',
        poweredBy: 'Athlete Network',
      },
    ],
  },
  {
    title: 'ADVANCEMENT',
    items: [
      {
        id: 'annual-giving',
        name: 'Annual Giving (Advance)',
        icon: 'fa-solid fa-gift',
        path: '/annual-giving',
        color: '#DC2626',
        poweredBy: 'Advance',
      },
      {
        id: 'pipeline-outreach',
        name: 'Pipeline Outreach (Raise)',
        icon: 'fa-solid fa-paper-plane',
        path: '/pipeline-outreach',
        color: '#DC2626',
        poweredBy: 'Raise',
      },
      {
        id: 'stewardship-gratavid',
        name: 'Stewardship (Gratavid)',
        icon: 'fa-solid fa-video',
        path: '/stewardship-gratavid',
        color: '#DC2626',
        poweredBy: 'Gratavid',
      },
    ],
  },
  {
    title: 'INSIGHTS & PLATFORM',
    items: [
      {
        id: 'reporting-analytics',
        name: 'Reporting & Analytics',
        icon: 'fa-solid fa-chart-bar',
        path: '/reporting-analytics',
        color: '#059669',
        poweredBy: 'Gravyty Data Cloud',
      },
      {
        id: 'integrations',
        name: 'Data',
        icon: 'fa-solid fa-database',
        path: '/integrations',
        color: '#059669',
        poweredBy: 'Integrations Layer',
      },
      {
        id: 'ai-control-center',
        name: 'AI Control Center',
        icon: 'fa-solid fa-shield',
        path: '/ai-assistants',
        color: '#059669',
        poweredBy: 'Platform',
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: 'fa-solid fa-cog',
        path: '/settings',
        color: '#059669',
        poweredBy: 'Platform',
      },
    ],
  },
  {
    title: 'SIM APPS',
    items: [
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
    ],
  },
];

export function AppSwitcher() {
  const { activeApp, setActiveApp } = usePlatformStore();
  const { user } = useAuth();
  const router = useRouter();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const [open, setOpen] = useState(false);

  // Filter sections and items based on feature flags and roles
  const visibleSections = useMemo(() => {
    return appSections.map(section => {
      const filteredItems = section.items.filter(item => {
        if (item.requiresRole) {
          return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
        }
        return true;
      });

      const filteredSubsection = section.subsection ? {
        ...section.subsection,
        items: section.subsection.items.filter(item => {
          if (item.requiresRole) {
            return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
          }
          return true;
        }),
      } : undefined;

      return {
        ...section,
        items: filteredItems,
        subsection: filteredSubsection,
      };
    }).filter(section => 
      section.items.length > 0 || (section.subsection && section.subsection.items.length > 0)
    );
  }, [aiAssistantsEnabled, user?.email, user?.uid]);

  const handleAppSelect = (item: AppItem, e: React.MouseEvent) => {
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
          {visibleSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-4 last:mb-0">
              {/* Section Header */}
              <div className="px-2 py-1.5 mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>

              {/* Subsection (AI Assistants under Insights & Platform) */}
              {section.subsection && section.subsection.items.length > 0 && (
                <div className="ml-2 mb-2">
                  <div className="px-2 py-1 mb-1">
                    <h4 className="text-xs font-medium text-gray-600">
                      {section.subsection.title}
                    </h4>
                  </div>
                  <div className="space-y-0.5">
                    {section.subsection.items.map((item) => {
                      const isActive = activeApp.id === item.id || 
                        (item.id.includes('ai') && activeApp.id === 'ai-assistants');
                      
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => handleAppSelect(item, e)}
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
                          <span className="text-sm text-gray-700 font-medium flex-1">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeApp.id === item.id || 
                    (item.id.includes('home') && activeApp.id === 'dashboard');
                  
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => handleAppSelect(item, e)}
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
                      <span className="text-sm text-gray-700 font-medium flex-1">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Separator between sections (except last) */}
              {sectionIndex < visibleSections.length - 1 && (
                <div className="mt-4 mb-2">
                  <DropdownMenuSeparator />
                </div>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
