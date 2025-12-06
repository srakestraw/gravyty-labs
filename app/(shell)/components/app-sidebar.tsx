'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePlatformStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { useAuth } from '@/lib/firebase/auth-context';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';

export function AppSidebar() {
  const { sidebarOpen, activeApp } = usePlatformStore();
  const pathname = usePathname();
  const { user } = useAuth();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if we're in the AI Assistants app
  const isInAIAssistants = pathname?.startsWith('/ai-assistants');

  // Build navigation items - use useMemo to prevent recreation on every render
  const navigation = useMemo(() => {
    // If in AI Assistants app, show sub-navigation
    if (isInAIAssistants) {
      return [
        { name: 'AI Command Center', href: '/ai-assistants', icon: 'fa-solid fa-compass' },
        { name: 'Assistants', href: '/ai-assistants', icon: 'fa-solid fa-user-robot' },
        { name: 'Guardrails', href: '/ai-assistants/guardrails', icon: 'fa-solid fa-shield-halved' },
        { name: 'Eval & Logs', href: '/ai-assistants/eval', icon: 'fa-solid fa-chart-line' },
        { name: 'Templates', href: '/ai-assistants/templates', icon: 'fa-solid fa-file-lines' },
        { name: 'Permissions', href: '/ai-assistants/permissions', icon: 'fa-solid fa-key' },
        { name: 'Settings', href: '/ai-assistants/settings', icon: 'fa-solid fa-cog' },
      ];
    }

    // Otherwise, show main app navigation
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: 'fa-solid fa-house' },
      { name: 'Admissions', href: '/admissions', icon: 'fa-solid fa-clipboard-check' },
      { name: 'SIS', href: '/sis', icon: 'fa-solid fa-graduation-cap' },
      { name: 'AI Teammates', href: '/ai-teammates', icon: 'fa-solid fa-robot' },
    ];

    // Add AI Assistants if enabled and user has access
    if (aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid)) {
      baseNav.push({ name: 'AI Assistants', href: '/ai-assistants', icon: 'fa-solid fa-user-robot' });
    }

    baseNav.push({ name: 'Admin', href: '/admin', icon: 'fa-solid fa-cog' });

    return baseNav;
  }, [isInAIAssistants, aiAssistantsEnabled, user?.email, user?.uid]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => usePlatformStore.getState().toggleSidebar()}
        />
      )}
      
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 z-30 bg-white text-gray-800 border-r border-gray-200 transition-all duration-300',
          // Mobile: overlay behavior
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-16'
        )}
      >
        <nav className="flex flex-col gap-1 p-2">
          {navigation.map((item) => {
            // For AI Assistants sub-navigation, check if pathname matches or starts with href
            // For main navigation, check exact match
            const isActive = isInAIAssistants
              ? (pathname === item.href || (item.href !== '/ai-assistants' && pathname?.startsWith(item.href)))
              : pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-gray-100 text-gray-700',
                  isActive && (isInAIAssistants ? 'bg-purple-50 text-purple-700 font-medium' : 'bg-blue-50 text-primary font-medium')
                )}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (isMobile) {
                    usePlatformStore.getState().toggleSidebar();
                  }
                }}
              >
                <FontAwesomeIcon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
