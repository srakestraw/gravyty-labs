'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentOpsFilters, AgentOpsItem } from '@/lib/agent-ops/types';
import { getMockAgentOpsItems } from '@/lib/agent-ops/mock';
import { AgentOpsFiltersBar } from '@/components/ai-assistants/agent-ops/AgentOpsFiltersBar';
import { QueueList, type QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import { QueueDetail } from '@/components/ai-assistants/agent-ops/queue/QueueDetail';
import { ShortcutFooter } from '@/components/ai-assistants/agent-ops/queue/ShortcutFooter';
import { useHotkeys } from '@/lib/hooks/useHotkeys';
import { cn } from '@/lib/utils';

interface QueuePageClientProps {
  basePath?: string;
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

export function QueuePageClient({ basePath = '/ai-assistants' }: QueuePageClientProps) {
  const router = useRouter();
  const [allItems, setAllItems] = useState<AgentOpsItem[]>(getMockAgentOpsItems());
  const [filters, setFilters] = useState<AgentOpsFilters>({
    role: 'All',
    status: 'All',
    type: 'All',
    severity: 'All',
    assignee: 'All',
    search: '',
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
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
  }, [allItems, filters]);

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

  return (
    <div className="relative flex flex-col h-full pb-16">
      {/* Fixed Header + Toolbar */}
      <div className="flex-shrink-0 space-y-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Ops — Queue</h1>
          <p className="text-sm text-gray-600 mt-1">
            All items that require attention across your agent ecosystem. Filter, triage, and resolve issues in real time.
          </p>
        </div>
        <AgentOpsFiltersBar filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Body: Queue List + Details - Left fixed with scroll, Right page scroll */}
      <div className="grid gap-3 mb-3 md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] flex-1 min-h-0">
        {/* Left: Queue List - Fixed height, internal scroll */}
        <section 
          className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          style={{ height: 'calc(100vh - 14rem)' }}
        >
          <div className="flex-1 overflow-y-auto">
            <QueueList
              items={filteredItems}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={(id) => {
                setSelectedItemId(id);
              }}
              onEnterFocusMode={() => {
                // No-op: we don't use focus mode anymore
              }}
              onItemAction={handleItemAction}
            />
          </div>
        </section>

        {/* Right: Detail Panel - Natural height, page scroll */}
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

      {/* Superhuman-style shortcut footer */}
      <ShortcutFooter />
    </div>
  );
}
