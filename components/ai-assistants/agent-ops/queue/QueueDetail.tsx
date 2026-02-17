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
  /** Base path for deep links (getAiPlatformBasePath). */
  basePath?: string;
  detailRendererKey?: string;
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
  basePath,
  detailRendererKey,
}: QueueDetailProps) {
  // Determine renderer key: prop > item.type (agent-generated) > item.detailView > default
  const rendererKey = useMemo(() => {
    if (detailRendererKey) return detailRendererKey;
    const agentTypeToRenderer: Record<string, string> = {
      AGENT_DRAFT_MESSAGE: 'agent-draft-message',
      AGENT_APPROVAL_REQUIRED: 'agent-approval-required',
      AGENT_BLOCKED_ACTION: 'agent-blocked-action',
      AGENT_FLOW_EXCEPTION: 'agent-flow-exception',
    };
    if (item.type && agentTypeToRenderer[item.type]) return agentTypeToRenderer[item.type];
    if (item.detailView === 'first-draft') return 'advancement-first-draft';
    return 'default';
  }, [detailRendererKey, item.type, item.detailView]);

  // Get the appropriate renderer
  const Renderer = useMemo(() => {
    const customRenderer = getQueueDetailRenderer(rendererKey);
    if (customRenderer) {
      return (props: { item: AgentOpsItem }) =>
        customRenderer({
          item: props.item,
          onAction,
          onNavigateToPerson,
          onNavigateToAgent,
          basePath,
        });
    }
    return (props: { item: AgentOpsItem }) => (
      <DefaultQueueDetail
        item={props.item}
        onAction={onAction}
        onNavigateToPerson={onNavigateToPerson}
        onNavigateToAgent={onNavigateToAgent}
        basePath={basePath}
      />
    );
  }, [rendererKey, onAction, onNavigateToPerson, onNavigateToAgent, basePath]);

  return (
    <div className="h-full overflow-y-auto">
      <Renderer item={item} />
    </div>
  );
}
