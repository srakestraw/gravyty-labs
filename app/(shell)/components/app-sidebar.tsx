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
import { useQueueAttentionCount } from '@/lib/agent-ops/useQueueAttentionCount';
import { usePersona, type Persona } from '../contexts/persona-context';
import { getAppRegistry } from '@/lib/apps/registry';
import { getActiveAppId } from '@/lib/apps/active';
import type { NavSection } from '@/lib/apps/types';
import { getAppNav as getAiAssistantsNav } from '../ai-assistants/_nav';
import { getAppNav as getAdminNav } from '../admin/_nav';
import { getAppNav as getAdvancementNav } from '../advancement/_nav';
import { getAppNav as getCommunityNav } from '../community/_nav';
import { getAppNav as getDataNav } from '../data/_nav';
import { getAppNav as getSimAppsNav } from '../sim-apps/_nav';
import { getAppNav as getStudentLifecycleNav } from '../student-lifecycle/_nav';
import { isValidWorkspace, getWorkspaceConfig, type WorkingMode } from '../student-lifecycle/lib/workspaces';
import { useWorkspaceMode } from '@/lib/hooks/useWorkspaceMode';

type NavItem = { name: string; href: string; icon: string; id?: string; external?: boolean };

// Sidebar navigation - persona-aware function
// Higher Ed persona keeps all existing labels exactly as they were
// Only NPO persona uses different labels
function getSidebarNav(persona: Persona): NavItem[] {
  const isHigherEd = persona === 'higher-ed';

  return [
    { name: 'Dashboard', href: '/dashboard', icon: 'fa-solid fa-house' },
    {
      name: isHigherEd ? 'Student Lifecycle AI' : 'Supporter Lifecycle AI',
      href: '/ai-assistants',
      icon: 'fa-solid fa-robot',
    },
    { name: 'AI Chatbots & Messaging', href: '/ai-assistants/assistant', icon: 'fa-solid fa-comments' },
    {
      name: isHigherEd ? 'Engagement Hub' : 'Community Engagement',
      href: '/community',
      icon: 'fa-solid fa-users',
    },
    {
      name: isHigherEd ? 'Advancement & Philanthropy' : 'Development & Fundraising',
      href: '/advancement',
      icon: 'fa-solid fa-gift',
    },
    { name: 'Career Services', href: '/career', icon: 'fa-solid fa-briefcase' },
    { name: 'Insights', href: '/data', icon: 'fa-solid fa-chart-bar' },
    // Data and Audiences
    { name: 'Contacts', href: '/contacts', icon: 'fa-solid fa-users' },
    { name: 'Segments', href: '/segments', icon: 'fa-solid fa-filter' },
    { name: 'Admin & Settings', href: '/admin', icon: 'fa-solid fa-shield' },
    {
      name: isHigherEd ? 'SIM Apps' : 'Connected Systems (SIM Apps)',
      href: '/sim-apps',
      icon: 'fa-solid fa-th',
    },
  ];
}

