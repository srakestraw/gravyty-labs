'use client';

import React, { useMemo } from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { getQueueDetailRenderer } from '@/components/shared/queue/detail-renderers/registry';
import { DefaultQueueDetail } from '@/components/shared/queue/detail-renderers/DefaultQueueDetail';
import type { QueueAction } from './QueueList';

// Import renderers to ensure they're registered
import '@/components/shared/queue/detail-renderers';

interface QueueDetailProps {
  item: AgentOpsItem;
  focusMode: boolean;
  onExitFocusMode: () => void;
  onNext: () => void;
  onPrev: () => void;
  onAction: (id: string, action: QueueAction) => void;
  onNavigateToPerson?: (personId: string) => void;
  onNavigateToAgent?: (agentId: string) => void;
  detailRendererKey?: string; // Optional: if provided, use this key instead of item.detailView
}

export function QueueDetail({
  item,
  focusMode,
  onExitFocusMode,
  onNext,
  onPrev,
  onAction,
  onNavigateToPerson,
  onNavigateToAgent,
  detailRendererKey,
}: QueueDetailProps) {
  // Determine renderer key: use prop if provided, otherwise use item.detailView, fallback to 'default'
  const rendererKey = useMemo(() => {
    if (detailRendererKey) return detailRendererKey;
    if (item.detailView === 'first-draft') return 'advancement-first-draft';
    return 'default';
  }, [detailRendererKey, item.detailView]);

  // Get the appropriate renderer
  const Renderer = useMemo(() => {
    const customRenderer = getQueueDetailRenderer(rendererKey);
    if (customRenderer) {
      // Call the renderer with action handlers
      return (props: { item: AgentOpsItem }) =>
        customRenderer({
          item: props.item,
          onAction,
          onNavigateToPerson,
          onNavigateToAgent,
        });
    }
    // Fallback to default renderer
    return (props: { item: AgentOpsItem }) => (
      <DefaultQueueDetail
        item={props.item}
        onAction={onAction}
        onNavigateToPerson={onNavigateToPerson}
        onNavigateToAgent={onNavigateToAgent}
      />
    );
  }, [rendererKey, onAction, onNavigateToPerson, onNavigateToAgent]);

  return (
    <div className="h-full overflow-y-auto">
      <Renderer item={item} />
    </div>
  );
}
