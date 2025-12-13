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
import { cn } from '@/lib/utils';
import { usePersona, type Persona } from '../contexts/persona-context';
import { getAppRegistry } from '@/lib/apps/registry';
import type { AppDefinition } from '@/lib/apps/types';
import { getActivePillId, isAppActiveInSwitcher } from '@/lib/apps/active';

type AppItem = AppDefinition;

// Helper component for rendering app rows
function AppRow({ 
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
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors relative group"
    >
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
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 font-medium">
            {item.label}
          </span>
          {isActive && (
            <FontAwesomeIcon 
              icon="fa-solid fa-check" 
              className="h-4 w-4 text-primary flex-shrink-0 ml-2" 
            />
          )}
        </div>
        {item.description && (
          <span className="mt-0.5 text-xs text-gray-500 block">
            {item.description}
          </span>
        )}
        {item.pills && item.pills.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                    'inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700 border border-gray-200',
                    'hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 transition-colors',
                    isPillActive && 'bg-gray-100 border-gray-300'
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
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
  const { persona } = usePersona();
  const [open, setOpen] = useState(false);

  // Registry is the single source of truth for the app list/order.
  const registry = useMemo(() => getAppRegistry({ persona }), [persona]);
  const mainApps = useMemo(() => registry.filter(a => a.group !== 'sim'), [registry]);
  const simApps = useMemo(() => registry.filter(a => a.group === 'sim'), [registry]);

  // Filter main apps based on feature flags and roles
  const visibleMainApps = useMemo(() => {
    return mainApps.filter(item => {
      if (item.requiresRole) {
        return aiAssistantsEnabled && canAccessAIAssistants(user?.email || user?.uid);
      }
      return true;
    });
  }, [mainApps, aiAssistantsEnabled, user?.email, user?.uid]);

  // SIM Apps don't need filtering, but keep for consistency
  const visibleSimApps = useMemo(() => simApps, [simApps]);

  const handleAppSelect = (item: AppItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown first
    setOpen(false);
    
    // Create app object for store
    const app = {
      id: item.id,
      name: item.label,
      shortName: item.label,
      icon: item.icon,
      color: item.color || '#3B82F6',
      path: item.href,
    };
    
    setActiveApp(app);
    
    // Use Next.js router for smooth client-side navigation
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
                activePillId={getActivePillId(item, pathname || '')}
                onPillSelect={(e, pill) => handlePillSelect(item, pill)(e)}
              />
            ))}
          </div>

          {/* SIM Apps section with header */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              {persona === 'higher-ed' ? 'SIM Apps' : 'Connected Systems (SIM Apps)'}
            </div>
            <div className="space-y-2">
              {visibleSimApps.map((item) => (
                <AppRow
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