export function AppSidebar() {
  const { sidebarOpen, activeApp } = usePlatformStore();
  const pathname = usePathname();
  const { user } = useAuth();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const { persona } = usePersona();
  const [isMobile, setIsMobile] = useState(false);
  const queueAttentionCount = useQueueAttentionCount();
  const queueDisplayCount = queueAttentionCount > 99 ? '99+' : queueAttentionCount.toString();

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
  // Check if we're in the Admin app
  const isInAdmin = pathname?.startsWith('/admin');
  // Check if we're in the Advancement app
  const isInAdvancement = pathname?.startsWith('/advancement');
  // Check if we're in the Student Lifecycle app
  const isInStudentLifecycle = pathname?.startsWith('/student-lifecycle');
  // Check if we're in the Community/Engagement Hub app
  const isInCommunity = pathname?.startsWith('/community');

  // Extract workspace ID from pathname for Student Lifecycle
  const workspaceId = useMemo(() => {
    if (!isInStudentLifecycle || !pathname) return undefined;
    const match = pathname.match(/^\/student-lifecycle\/([^/]+)/);
    const candidate = match?.[1];
    if (candidate && isValidWorkspace(candidate)) return candidate;
    return undefined;
  }, [isInStudentLifecycle, pathname]);

  // Get workspace config if in Student Lifecycle
  const workspaceConfig = useMemo(() => {
    if (!workspaceId) return undefined;
    try {
      return getWorkspaceConfig(workspaceId);
    } catch {
      return undefined;
    }
  }, [workspaceId]);

  // Working mode hook - only used if selector is enabled
  const { mode: workingMode, setMode: setWorkingMode } = useWorkspaceMode(
    workspaceConfig?.enableWorkingModeSelector ? workspaceId : undefined,
    workspaceConfig?.workingModeDefault || 'operator'
  );

  const appRegistry = useMemo(() => getAppRegistry({ persona }), [persona]);
  const activeRegistryAppId = useMemo(
    () => getActiveAppId(pathname || '', appRegistry),
    [pathname, appRegistry]
  );

  const appNavByAppId: Record<string, (params: { pathname: string }) => { sections: NavSection[] }> = useMemo(
    () => ({
      // AI Assistants area
      'student-lifecycle-ai': getAiAssistantsNav,
      'ai-chatbots-messaging': getAiAssistantsNav,

      // Admin area
      'admin-settings': getAdminNav,

      // Advancement area
      'advancement-philanthropy': getAdvancementNav,

      // These exist but currently have no sidebar sub-nav; keep map for completeness.
      'engagement-hub': getCommunityNav,
      insights: getDataNav,

      // SIM Apps are currently separate links in the sidebar and not part of the switcher registry.
      // Keep for future use if registry grows a /sim-apps entry.
      'sim-apps': getSimAppsNav,

      // Student Lifecycle app boundary
      'student-lifecycle': getStudentLifecycleNav,
    }),
    []
  );

type NavItem = { name: string; href: string; icon: string; id?: string; external?: boolean };

// Reusable Data and audiences navigation group
// Used in Student Lifecycle AI and Advancement & Philanthropy workspaces
// Note: Populations removed from navigation - now used as data-layer concept only
// (filters in Contacts, building blocks in Segments, scope options in Agents/Assistants)
const dataAndAudiencesNav: NavItem[] = [
  { name: 'Contacts', href: '/contacts', icon: 'fa-solid fa-users' },
  { name: 'Segments', href: '/segments', icon: 'fa-solid fa-filter' },
];

type Navigation = 
  | { topLevel: NavItem[]; dataAndAudiences?: NavItem[]; adminTools: NavItem[] }
  | NavItem[];

  // Build navigation items - use useMemo to prevent recreation on every render
  const navigation: Navigation = useMemo(() => {
    // Prefer app-local nav contract when available and non-empty; otherwise fall back to existing behavior.
    const contract = activeRegistryAppId ? appNavByAppId[activeRegistryAppId] : undefined;
    const contractSections = contract ? contract({ pathname: pathname || '' }).sections : [];
    const hasContractItems = contractSections.some((s) => s.items && s.items.length > 0);

    if (hasContractItems) {
      const getItems = (id: string) => contractSections.find((s) => s.id === id)?.items ?? [];
      const aiPlatform = getItems('aiPlatform');
      const topLevel = getItems('topLevel');
      const dataAndAudiences = getItems('dataAndAudiences');
      const adminTools = getItems('adminTools');

      return {
        topLevel: [...aiPlatform, ...topLevel],
        dataAndAudiences: dataAndAudiences.length > 0 ? dataAndAudiences : undefined,
        adminTools,
      };
    }

    // If in Advancement app, show sub-navigation
    // Advancement & Philanthropy workspace includes Data and audiences section
    if (isInAdvancement) {
      return {
        topLevel: [
          { name: 'Overview', href: '/advancement', icon: 'fa-solid fa-gift', id: 'overview' },
          { name: 'Agents', href: '/advancement/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
          { name: 'Queue', href: '/advancement/queue', icon: 'fa-solid fa-list', id: 'queue' },
        ],
        dataAndAudiences: dataAndAudiencesNav,
        adminTools: [],
      };
    }
    
    // If in Admin app, show sub-navigation
    if (isInAdmin) {
      return {
        topLevel: [
          { name: 'Overview', href: '/admin', icon: 'fa-solid fa-shield', id: 'overview' },
        ],
        adminTools: [
          { name: 'Guardrails', href: '/admin/guardrails', icon: 'fa-solid fa-shield-halved' },
          { name: 'Do Not Engage', href: '/admin/do-not-engage', icon: 'fa-solid fa-user-slash' },
          { name: 'Evals', href: '/admin/evals', icon: 'fa-solid fa-chart-line' },
          { name: 'Logs', href: '/admin/logs', icon: 'fa-solid fa-list' },
          { name: 'Voice & Tone', href: '/ai-assistants/voice-and-tone', icon: 'fa-solid fa-comments' },
          { name: 'Permissions', href: '/admin/permissions', icon: 'fa-solid fa-key' },
          { name: 'Settings', href: '/admin/settings', icon: 'fa-solid fa-cog' },
        ],
      };
    }
    
    // If in AI Assistants app, show sub-navigation
    // Student Lifecycle AI workspace includes Data and audiences section
    if (isInAIAssistants) {
      return {
        topLevel: [
          { name: 'AI Command Center', href: '/ai-assistants', icon: 'fa-solid fa-compass', id: 'command-center' },
          { name: 'AI Assistant', href: '/ai-assistants/assistant', icon: 'fa-solid fa-comments', id: 'assistant' },
          { name: 'Agents', href: '/ai-assistants/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
          { name: 'Queue', href: '/ai-assistants/agent-ops/queue', icon: 'fa-solid fa-list', id: 'queue' },
          { name: 'People', href: '/ai-assistants/agent-ops/people', icon: 'fa-solid fa-users', id: 'people' },
        ],
        dataAndAudiences: dataAndAudiencesNav,
        adminTools: [
          { name: 'Guardrails', href: '/admin/guardrails', icon: 'fa-solid fa-shield-halved' },
          { name: 'Do Not Engage', href: '/ai-assistants/do-not-engage', icon: 'fa-solid fa-user-slash' },
          { name: 'Evals', href: '/ai-assistants/evals', icon: 'fa-solid fa-chart-line' },
          { name: 'Logs', href: '/ai-assistants/logs', icon: 'fa-solid fa-list' },
          { name: 'Voice & Tone', href: '/ai-assistants/voice-and-tone', icon: 'fa-solid fa-comments' },
          { name: 'Templates', href: '/ai-assistants/templates', icon: 'fa-solid fa-file-lines' },
          { name: 'Permissions', href: '/ai-assistants/permissions', icon: 'fa-solid fa-key' },
          { name: 'Settings', href: '/ai-assistants/settings', icon: 'fa-solid fa-cog' },
          { name: 'Design System Preview', href: 'https://advance-admin-steel.vercel.app/ai-assistant', icon: 'fa-solid fa-palette', external: true },
        ],
      };
    }

    // Main app navigation - persona-aware
    const baseNav: NavItem[] = getSidebarNav(persona);

    // Filter Student Lifecycle AI and AI Chatbots & Messaging if feature flag is disabled or user doesn't have access
    const filteredNav = baseNav.filter(item => {
      // Check by href instead of name since names may vary by persona
      if (item.href === '/ai-assistants' || item.href === '/ai-assistants/assistant') {
        return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
      }
      return true;
    });

    return filteredNav;
  }, [activeRegistryAppId, appNavByAppId, pathname, isInAIAssistants, isInAdmin, isInAdvancement, isInStudentLifecycle, isInCommunity, aiAssistantsEnabled, user?.email, user?.uid, persona]);

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
        <nav className="flex flex-col gap-1 p-2 h-full">
          {(isInAIAssistants || isInAdmin || isInAdvancement || isInStudentLifecycle || isInCommunity) && !Array.isArray(navigation) ? (
            <>
              {/* Top-level navigation items */}
              {navigation.topLevel.map((item) => {
                // For /ai-assistants, /admin, and /advancement, only exact match. For others, exact match or starts with href + '/'
                const isActive = (item.href === '/ai-assistants' || item.href === '/admin' || item.href === '/advancement')
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-gray-100 text-gray-700',
                      isActive && (isInAdmin ? 'bg-blue-50 text-primary font-medium' : isInAdvancement ? 'bg-red-50 text-red-700 font-medium' : 'bg-purple-50 text-purple-700 font-medium')
                    )}
                    onClick={() => {
                      // Close sidebar on mobile when navigating
                      if (isMobile) {
                        usePlatformStore.getState().toggleSidebar();
                      }
                    }}
                  >
                    <span className="flex items-center gap-3 flex-1 min-w-0">
                      <FontAwesomeIcon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                      {(sidebarOpen || isMobile) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </span>
                    {item.id === 'queue' && queueAttentionCount > 0 && (sidebarOpen || isMobile) && (
                      <span
                        className={cn(
                          'inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-1.5 text-[11px] font-medium flex-shrink-0',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-rose-100 text-rose-700'
                        )}
                      >
                        {queueDisplayCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Data and audiences section - shown in Student Lifecycle AI and Advancement workspaces */}
              {navigation.dataAndAudiences && navigation.dataAndAudiences.length > 0 && (
                <>
                  {(sidebarOpen || isMobile) && (
                    <div className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Data and audiences
                    </div>
                  )}
                  {navigation.dataAndAudiences.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          'hover:bg-gray-100 text-gray-700',
                          isActive && (isInAdmin ? 'bg-blue-50 text-primary font-medium' : isInAdvancement ? 'bg-red-50 text-red-700 font-medium' : 'bg-purple-50 text-purple-700 font-medium')
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
                </>
              )}
              
              {/* Admin Tools section */}
              {(sidebarOpen || isMobile) && (
                <div className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Admin Tools
                </div>
              )}
              
              {navigation.adminTools.map((item) => {
                const isActive = !item.external && (pathname === item.href || pathname?.startsWith(item.href));
                const linkClassName = cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-gray-100 text-gray-700',
                  isActive && (isInAdmin ? 'bg-blue-50 text-primary font-medium' : 'bg-purple-50 text-purple-700 font-medium')
                );
                
                // Handle external links
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
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
                    </a>
                  );
                }
                
                // Handle internal links
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={linkClassName}
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
            </>
          ) : (
            // Main app navigation (non-AI Assistants)
            Array.isArray(navigation) && navigation.map((item) => {
              // Dashboard should only be active on exact match
              // Other routes should be active on exact match or sub-routes
              const isActive = item.href === '/dashboard'
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-gray-100 text-gray-700',
                    isActive && 'bg-blue-50 text-primary font-medium'
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
            })
          )}

          {/* Working Mode Selector - shown only for workspaces that enable it */}
          {workspaceConfig?.enableWorkingModeSelector && (sidebarOpen || isMobile) && (
            <>
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="px-3 mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Working mode
                  </label>
                </div>
                <div className="flex gap-1 px-3">
                  <button
                    onClick={() => setWorkingMode('operator')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      workingMode === 'operator'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Operator
                  </button>
                  <button
                    onClick={() => setWorkingMode('leadership')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      workingMode === 'leadership'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Leadership
                  </button>
                </div>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
