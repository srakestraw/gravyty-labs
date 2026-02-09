'use client';

import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePlatformStore } from '@/lib/store';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { useAuth } from '@/lib/firebase/auth-context';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';
import { cn } from '@/lib/utils';
import { usePersona } from '../contexts/persona-context';
import { getAppRegistry } from '@/lib/apps/registry';
import type { AppDefinition } from '@/lib/apps/types';
import { getActivePillId, isAppActiveInSwitcher } from '@/lib/apps/active';

type AppItem = AppDefinition;

// Main app card component
function MainAppCard({ 
  item, 
  isActive, 
  onSelect,
  activePillId,
  onPillSelect,
}: { 
  item: AppItem; 
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
  activePillId?: string | null;
  onPillSelect?: (e: React.MouseEvent, pill: { id: string; label: string; href: string }) => void;
}) {
  const useTwoColumnPills = item.id === 'student-lifecycle';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex flex-col gap-3 p-4 rounded-lg border bg-white cursor-pointer transition-all',
        'hover:border-gray-300 hover:shadow-sm',
        isActive
          ? 'border-primary/40 ring-1 ring-primary/30 bg-primary/[0.04]'
          : 'border-gray-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${item.color || '#3B82F6'}15` }}
        >
          <FontAwesomeIcon 
            icon={item.icon || 'fa-solid fa-circle'}
            className="h-6 w-6"
            style={{ color: item.color || '#3B82F6' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">
            {item.label}
          </h3>
          {item.description && (
            <p className="mt-0.5 text-sm text-gray-600 truncate" title={item.description}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      {item.pills && item.pills.length > 0 && (
        <div className="mt-1.5 pt-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            Workspaces
          </p>
          <div
            className={cn(
              useTwoColumnPills
                ? 'grid grid-cols-2 gap-x-4 gap-y-0 items-start'
                : 'flex flex-col gap-0'
            )}
          >
            {item.pills.map((pill) => {
              const isPillActive = !!activePillId && activePillId === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPillSelect?.(e, pill);
                  }}
                  className={cn(
                    'group/pill flex items-center justify-between w-full min-h-[2rem] py-1.5 text-sm text-gray-700 rounded-md -mx-0.5 px-0.5 text-left',
                    'hover:bg-gray-100/80 hover:text-gray-900 transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                    isPillActive && 'font-semibold text-gray-900'
                  )}
                >
                  <span className="truncate whitespace-nowrap">{pill.label}</span>
                  <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3 flex-shrink-0 opacity-0 group-hover/pill:opacity-100 group-hover:opacity-100 transition-opacity ml-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// SIM app card component (simpler, for sidebar)
function SimAppCard({ 
  item, 
  isActive, 
  onSelect,
}: { 
  item: AppItem; 
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all w-full"
    >
      <div 
        className="flex items-center justify-center w-16 h-16 rounded-lg"
        style={{ backgroundColor: `${item.color || '#6366F1'}15` }}
      >
        <FontAwesomeIcon 
          icon={item.icon || 'fa-solid fa-circle'}
          className="h-8 w-8"
          style={{ color: item.color || '#6366F1' }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 text-center">
        {item.label}
      </span>
    </button>
  );
}

export function AppSwitcher() {
  const { activeApp, setActiveApp } = usePlatformStore();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');
  const { persona, setPersona } = usePersona();
  const [open, setOpen] = useState(false);

  // Registry is the single source of truth for the app list/order.
  const registry = useMemo(() => getAppRegistry({ persona }), [persona]);
  const mainApps = useMemo(() => registry.filter(a => a.group === 'main' && a.id !== 'admin-settings'), [registry]);
  const simApps = useMemo(() => registry.filter(a => a.group === 'sim'), [registry]);
  const adminApp = useMemo(() => registry.find(a => a.id === 'admin-settings'), [registry]);

  // Filter main apps based on feature flags and roles
  const visibleMainApps = useMemo(() => {
    return mainApps.filter(item => {
      if (item.requiresRole) {
        return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
      }
      return true;
    });
  }, [mainApps, aiAssistantsEnabled, user?.email, user?.uid]);

  // Split apps into two columns: Column 1 task order, Column 2 alphabetical
  const column1Apps = useMemo(() => {
    const order = ['home', 'insights', 'ai-chatbots-messaging', 'student-lifecycle'];
    return visibleMainApps
      .filter(item => order.includes(item.id))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [visibleMainApps]);

  const column2Apps = useMemo(() => {
    const column2Ids = ['advancement-philanthropy', 'career-services', 'engagement-hub'];
    return visibleMainApps
      .filter(item => column2Ids.includes(item.id))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [visibleMainApps]);

  // SIM Apps don't need filtering
  const visibleSimApps = useMemo(() => simApps, [simApps]);

  // Close on ESC key and prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleAppSelect = (item: AppItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setOpen(false);
    
    const app = {
      id: item.id,
      name: item.label,
      shortName: item.label,
      icon: item.icon,
      color: item.color || '#3B82F6',
      path: item.href,
    };
    
    setActiveApp(app);
    router.push(item.href);
  };

  const handlePillSelect =
    (appItem: AppItem, pill: { id: string; label: string; href: string }) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setOpen(false);

      const app = {
        id: appItem.id,
        name: appItem.label,
        shortName: appItem.label,
        icon: appItem.icon,
        color: appItem.color || '#3B82F6',
        path: appItem.href,
      };

      setActiveApp(app);
      router.push(pill.href);
    };

  const getIsActive = (item: AppItem) =>
    isAppActiveInSwitcher({ app: item, activeAppId: activeApp.id, pathname });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <FontAwesomeIcon icon="fa-light fa-grid-2" className="h-5 w-5" />
      </Button>
    );
  }

  const modalContent = open ? (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={() => setOpen(false)}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with persona tabs and close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPersona('higher-ed')}
                className={cn(
                  'px-0 py-2 text-sm font-medium border-b-2 transition-colors',
                  persona === 'higher-ed'
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                Higher Ed
              </button>
              <button
                type="button"
                onClick={() => setPersona('nonprofit')}
                className={cn(
                  'px-0 py-2 text-sm font-medium border-b-2 transition-colors',
                  persona === 'nonprofit'
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                Nonprofit
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Switch Apps</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" className="h-5 w-5" />
            </Button>
          </div>

          {/* Main content — no scroll at 1280x800 / 1440x900 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 lg:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Column 1 */}
                <div className="flex flex-col gap-3 min-w-0">
                  {column1Apps.map((item) => (
                    <MainAppCard
                      key={item.id}
                      item={item}
                      isActive={getIsActive(item)}
                      onSelect={handleAppSelect(item)}
                      activePillId={getActivePillId(item, pathname || '')}
                      onPillSelect={(e, pill) => handlePillSelect(item, pill)(e)}
                    />
                  ))}
                </div>
                {/* Column 2 */}
                <div className="flex flex-col gap-3 min-w-0">
                  {column2Apps.map((item) => (
                    <MainAppCard
                      key={item.id}
                      item={item}
                      isActive={getIsActive(item)}
                      onSelect={handleAppSelect(item)}
                      activePillId={getActivePillId(item, pathname || '')}
                      onPillSelect={(e, pill) => handlePillSelect(item, pill)(e)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: SIM Apps (left) and Admin & Settings (right) */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/sim-apps');
              }}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FontAwesomeIcon icon="fa-solid fa-grid-2" className="h-4 w-4" />
              <span>SIM Apps</span>
            </button>
            {adminApp && (
              <button
                onClick={handleAppSelect(adminApp)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon="fa-solid fa-gear" className="h-4 w-4" />
                <span>{adminApp.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <FontAwesomeIcon icon="fa-light fa-grid-2" className="h-5 w-5" />
      </Button>
      {open && createPortal(modalContent, document.body)}
    </>
  );
}
