'use client';

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import { QueueDetail } from '@/components/ai-assistants/agent-ops/queue/QueueDetail';
import type { QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';
import type { QueueDetailRendererProps } from './registry';

/**
 * Default queue detail renderer - wraps the standard QueueDetail component
 */
export function DefaultQueueDetail({
  item,
  onAction,
  onNavigateToPerson,
  onNavigateToAgent,
  basePath,
}: QueueDetailRendererProps) {
  return (
    <QueueDetail
      item={item}
      focusMode={false}
      onExitFocusMode={() => {}}
      onNext={() => {}}
      onPrev={() => {}}
      onAction={onAction || (() => {})}
      onNavigateToPerson={onNavigateToPerson}
      onNavigateToAgent={onNavigateToAgent}
      basePath={basePath}
    />
  );
}

