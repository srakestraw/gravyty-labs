'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import { useFeatureFlag } from '@/lib/features';
import { useAgentOpsStream } from './useAgentOpsStream';
import type { AgentOpsStreamEvent } from '@/lib/agent-ops/events/types';
import { ReviewModeShell } from './ReviewModeShell';
import { SplitTabs } from './SplitTabs';
import { ReviewActionBar, type ReviewAction } from './ReviewActionBar';
import { useQueueReviewController } from './useQueueReviewController';
import { getDefaultSplits } from './splits/advancementSplits';
import { useToast } from './useToast';
import { ToastContainer } from './ToastContainer';
import { ReviewModeCoachmark } from './ReviewModeCoachmark';
import { WorkbenchToolbar } from './WorkbenchToolbar';
import { FiltersDrawer } from './FiltersDrawer';
import { ActiveFilterChips } from './ActiveFilterChips';
import { ShortcutsOverlay } from './ShortcutsOverlay';

interface QueuePageClientProps {
  basePath?: string;
  defaultFilters?: Partial<AgentOpsFilters>;
  activeSegmentId?: string;
  activeSegment?: import('@/components/shared/ai-platform/segments/types').SegmentDefinition;
  workspaceId?: string;
}

export interface QueueActionPayload {
  until?: string;       // ISO date for snooze
  assigneeId?: string | null;
}

