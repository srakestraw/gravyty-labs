'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClientSearchParams } from '@/lib/hooks/useClientSearchParams';
import { AgentOpsFilters, AgentOpsItem } from '@/lib/agent-ops/types';
import { dataClient } from '@/lib/data';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { QueueList, type QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import { QueueDetail } from '@/components/ai-assistants/agent-ops/queue/QueueDetail';
import { ShortcutFooter } from '@/components/ai-assistants/agent-ops/queue/ShortcutFooter';
import { useHotkeys } from '@/lib/hooks/useHotkeys';
import { cn } from '@/lib/utils';
import { getSegmentFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { GamePlanPanel } from '@/components/shared/ai-platform/GamePlanPanel';
import { GamePlanItemsLane } from '@/components/shared/ai-platform/GamePlanItemsLane';
import { FocusModePage } from '@/components/shared/ai-platform/FocusModePage';

interface QueuePageClientProps {
  basePath?: string;
  defaultFilters?: Partial<AgentOpsFilters>;
  activeSegmentId?: string;
  activeSegment?: import('@/components/shared/ai-platform/segments/types').SegmentDefinition;
  workspaceId?: string;
}

function applyActionToItem(item: AgentOpsItem, action: QueueAction): AgentOpsItem {
  switch (action) {
    case 'resolve':
      return { ...item, status: 'Resolved' };
    case 'snooze':
      return { ...item, status: 'Snoozed' };
    case 'hold':
      return { ...item, status: 'InProgress' };
    case 'unsnooze':
      return { ...item, status: 'Open' };
    case 'reopen':
      return { ...item, status: 'Open' };
    case 'assign':
    case 'extendSnooze':
      // These actions don't change status directly
      return item;
    default:
      return item;
  }
}

// Helper function to check if an item matches an objective (matches provider logic)
function itemMatchesObjective(item: AgentOpsItem, objectiveId: string): boolean {
  const tags = item.tags || [];
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  switch (objectiveId) {
    case 'stalled-applicants':
      return (
        tags.some(tag => 
          ['stalled', 'inactive', 'no-activity', 'incomplete-app', 'incomplete-application'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stalled') ||
        titleLower.includes('incomplete') ||
        summaryLower.includes('stalled') ||
        summaryLower.includes('no activity')
      );
    
    case 'missing-documents':
      return (
        tags.some(tag => 
          ['missing-transcript', 'missing-docs', 'verification', 'recommendation-letter', 'transcript', 'missing'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('missing') ||
        titleLower.includes('transcript') ||
        titleLower.includes('document') ||
        summaryLower.includes('missing') ||
        summaryLower.includes('transcript')
      );
    
    case 'melt-risk':
      return (
        tags.some(tag => 
          ['melt-risk', 'deposit-window', 'admitted-no-deposit', 'high-intent', 'deposit'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('melt') ||
        titleLower.includes('deposit') ||
        titleLower.includes('admitted') ||
        summaryLower.includes('melt') ||
        summaryLower.includes('deposit')
      );
    
    default:
      return false;
  }
}

export function QueuePageClient({ basePath = '/ai-assistants', defaultFilters, activeSegmentId, activeSegment, workspaceId }: QueuePageClientProps) {
  const router = useRouter();
  const searchParams = useClientSearchParams();
  const [allItems, setAllItems] = useState<AgentOpsItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  
  // Game Plan state
  const [gamePlanData, setGamePlanData] = useState<{
    objectives: Array<{ id: string; title: string; shortTitle?: string; description?: string; impactText?: string }>;
    completedCount: number;
    totalCount: number;
  } | null>(null);
  const [gamePlanCounts, setGamePlanCounts] = useState<Record<string, number>>({});
  const [gamePlanItems, setGamePlanItems] = useState<AgentOpsItem[]>([]);
  const [isLoadingGamePlan, setIsLoadingGamePlan] = useState(true);
  
  // Get active objective from URL
  const activeObjectiveId = useMemo(() => {
    const objective = searchParams.get('objective');
    return objective || null;
  }, [searchParams]);
  
  // Focus Mode state management - use focus=1 (not focus=true)
  const isFocusMode = useMemo(() => {
    const focusParam = searchParams.get('focus');
    return focusParam === '1';
  }, [searchParams]);
  
  // Focus Mode toggle handlers (independent of Game Plan)
  const handleEnterFocusMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('focus', '1');
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };
  
  const handleExitFocusMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('focus');
    // Preserve all other params (including objective, filters, etc.)
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Detect active segment: prefer props, then URL param
  const segment = useMemo(() => {
    if (activeSegment) return activeSegment;
    if (activeSegmentId) {
      const { getSegmentById } = require('@/components/shared/ai-platform/segments/mock-data');
      return getSegmentById(activeSegmentId);
    }
    return getSegmentFromSearchParams(Object.fromEntries(searchParams.entries()));
  }, [activeSegment, activeSegmentId, searchParams]);
  
  // Load queue items
  useEffect(() => {
    const loadItems = async () => {
      setIsLoadingItems(true);
      try {
        const ctx = {
          workspace: workspaceId || undefined,
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        const items = await dataClient.listQueueItems(ctx);
        setAllItems(items);
      } catch (error) {
        console.error('Failed to load queue items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    loadItems();
  }, [workspaceId]);
  
  // Load game plan data (only for admissions workspace)
  const [objectiveCompletionStatus, setObjectiveCompletionStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const loadGamePlan = async () => {
      if (workspaceId !== 'admissions') {
        setIsLoadingGamePlan(false);
        return;
      }
      
      setIsLoadingGamePlan(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        
        const [gamePlan, counts, operatorGamePlan] = await Promise.all([
          dataClient.getAdmissionsTeamGamePlan(ctx),
          dataClient.getAdmissionsQueueGamePlanCounts(ctx),
          dataClient.getAdmissionsOperatorGamePlan(ctx), // Get full game plan for completion status
        ]);
        
        if (gamePlan) {
          setGamePlanData({
            objectives: gamePlan.objectives,
            completedCount: gamePlan.completedCount,
            totalCount: gamePlan.totalCount,
          });
          setGamePlanCounts(counts);
          
          // Extract completion status from operator game plan items
          if (operatorGamePlan) {
            const completionMap: Record<string, boolean> = {};
            operatorGamePlan.items.forEach((item) => {
              completionMap[item.id] = item.status === 'completed';
            });
            setObjectiveCompletionStatus(completionMap);
          }
        }
      } catch (error) {
        console.error('Failed to load game plan:', error);
      } finally {
        setIsLoadingGamePlan(false);
      }
    };
    
    loadGamePlan();
  }, [workspaceId]);
  
  // Load game plan items when objective is active
  useEffect(() => {
    const loadGamePlanItems = async () => {
      if (!activeObjectiveId || workspaceId !== 'admissions') {
        setGamePlanItems([]);
        return;
      }
      
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
          mode: 'team' as const,
        };
        
        const items = await dataClient.getAdmissionsQueueItemsByObjective(ctx, activeObjectiveId, 10);
        setGamePlanItems(items);
      } catch (error) {
        console.error('Failed to load game plan items:', error);
        setGamePlanItems([]);
      }
    };
    
    loadGamePlanItems();
  }, [activeObjectiveId, workspaceId]);

  // Clear segment from URL
  const handleClearSegment = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('segment');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Handle game plan objective apply/clear
  const handleApplyObjective = (objectiveId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('objective', objectiveId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };
  
  const handleClearObjective = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('objective');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };
  
  // Initialize filters with defaults if provided
  const getInitialFilters = (): AgentOpsFilters => {
    const baseFilters: AgentOpsFilters = {
      role: 'All',
      status: 'All',
      type: 'All',
      severity: 'All',
      assignee: 'All',
      search: '',
    };
    
    if (defaultFilters) {
      return { ...baseFilters, ...defaultFilters };
    }
    
    return baseFilters;
  };
  
  const [filters, setFilters] = useState<AgentOpsFilters>(getInitialFilters);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const defaultsAppliedRef = useRef(false);
  
  // Apply defaults only once on mount
  useEffect(() => {
    if (!defaultsAppliedRef.current && defaultFilters) {
      defaultsAppliedRef.current = true;
      setFilters((prev) => ({ ...prev, ...defaultFilters }));
    }
  }, [defaultFilters]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // If an objective is active, filter to only show items matching that objective
    if (activeObjectiveId && workspaceId === 'admissions') {
      items = items.filter((item) => itemMatchesObjective(item, activeObjectiveId));
    }
    
    // Apply standard filters
    return items.filter((item) => {
      if (filters.role !== 'All' && item.role !== filters.role) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;
      if (filters.type !== 'All' && item.type !== filters.type) return false;
      if (filters.severity !== 'All' && item.severity !== filters.severity) return false;
      if (filters.assignee === 'Me' && item.assignedTo !== 'user-123') return false;
      if (filters.assignee === 'Unassigned' && item.assignedTo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.title.toLowerCase().includes(searchLower) &&
          !item.summary.toLowerCase().includes(searchLower) &&
          !item.person?.name.toLowerCase().includes(searchLower) &&
          !item.agentName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, filters, activeObjectiveId, workspaceId]);

  const selectedIndex = filteredItems.findIndex((i) => i.id === selectedItemId);
  const selectedItem = selectedIndex >= 0 ? filteredItems[selectedIndex] : filteredItems[0] ?? null;

  // Ensure something is selected once data loads
  useEffect(() => {
    if (!selectedItemId && filteredItems.length > 0) {
      setSelectedItemId(filteredItems[0].id);
    } else if (selectedItemId && !filteredItems.find((i) => i.id === selectedItemId)) {
      // Selected item is no longer in filtered set, select first item
      if (filteredItems.length > 0) {
        setSelectedItemId(filteredItems[0].id);
      } else {
        setSelectedItemId(null);
      }
    }
  }, [filteredItems, selectedItemId]);

  const handleNavigateToPerson = (personId: string) => {
    router.push(`${basePath}/agent-ops/people?id=${personId}`);
  };

  const handleNavigateToAgent = (agentId: string) => {
    router.push(`${basePath}/agents/${agentId}`);
  };

  // Unified action handler with optimistic updates and auto-advance
  const handleItemAction = async (id: string, action: QueueAction) => {
    // Find current index before update
    const currentIndex = filteredItems.findIndex((i) => i.id === id);

    // Optimistic UI update
    setAllItems((current) =>
      current.map((item) => (item.id === id ? applyActionToItem(item, action) : item))
    );

    // TODO: Call API to persist the action
    console.log(`Action ${action} on item:`, id);

    // Auto-advance to next item after resolve, snooze, or hold
    if (action === 'resolve' || action === 'snooze' || action === 'hold') {
      setTimeout(() => {
        // After state update, find next item in filtered list
        // Note: filteredItems will update on next render, so we advance based on current index
        if (currentIndex >= 0 && filteredItems.length > 0) {
          const nextIndex = (currentIndex + 1) % filteredItems.length;
          const next = filteredItems[nextIndex];
          if (next) {
            setSelectedItemId(next.id);
          } else if (filteredItems.length > 0) {
            // If we were at the last item, wrap to first
            setSelectedItemId(filteredItems[0].id);
          }
        }
      }, 100);
    }
  };

  const handleNextItem = () => {
    if (filteredItems.length === 0) return;
    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    const next = filteredItems[nextIndex];
    if (next) setSelectedItemId(next.id);
  };

  const handlePrevItem = () => {
    if (filteredItems.length === 0) return;
    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    const prev = filteredItems[prevIndex];
    if (prev) setSelectedItemId(prev.id);
  };

  // Keyboard shortcuts with auto-advance
  useHotkeys(
    {
      j: () => {
        handleNextItem();
      },
      k: () => {
        handlePrevItem();
      },
      e: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'resolve');
        }
      },
      s: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'snooze');
        }
      },
      h: () => {
        if (selectedItem) {
          handleItemAction(selectedItem.id, 'hold');
        }
      },
    },
    true
  );

  // Render queue content (same in both focus and unfocused modes)
  const renderQueueContent = () => (
    <div className="grid gap-3 flex-1 min-h-0 md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
      {/* Left: Queue List */}
      <section 
        className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        style={{ height: 'calc(100vh - 14rem)' }}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Game Plan Items Lane (when objective is active) */}
          {activeObjectiveId && workspaceId === 'admissions' && gamePlanItems.length > 0 && (
            <div className="px-2 pt-2">
              <GamePlanItemsLane
                items={gamePlanItems}
                selectedItemId={selectedItem?.id ?? null}
                onSelectItem={(id) => {
                  setSelectedItemId(id);
                }}
                onItemAction={handleItemAction}
              />
            </div>
          )}
          
          {/* Main Queue List */}
          <QueueList
            items={filteredItems}
            selectedItemId={selectedItem?.id ?? null}
            onSelectItem={(id) => {
              setSelectedItemId(id);
            }}
            onEnterFocusMode={() => {}}
            onItemAction={handleItemAction}
          />
        </div>
      </section>

      {/* Right: Detail Panel */}
      <section className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
        {selectedItem ? (
          <QueueDetail
            item={selectedItem}
            focusMode={false}
            onExitFocusMode={() => {}}
            onNext={handleNextItem}
            onPrev={handlePrevItem}
            onAction={handleItemAction}
            onNavigateToPerson={handleNavigateToPerson}
            onNavigateToAgent={handleNavigateToAgent}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px] p-12">
            <div className="text-center">
              <p className="text-sm text-gray-500">Select an item to view details</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  // Render page content (same structure in both modes)
  const renderPageContent = () => (
    <div className="relative flex flex-col h-full pb-16">
      {/* Segment Banner */}
      {segment && (
        <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon="fa-solid fa-filter" className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">
                Queue scoped to segment: <span className="font-semibold text-blue-900">{segment.title}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSegment}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              Clear segment
            </Button>
          </div>
        </div>
      )}

      {/* Page Header with Focus Mode Toggle */}
      <div className="flex-shrink-0 space-y-3 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Agent Ops — Queue</h1>
            <p className="text-sm text-gray-600 mt-1">
              All items that require attention across your agent ecosystem. Filter, triage, and resolve issues in real time.
            </p>
          </div>
          {/* Focus Mode Toggle Button (Admissions only) */}
          {workspaceId === 'admissions' && (
            <Button
              variant={isFocusMode ? "default" : "outline"}
              size="sm"
              onClick={isFocusMode ? handleExitFocusMode : handleEnterFocusMode}
              className={cn(
                isFocusMode && "bg-indigo-600 hover:bg-indigo-700 text-white"
              )}
            >
              <FontAwesomeIcon 
                icon={isFocusMode ? "fa-solid fa-compress" : "fa-solid fa-expand"} 
                className="h-3 w-3 mr-1.5" 
              />
              Focus mode
            </Button>
          )}
        </div>
        
        {/* Game Plan Panel (Admissions only) - always visible */}
        {workspaceId === 'admissions' && !isLoadingGamePlan && gamePlanData && (
          <GamePlanPanel
            objectives={gamePlanData.objectives}
            counts={gamePlanCounts}
            completedCount={gamePlanData.completedCount}
            totalCount={gamePlanData.totalCount}
            activeObjectiveId={activeObjectiveId}
            onApplyObjective={handleApplyObjective}
            onClearObjective={handleClearObjective}
            objectiveCompletionStatus={objectiveCompletionStatus}
          />
        )}
        
        {/* Filters - always show full filters */}
        <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Queue Content */}
      {renderQueueContent()}

      {/* Shortcut Footer */}
      <ShortcutFooter />
    </div>
  );

  // Wrap with FocusModePage for Admissions workspace
  if (workspaceId === 'admissions') {
    return (
      <FocusModePage
        enabled={isFocusMode}
        onExit={handleExitFocusMode}
        hideChrome={{
          header: true,
          sidebar: true,
          workingMode: true,
        }}
        hideHeader={true}
      >
        {renderPageContent()}
      </FocusModePage>
    );
  }

  // Non-Admissions workspace: standard render without Focus Mode
  return renderPageContent();
}

