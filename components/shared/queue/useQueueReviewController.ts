'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import type { QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import type { QueueSplit } from './SplitTabs';

export interface UndoAction {
  itemId: string;
  action: QueueAction;
  previousState: AgentOpsItem;
  timestamp: number;
}

interface UseQueueReviewControllerProps {
  items: AgentOpsItem[];
  splits: QueueSplit[];
  defaultSplitId?: string | null;
  onItemAction: (id: string, action: QueueAction) => Promise<void> | void;
  autoAdvanceOnComplete?: boolean;
}

/**
 * QueueReviewController - Manages Review Mode state and navigation.
 * 
 * Responsibilities:
 * - Current split selection and filtering
 * - Ordered list of itemIds in current split
 * - Current index and progress tracking
 * - Navigation (next/prev) within current split
 * - Auto-advance after actions
 * - Undo stack management
 * 
 * Usage:
 * ```typescript
 * const controller = useQueueReviewController({
 *   items: filteredItems,
 *   splits: advancementSplits,
 *   defaultSplitId: 'due-today',
 *   onItemAction: handleItemAction,
 *   autoAdvanceOnComplete: true,
 * });
 * ```
 */
export function useQueueReviewController({
  items,
  splits,
  defaultSplitId = null,
  onItemAction,
  autoAdvanceOnComplete = true,
}: UseQueueReviewControllerProps) {
  const [activeSplitId, setActiveSplitId] = useState<string | null>(defaultSplitId);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const undoStackRef = useRef<UndoAction[]>([]);

  // Filter items by active split
  const filteredItems = useMemo(() => {
    if (!activeSplitId) {
      return items;
    }

    const split = splits.find((s) => s.id === activeSplitId);
    if (!split || !split.filterFn) {
      return items;
    }

    return items.filter(split.filterFn);
  }, [items, splits, activeSplitId]);

  // Ordered list of item IDs in current split
  const itemIds = useMemo(() => {
    return filteredItems.map((item) => item.id);
  }, [filteredItems]);

  // Current item
  const currentItem = useMemo(() => {
    if (!currentItemId) {
      return filteredItems[0] || null;
    }
    return filteredItems.find((item) => item.id === currentItemId) || filteredItems[0] || null;
  }, [filteredItems, currentItemId]);

  // Current index and progress
  const currentIndex = useMemo(() => {
    if (!currentItem) return -1;
    return itemIds.indexOf(currentItem.id);
  }, [currentItem, itemIds]);

  const progress = useMemo(() => {
    if (itemIds.length === 0) return { current: 0, total: 0 };
    return {
      current: currentIndex >= 0 ? currentIndex + 1 : 0,
      total: itemIds.length,
    };
  }, [currentIndex, itemIds.length]);

  // Initialize current item when split changes or items load
  useEffect(() => {
    if (filteredItems.length > 0 && !currentItemId) {
      setCurrentItemId(filteredItems[0].id);
    } else if (filteredItems.length === 0) {
      setCurrentItemId(null);
    } else if (currentItemId && !filteredItems.find((item) => item.id === currentItemId)) {
      // Current item no longer in filtered set, go to first
      setCurrentItemId(filteredItems[0].id);
    }
  }, [filteredItems, currentItemId]);

  // Navigation
  const goToNext = useCallback(() => {
    if (itemIds.length === 0) return;
    const nextIndex = (currentIndex + 1) % itemIds.length;
    setCurrentItemId(itemIds[nextIndex]);
  }, [itemIds, currentIndex]);

  const goToPrev = useCallback(() => {
    if (itemIds.length === 0) return;
    const prevIndex = (currentIndex - 1 + itemIds.length) % itemIds.length;
    setCurrentItemId(itemIds[prevIndex]);
  }, [itemIds, currentIndex]);

  const goToItem = useCallback((itemId: string) => {
    if (itemIds.includes(itemId)) {
      setCurrentItemId(itemId);
    }
  }, [itemIds]);

  // Handle split change
  const handleSplitChange = useCallback((splitId: string | null) => {
    setActiveSplitId(splitId);
    // Reset to first item in new split
    setCurrentItemId(null);
  }, []);

  // Action handler with auto-advance and undo support
  const handleAction = useCallback(
    async (action: QueueAction) => {
      if (!currentItem) return;

      // Save state for undo
      const previousState = { ...currentItem };
      undoStackRef.current.push({
        itemId: currentItem.id,
        action,
        previousState,
        timestamp: Date.now(),
      });

      // Keep only last 10 undo actions
      if (undoStackRef.current.length > 10) {
        undoStackRef.current.shift();
      }

      // Execute action
      await onItemAction(currentItem.id, action);

      // Auto-advance if action completes the item
      if (autoAdvanceOnComplete) {
        const completingActions: QueueAction[] = [
          'resolve',
          'snooze',
          'hold',
          'send-email',
          'send-gratavid',
          'skip',
        ];
        if (completingActions.includes(action)) {
          // Wait a bit for state to update, then advance
          setTimeout(() => {
            goToNext();
          }, 150);
        }
      }
    },
    [currentItem, onItemAction, autoAdvanceOnComplete, goToNext]
  );

  // Undo last action
  const undo = useCallback(() => {
    const lastAction = undoStackRef.current.pop();
    if (!lastAction) return null;

    // Restore previous state
    // Note: This requires the parent to handle state restoration
    // We return the undo action so parent can handle it
    return lastAction;
  }, []);

  // Check if there's an undo available
  const canUndo = undoStackRef.current.length > 0;

  return {
    // State
    activeSplitId,
    currentItem,
    currentItemId,
    currentIndex,
    progress,
    filteredItems,
    itemIds,
    canUndo,

    // Actions
    setActiveSplitId: handleSplitChange,
    goToNext,
    goToPrev,
    goToItem,
    handleAction,
    undo,
    setCurrentItemId,
  };
}