function applyActionToItem(
  item: AgentOpsItem,
  action: QueueAction,
  payload?: QueueActionPayload
): AgentOpsItem {
  switch (action) {
    case 'resolve':
      return { ...item, status: 'Resolved' };
    case 'snooze':
      return {
        ...item,
        status: 'Snoozed',
        ...(payload?.until && { slaDueAt: payload.until }),
      };
    case 'hold':
      return { ...item, status: 'InProgress' };
    case 'unsnooze':
      return { ...item, status: 'Open', slaDueAt: undefined };
    case 'reopen':
      return { ...item, status: 'Open' };
    case 'approve':
    case 'reject':
      return { ...item, status: 'Resolved', tags: [...(item.tags || []), action === 'approve' ? 'approved' : 'rejected'] };
    case 'send-email':
    case 'send-gratavid':
    case 'skip':
      return {
        ...item,
        status: 'Resolved',
        tags: [...(item.tags || []), action === 'send-email' ? 'email-sent' : action === 'send-gratavid' ? 'gratavid-sent' : 'skipped'],
      };
    case 'call':
    case 'sms':
      return item;
    case 'assign':
      return { ...item, assignedTo: payload?.assigneeId ?? undefined };
    case 'extendSnooze':
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
  
  // Feature flags
  const reviewModeEnabled = useFeatureFlag('queueReviewMode');
  const workbenchV2Enabled = useFeatureFlag('queueFocusWorkbenchV2');
  const bulkActionsEnabled = useFeatureFlag('queueBulkActions');
  const queueRealtimeEnabled = useFeatureFlag('queueRealtime');

  const toast = useToast();

  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  // Review Mode state management - use mode=review&itemId=123
  const isReviewMode = useMemo(() => {
    if (!reviewModeEnabled) return false;
    const modeParam = searchParams.get('mode');
    return modeParam === 'review';
  }, [searchParams, reviewModeEnabled]);

  const reviewModeItemId = useMemo(() => {
    return searchParams.get('itemId') || null;
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
  
  const dataContext = useMemo(
    () => ({
      workspace: workspaceId || undefined,
      app: workspaceId === 'admissions' ? 'student-lifecycle' : 'advancement',
      mode: 'team' as const,
    }),
    [workspaceId]
  );

  const fetchQueueItems = useCallback(
    async (options?: { showLoading?: boolean; preserveSelection?: boolean }) => {
      const { showLoading = false, preserveSelection = true } = options ?? {};
      if (showLoading) setIsLoadingItems(true);
      try {
        const items = await dataClient.listQueueItems(dataContext);
        setAllItems(items);
        const currentId = selectedItemIdRef.current;
        if (preserveSelection && currentId && !items.some((i) => i.id === currentId)) {
          setSelectedItemId(items.length > 0 ? items[0].id : null);
        }
      } catch (error) {
        console.error('Failed to load queue items:', error);
      } finally {
        if (showLoading) setIsLoadingItems(false);
      }
    },
    [dataContext]
  );

  // Initial load
  useEffect(() => {
    fetchQueueItems({ showLoading: true, preserveSelection: false });
  }, [fetchQueueItems]);

  // Real-time stream: subscribe when enabled and workspace set; patch or count events
  const handleStreamEvent = useCallback(
    (ev: AgentOpsStreamEvent) => {
      const { event, payload } = ev;
      if (isReviewMode) {
        // Defer apply: only toasts, no list patch; hook already incremented newEventsCount
        if (event === 'sla.breached') toast.warning('SLA breached on 1 item');
        if (event === 'approval.created') toast.info(`New approvals added (${payload.count ?? 1})`);
        return;
      }
      if (event === 'item.updated' || event === 'item.resolved') {
        const id = payload.itemId;
        if (!id) return;
        setAllItems((prev) =>
          prev.map((i) =>
            i.id !== id
              ? i
              : {
                  ...i,
                  ...(payload.status && { status: payload.status as AgentOpsItem['status'] }),
                  ...(payload.assigneeId !== undefined && { assignedTo: payload.assigneeId ?? undefined }),
                  ...(payload.agentSeverity && { agentSeverity: payload.agentSeverity }),
                  ...(payload.updatedAt && { updatedAt: payload.updatedAt }),
                }
          )
        );
      } else if (event === 'item.created') {
        fetchQueueItems({ showLoading: false, preserveSelection: true });
      } else if (event === 'approval.created') {
        toast.info(`New approvals added (${payload.count ?? 1})`);
      } else if (event === 'sla.breached') {
        toast.warning('SLA breached on 1 item');
      }
    },
    [isReviewMode, fetchQueueItems, toast]
  );

  const {
    connected: streamConnected,
    newEventsCount,
    clearNewEventsCount,
  } = useAgentOpsStream({
    enabled: queueRealtimeEnabled && !!workspaceId,
    workspaceId: workspaceId ?? undefined,
    onEvent: handleStreamEvent,
    deferApply: isReviewMode,
  });

  // Polling: every 30s when page visible; skip when realtime connected. Pause in Review Mode and Focus Mode
  useEffect(() => {
    if (isReviewMode || isFocusMode || (queueRealtimeEnabled && streamConnected)) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchQueueItems({ showLoading: false, preserveSelection: true });
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [isReviewMode, isFocusMode, queueRealtimeEnabled, streamConnected, fetchQueueItems]);

  // Load game plan data (for admissions and advancement workspaces)
  const [objectiveCompletionStatus, setObjectiveCompletionStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const loadGamePlan = async () => {
      if (workspaceId !== 'admissions' && workspaceId !== 'advancement') {
        setIsLoadingGamePlan(false);
        return;
      }
      
      setIsLoadingGamePlan(true);
      try {
        if (workspaceId === 'admissions') {
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
        } else if (workspaceId === 'advancement') {
          const ctx = {
            workspace: 'advancement',
            app: 'advancement',
            mode: 'team' as const,
          };
          
          const [gamePlan, counts, operatorGamePlan] = await Promise.all([
            dataClient.getPipelineTeamGamePlanForQueue(ctx),
            dataClient.getPipelineQueueGamePlanCounts(ctx),
            dataClient.getPipelineTeamGamePlan(ctx), // Get full game plan for completion status
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
      if (!activeObjectiveId || (workspaceId !== 'admissions' && workspaceId !== 'advancement')) {
        setGamePlanItems([]);
        return;
      }
      
      try {
        if (workspaceId === 'admissions') {
          const ctx = {
            workspace: 'admissions',
            app: 'student-lifecycle',
            mode: 'team' as const,
          };
          
          const items = await dataClient.getAdmissionsQueueItemsByObjective(ctx, activeObjectiveId, 10);
          setGamePlanItems(items);
        } else if (workspaceId === 'advancement') {
          const ctx = {
            workspace: 'advancement',
            app: 'advancement',
            mode: 'team' as const,
          };
          
          const items = await dataClient.getPipelineQueueItemsByObjective(ctx, activeObjectiveId, 10);
          setGamePlanItems(items);
        }
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
  const selectedItemIdRef = useRef<string | null>(null);
  const defaultsAppliedRef = useRef(false);
  useEffect(() => {
    selectedItemIdRef.current = selectedItemId;
  }, [selectedItemId]);

  // Filters drawer state (for workbench mode)
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  // Active split for workbench mode (uses splits from review controller)
  const [workbenchSplitId, setWorkbenchSplitId] = useState<string | null>(null);

  // Preserve list state for Review Mode exit
  const listStateRef = useRef<{
    scrollPosition?: number;
    selectedItemId?: string | null;
    filters?: AgentOpsFilters;
  }>({});
  
  // Apply defaults only once on mount
  useEffect(() => {
    if (!defaultsAppliedRef.current && defaultFilters) {
      defaultsAppliedRef.current = true;
      setFilters((prev) => ({ ...prev, ...defaultFilters }));
    }
  }, [defaultFilters]);

  // Calculate active filter count (excluding search and "All" values)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.role !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.type !== 'All') count++;
    if (filters.severity !== 'All') count++;
    if (filters.assignee !== 'All') count++;
    return count;
  }, [filters]);

  // Get splits for Review Mode (must be declared before filteredItems)
  const splits = useMemo(() => {
    return getDefaultSplits(workspaceId);
  }, [workspaceId]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    // In workbench mode, apply split filter first
    if (isFocusMode && workbenchV2Enabled && workbenchSplitId) {
      const split = splits.find((s) => s.id === workbenchSplitId);
      if (split && split.filterFn) {
        items = items.filter(split.filterFn);
      }
    }
    
    // If an objective is active, filter to only show items matching that objective
    if (activeObjectiveId && workspaceId === 'admissions') {
      items = items.filter((item) => itemMatchesObjective(item, activeObjectiveId));
    } else if (activeObjectiveId && workspaceId === 'advancement') {
      // For advancement, we need to match pipeline objectives
      items = items.filter((item) => {
        const tags = item.tags || [];
        const titleLower = item.title.toLowerCase();
        const summaryLower = item.summary.toLowerCase();
        
        switch (activeObjectiveId) {
          case 're-engage-stalled':
            return (
              tags.some(tag => 
                ['stalled', 'inactive', 'no-activity', 'overdue', 'stale'].includes(tag.toLowerCase())
              ) ||
              titleLower.includes('stalled') ||
              titleLower.includes('overdue') ||
              summaryLower.includes('stalled') ||
              summaryLower.includes('no activity')
            );
          case 'prep-briefs':
            return (
              tags.some(tag => 
                ['meeting', 'brief', 'prep', 'upcoming-meeting'].includes(tag.toLowerCase())
              ) ||
              titleLower.includes('meeting') ||
              titleLower.includes('brief') ||
              summaryLower.includes('meeting')
            );
          case 'advance-proposals':
            return (
              tags.some(tag => 
                ['proposal', 'review', 'stuck', 'late-stage'].includes(tag.toLowerCase())
              ) ||
              titleLower.includes('proposal') ||
              summaryLower.includes('proposal')
            );
          case 'stewardship-followups':
            return (
              tags.some(tag => 
                ['stewardship', 'thank-you', 'follow-up', 'gift'].includes(tag.toLowerCase())
              ) ||
              titleLower.includes('stewardship') ||
              titleLower.includes('thank') ||
              summaryLower.includes('stewardship')
            );
          default:
            return false;
        }
      });
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
  }, [allItems, filters, activeObjectiveId, workspaceId, isFocusMode, workbenchV2Enabled, workbenchSplitId, splits]);

  const bulkSelectMode = workbenchV2Enabled && bulkActionsEnabled && isFocusMode;
  const handleBulkToggle = useCallback((id: string) => {
    setBulkSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);
  const handleBulkSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setBulkSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setBulkSelectedIds([]);
    }
  }, [filteredItems]);

  // Handle split change in workbench mode
  const handleWorkbenchSplitChange = useCallback((splitId: string | null) => {
    setWorkbenchSplitId(splitId);
    // Selection will be reset by the useEffect that watches filteredItems
  }, []);

  // Handle filter removal
  const handleRemoveFilter = useCallback((key: keyof AgentOpsFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'search' ? '' : 'All',
    }));
  }, []);

  // Unified action handler: optimistic update, persist via API, revert + toast on error
  const handleItemAction = useCallback(
    async (id: string, action: QueueAction, payload?: QueueActionPayload) => {
      const currentIndex = filteredItems.findIndex((i) => i.id === id);
      const item = filteredItems[currentIndex];
      const previousItem = item ? { ...item } : null;

      const revert = () => {
        if (previousItem) {
          setAllItems((current) =>
            current.map((i) => (i.id === id ? previousItem : i))
          );
        }
      };

      // Optimistic update
      setAllItems((current) =>
        current.map((i) =>
          i.id === id ? applyActionToItem(i, action, payload) : i
        )
      );

      if (action === 'call' || action === 'sms') {
        const actionLabel = action === 'call' ? 'Call' : 'SMS';
        const personName = item?.person?.name || 'the donor';
        console.log(`${actionLabel} action initiated for ${personName}`);
        return;
      }

      // Persist queue actions via API (resolve, snooze, hold, unsnooze, reopen, assign)
      const persistActions: Record<string, { path: string; body?: object } | null> = {
        resolve: { path: 'resolve' },
        snooze: {
          path: 'snooze',
          body: { until: payload?.until ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        },
        hold: { path: 'hold' },
        unsnooze: { path: 'unsnooze' },
        reopen: { path: 'reopen' },
        assign: { path: 'assign', body: { assigneeId: payload?.assigneeId ?? null } },
      };
      const persist = persistActions[action];
      if (persist) {
        try {
          const qs = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
          const res = await fetch(`/api/agent-ops/items/${id}/${persist.path}${qs}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            ...(persist.body && { body: JSON.stringify(persist.body) }),
          });
          if (!res.ok) {
            revert();
            toast.error(`Failed to ${action} item`);
            return;
          }
        } catch (e) {
          revert();
          toast.error(`Failed to ${action} item`);
          return;
        }
      }

      // Agent approval/reject: approval-requests API
      if (action === 'approve' || action === 'reject') {
        const approvalId = (item?.payload as { approvalRequestId?: string } | undefined)?.approvalRequestId ?? id;
        const path = action === 'approve' ? 'approve' : 'reject';
        try {
          const res = await fetch(`/api/approval-requests/${approvalId}/${path}`, { method: 'POST' });
          if (!res.ok) {
            revert();
            toast.error(`Failed to ${action} request`);
            return;
          }
        } catch (e) {
          revert();
          toast.error(`Failed to ${action} request`);
          return;
        }
      }

      // Auto-advance after completing actions (not for unsnooze/reopen — item stays in view)
      if (
        action === 'resolve' || action === 'snooze' || action === 'hold' ||
        action === 'send-email' || action === 'send-gratavid' || action === 'skip' ||
        action === 'approve' || action === 'reject'
      ) {
        setTimeout(() => {
          if (currentIndex >= 0 && filteredItems.length > 0) {
            const nextIndex = (currentIndex + 1) % filteredItems.length;
            const next = filteredItems[nextIndex];
            if (next) setSelectedItemId(next.id);
            else if (filteredItems.length > 0) setSelectedItemId(filteredItems[0].id);
          }
        }, 100);
      }
    },
    [filteredItems, toast]
  );

  // Review Mode controller
  const reviewController = useQueueReviewController({
    items: filteredItems,
    splits,
    defaultSplitId: null,
    onItemAction: handleItemAction,
    autoAdvanceOnComplete: true,
  });

  // Sync review mode item ID with controller (when entering or URL changes)
  useEffect(() => {
    if (isReviewMode && reviewModeItemId && reviewController.currentItemId !== reviewModeItemId) {
      reviewController.setCurrentItemId(reviewModeItemId);
    }
  }, [isReviewMode, reviewModeItemId, reviewController]);

  // Sync route when currentItemId changes in Review Mode (from keyboard navigation)
  useEffect(() => {
    if (isReviewMode && reviewController.currentItemId && reviewModeItemId !== reviewController.currentItemId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('itemId', reviewController.currentItemId);
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [isReviewMode, reviewController.currentItemId, reviewModeItemId, searchParams, router]);

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

  // Initialize workbench split when entering Focus Mode with workbench enabled
  useEffect(() => {
    if (isFocusMode && workbenchV2Enabled && splits.length > 0 && !workbenchSplitId) {
      // Default to first split or null (all items)
      setWorkbenchSplitId(null);
    }
  }, [isFocusMode, workbenchV2Enabled, splits, workbenchSplitId]);

  const handleNavigateToPerson = (personId: string) => {
    router.push(`${basePath}/agent-ops/people?id=${personId}`);
  };

  const handleNavigateToAgent = (agentId: string) => {
    router.push(`${basePath}/agents/${agentId}`);
  };

  // Review Mode handlers
  const handleEnterReviewMode = (itemId?: string) => {
    const targetItemId = itemId || selectedItemId;
    if (!targetItemId) return;

    // Save current list state
    listStateRef.current = {
      selectedItemId: selectedItemId,
      filters: { ...filters },
    };

    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'review');
    params.set('itemId', targetItemId);
    router.replace(`${window.location.pathname}?${params.toString()}`);

      // Show entry toast (one-time per session)
      const toastShown = sessionStorage.getItem('review-mode-toast-shown');
      if (!toastShown) {
        setTimeout(() => {
          toast.info('Review mode - J/K or ↑↓ to move, Esc to exit', 4000);
          sessionStorage.setItem('review-mode-toast-shown', 'true');
        }, 300);
      }
  };

  const handleExitReviewMode = () => {
    clearNewEventsCount();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mode');
    params.delete('itemId');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);

    // Restore list state if available
    if (listStateRef.current.selectedItemId) {
      setSelectedItemId(listStateRef.current.selectedItemId);
    }
    if (listStateRef.current.filters) {
      setFilters(listStateRef.current.filters);
    }
    fetchQueueItems({ showLoading: false, preserveSelection: true });
  };

  // Undo handler
  const handleUndo = () => {
    const undoAction = reviewController.undo();
    if (!undoAction) {
      toast.info('No action to undo');
      return;
    }

    // Restore previous state
    setAllItems((current) =>
      current.map((item) => (item.id === undoAction.itemId ? undoAction.previousState : item))
    );

    toast.success(`Undid ${undoAction.action}`);
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
        if (isReviewMode) {
          reviewController.goToNext();
        } else {
          handleNextItem();
        }
      },
      k: () => {
        if (isReviewMode) {
          reviewController.goToPrev();
        } else {
          handlePrevItem();
        }
      },
      Enter: () => {
        if (!isReviewMode && selectedItem && reviewModeEnabled) {
          handleEnterReviewMode();
        }
      },
      e: () => {
        if (isReviewMode && reviewController.currentItem) {
          reviewController.handleAction('resolve');
        } else if (selectedItem) {
          handleItemAction(selectedItem.id, 'resolve');
        }
      },
      s: () => {
        if (isReviewMode && reviewController.currentItem) {
          reviewController.handleAction('snooze');
        } else if (selectedItem) {
          handleItemAction(selectedItem.id, 'snooze');
        }
      },
      h: () => {
        if (isReviewMode && reviewController.currentItem) {
          reviewController.handleAction('hold');
        } else if (selectedItem) {
          handleItemAction(selectedItem.id, 'hold');
        }
      },
      z: () => {
        if (isReviewMode && reviewController.canUndo) {
          handleUndo();
        }
      },
      r: () => {
        if (isReviewMode && reviewController.currentItem) {
          const item = reviewController.currentItem;
          const isApproval = item.type === 'AGENT_APPROVAL_REQUIRED' || item.type === 'AGENT_DRAFT_MESSAGE';
          if (isApproval) reviewController.handleAction('reject');
        }
      },
    },
    true
  );

  // Build review actions based on current item
  const reviewActions = useMemo((): ReviewAction[] => {
    const item = reviewController.currentItem;
    if (!item) return [];

    const actions: ReviewAction[] = [];
    const isAgentApprovalType = item.type === 'AGENT_APPROVAL_REQUIRED' || item.type === 'AGENT_DRAFT_MESSAGE';

    if (item.status === 'Open') {
      if (isAgentApprovalType) {
        actions.push(
          {
            id: 'approve',
            label: 'Approve',
            icon: 'fa-solid fa-check',
            keyHint: 'E',
            variant: 'default',
            onClick: () => reviewController.handleAction('approve'),
          },
          {
            id: 'reject',
            label: 'Reject',
            icon: 'fa-solid fa-times',
            keyHint: 'R',
            onClick: () => reviewController.handleAction('reject'),
          }
        );
      }
      actions.push(
        {
          id: 'snooze',
          label: 'Snooze',
          icon: 'fa-solid fa-clock',
          keyHint: 'S',
          onClick: () => reviewController.handleAction('snooze'),
        },
        {
          id: 'skip',
          label: 'Skip',
          icon: 'fa-solid fa-forward',
          keyHint: '',
          onClick: () => reviewController.handleAction('skip'),
        },
        {
          id: 'send-email',
          label: 'Send',
          icon: 'fa-solid fa-envelope',
          keyHint: '',
          onClick: () => reviewController.handleAction('send-email'),
        },
        {
          id: 'call',
          label: 'Call',
          icon: 'fa-solid fa-phone',
          keyHint: '',
          onClick: () => reviewController.handleAction('call'),
        },
        {
          id: 'sms',
          label: 'SMS',
          icon: 'fa-solid fa-message',
          keyHint: '',
          onClick: () => reviewController.handleAction('sms'),
        },
        ...(isAgentApprovalType ? [] : [{
          id: 'resolve',
          label: 'Resolve',
          icon: 'fa-solid fa-check',
          keyHint: 'E',
          variant: 'default' as const,
          onClick: () => reviewController.handleAction('resolve'),
        }])
      );
    } else if (item.status === 'Snoozed') {
      actions.push(
        {
          id: 'unsnooze',
          label: 'Unsnooze',
          icon: 'fa-solid fa-bell',
          onClick: () => reviewController.handleAction('unsnooze'),
        },
        {
          id: 'resolve',
          label: 'Resolve',
          icon: 'fa-solid fa-check',
          keyHint: 'E',
          variant: 'default',
          onClick: () => reviewController.handleAction('resolve'),
        }
      );
    } else if (item.status === 'Resolved') {
      actions.push({
        id: 'reopen',
        label: 'Reopen',
        icon: 'fa-solid fa-rotate-left',
        onClick: () => reviewController.handleAction('reopen'),
      });
    }

    return actions;
  }, [reviewController]);

  // Navigation handlers for review mode (must be at top level to satisfy rules of hooks)
  const handleReviewNavigateNext = useCallback(() => {
    reviewController.goToNext();
  }, [reviewController]);

  const handleReviewNavigatePrev = useCallback(() => {
    reviewController.goToPrev();
  }, [reviewController]);

  // Render Review Mode content
  const renderReviewMode = () => {
    const currentItem = reviewController.currentItem;
    const { progress } = reviewController;

    if (!currentItem) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">All caught up!</p>
            <p className="text-sm text-gray-500 mb-4">No items in this split.</p>
            <Button onClick={handleExitReviewMode} variant="outline">
              Back to Queue
            </Button>
          </div>
        </div>
      );
    }

    const topBar = (
      <div className="flex items-center justify-between px-4 h-14 border-b bg-indigo-50/30 border-indigo-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitReviewMode}
            className="text-sm"
            aria-label="Back to Queue"
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <span className="text-xs text-gray-600">
            Exit review (<span className="font-mono bg-gray-200 px-1 py-0.5 rounded">Esc</span>)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-indigo-900">Review</span>
          {newEventsCount > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded" title="New updates in queue">
              +{newEventsCount} new
            </span>
          )}
          {splits.length > 0 && (
            <SplitTabs
              splits={splits}
              activeSplitId={reviewController.activeSplitId}
              onSplitChange={reviewController.setActiveSplitId}
            />
          )}
          <div className="text-sm font-medium text-gray-700">
            {progress.current} of {progress.total}
          </div>
        </div>
      </div>
    );

    return (
      <ReviewModeShell
        enabled={true}
        onExit={handleExitReviewMode}
        topBar={topBar}
        bottomBar={<ReviewActionBar actions={reviewActions} />}
        onNavigateNext={handleReviewNavigateNext}
        onNavigatePrev={handleReviewNavigatePrev}
      >
        <QueueDetail
          item={currentItem}
          focusMode={false}
          onExitFocusMode={handleExitReviewMode}
          onNext={reviewController.goToNext}
          onPrev={reviewController.goToPrev}
          onAction={(id, action) => reviewController.handleAction(action)}
          onNavigateToPerson={handleNavigateToPerson}
          onNavigateToAgent={handleNavigateToAgent}
          basePath={basePath}
        />
      </ReviewModeShell>
    );
  };

  // Render queue content (same in both focus and unfocused modes)
  const renderQueueContent = () => {
    const isWorkbench = isFocusMode && workbenchV2Enabled;
    const listHeight = isWorkbench ? '100%' : 'calc(100vh - 14rem)';

    return (
      <div className={cn(
        "grid gap-3 flex-1 min-h-0",
        isWorkbench ? "md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] h-full" : "md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]"
      )}>
        {/* Left: Queue List */}
        <section 
          className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          style={{ height: listHeight }}
        >
          <div className="flex-1 overflow-y-auto">
            {/* Game Plan Items Lane (when objective is active) - hidden in workbench mode */}
            {!isWorkbench && activeObjectiveId && (workspaceId === 'admissions' || workspaceId === 'advancement') && gamePlanItems.length > 0 && (
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
            
            {/* Bulk action bar (feature-flagged) */}
            {bulkSelectMode && bulkSelectedIds.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 bg-indigo-50 text-sm">
                <span className="font-medium text-gray-700">{bulkSelectedIds.length} selected</span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    bulkSelectedIds.forEach((id) => handleItemAction(id, 'resolve'));
                    setBulkSelectedIds([]);
                  }}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    bulkSelectedIds.forEach((id) => handleItemAction(id, 'snooze', { until }));
                    setBulkSelectedIds([]);
                  }}
                >
                  Snooze
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setBulkSelectedIds([])}>
                  Clear
                </Button>
              </div>
            )}

            {/* Main Queue List */}
            <QueueList
              items={filteredItems}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={(id) => {
                setSelectedItemId(id);
              }}
              onEnterFocusMode={reviewModeEnabled ? () => handleEnterReviewMode() : handleEnterFocusMode}
              onItemAction={handleItemAction}
              bulkSelectMode={bulkSelectMode}
              bulkSelectedIds={bulkSelectedIds}
              onBulkToggle={handleBulkToggle}
              onBulkSelectAll={handleBulkSelectAll}
            />
          </div>
        </section>

      {/* Right: Detail Panel */}
      <section className="relative flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
        {selectedItem ? (
          <>
            {/* Review Mode Entry Point - Primary CTA */}
            {reviewModeEnabled && !isReviewMode && (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      Press <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">Enter</span> to start review
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleEnterReviewMode()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    title="Start review (Enter) - full-screen, auto-advance with J/K"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-eye" className="h-3 w-3 mr-1.5" />
                    Start review
                    <span className="ml-1.5 text-xs font-mono bg-indigo-700/30 px-1.5 py-0.5 rounded">
                      Enter
                    </span>
                  </Button>
                </div>
                {/* One-time coachmark */}
                <ReviewModeCoachmark />
              </>
            )}
            <QueueDetail
              item={selectedItem}
              focusMode={isFocusMode}
              onExitFocusMode={handleExitFocusMode}
              onNext={handleNextItem}
              onPrev={handlePrevItem}
              onAction={handleItemAction}
              onNavigateToPerson={handleNavigateToPerson}
              onNavigateToAgent={handleNavigateToAgent}
              basePath={basePath}
            />
          </>
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
  };

  // Render page content (same structure in both modes)
  // Use useEffect to apply padding after hydration to avoid hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render workbench mode (Superhuman-style Focus Mode)
  const renderWorkbenchMode = () => (
    <div className="flex flex-col h-full">
      {/* Workbench Toolbar */}
      <WorkbenchToolbar
        splits={splits}
        activeSplitId={workbenchSplitId}
        onSplitChange={handleWorkbenchSplitChange}
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        onFiltersClick={() => setFiltersDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        onReviewNext={reviewModeEnabled && selectedItem ? () => handleEnterReviewMode() : undefined}
        showReviewNext={reviewModeEnabled && !!selectedItem && !isReviewMode}
        onRefresh={() => fetchQueueItems({ showLoading: false, preserveSelection: true })}
        liveConnected={queueRealtimeEnabled && streamConnected}
      />

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* Queue Content */}
      <div className="flex-1 min-h-0">
        {renderQueueContent()}
      </div>

      {/* Filters Drawer */}
      <FiltersDrawer
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Shortcuts Overlay */}
      <ShortcutsOverlay isReviewMode={false} />
    </div>
  );

  const renderPageContent = () => {
    // Use workbench mode if enabled and in Focus Mode
    if (isFocusMode && workbenchV2Enabled) {
      return renderWorkbenchMode();
    }

    // Standard layout
    return (
      <div className={cn("relative flex flex-col h-full pb-16", hasMounted && isFocusMode && "p-6")}>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {workspaceId === 'admissions' 
                  ? 'Admissions Queue' 
                  : workspaceId === 'advancement' 
                  ? 'Advancement Pipeline Queue' 
                  : 'Agent Ops — Queue'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                All items that require attention across your agent ecosystem. Filter, triage, and resolve issues in real time.
              </p>
            </div>
            {/* Live indicator + Action Buttons (Admissions and Advancement) */}
            <div className="flex items-center gap-2">
              {queueRealtimeEnabled && streamConnected && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded" title="Real-time updates connected">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                  Live
                </span>
              )}
              {(workspaceId === 'admissions' || workspaceId === 'advancement') && (
                <>
                {/* Focus Mode Toggle Button */}
                <Button
                  variant={isFocusMode ? "default" : "outline"}
                  size="sm"
                  onClick={isFocusMode ? handleExitFocusMode : handleEnterFocusMode}
                  className={cn(
                    isFocusMode && "bg-indigo-600 hover:bg-indigo-700 text-white"
                  )}
                  title={isFocusMode ? "Focus: minimal workbench" : "Enter Focus Mode"}
                >
                  <FontAwesomeIcon 
                    icon={isFocusMode ? "fa-solid fa-compress" : "fa-solid fa-expand"} 
                    className="h-3 w-3 mr-1.5" 
                  />
                  Focus mode
                </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Game Plan Panel (Admissions and Advancement) - hidden in workbench mode */}
          {!workbenchV2Enabled && (workspaceId === 'admissions' || workspaceId === 'advancement') && !isLoadingGamePlan && gamePlanData && (
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
          
          {/* Filters - always show full filters in standard mode */}
          {!workbenchV2Enabled && (
            <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />
          )}
        </div>

        {/* Queue Content */}
        {renderQueueContent()}

        {/* Shortcut Footer - only in standard mode */}
        {!workbenchV2Enabled && (
          <ShortcutFooter showReviewModeShortcuts={isReviewMode} />
        )}
      </div>
    );
  };

  // Render Review Mode if active
  if (isReviewMode && reviewModeEnabled) {
    return (
      <>
        {renderReviewMode()}
        <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
        <ShortcutsOverlay isReviewMode={true} />
      </>
    );
  }

  // Wrap with FocusModePage for Admissions and Advancement workspaces
  if (workspaceId === 'admissions' || workspaceId === 'advancement') {
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
