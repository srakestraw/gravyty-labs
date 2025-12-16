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
  return (
    <div
      onClick={onSelect}
      className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              {item.label}
            </h3>
            {isActive && (
              <FontAwesomeIcon 
                icon="fa-solid fa-check" 
                className="h-4 w-4 text-primary flex-shrink-0" 
              />
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-gray-600">
              {item.description}
            </p>
          )}
        </div>
      </div>
      {item.pills && item.pills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
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
                  'inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 transition-colors',
                  isPillActive && 'font-semibold text-gray-900'
                )}
              >
                {pill.label}
                <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3" />
              </button>
            );
          })}
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
  const { persona } = usePersona();
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
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
              {/* Left: Main apps grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleMainApps.map((item) => (
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

              {/* Right: SIM Apps sidebar */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <div className="lg:sticky lg:top-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Explore SIM Apps
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                    {visibleSimApps.map((item) => (
                      <SimAppCard
                        key={item.id}
                        item={item}
                        isActive={getIsActive(item)}
                        onSelect={handleAppSelect(item)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Admin & Settings */}
          {adminApp && (
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleAppSelect(adminApp)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={adminApp.icon || 'fa-solid fa-gear'} className="h-4 w-4" />
                <span>{adminApp.label}</span>
              </button>
            </div>
          )}
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
