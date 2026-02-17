/**
 * Detail Renderer Registry
 * 
 * Allows dynamic selection of detail view components based on item type.
 * Used to support custom detail views (e.g., First Draft) without forking the main QueueDetail component.
 */

import React from 'react';
import { AgentOpsItem } from '@/lib/agent-ops/types';
import type { QueueAction } from '@/components/ai-assistants/agent-ops/queue/QueueList';

export interface QueueDetailRendererProps {
  item: AgentOpsItem;
  onAction?: (id: string, action: QueueAction) => void;
  onNavigateToPerson?: (personId: string) => void;
  onNavigateToAgent?: (agentId: string) => void;
  /** Base path for deep links (e.g. /admissions, /advancement/pipeline). From getAiPlatformBasePath(context). */
  basePath?: string;
}

export type QueueDetailRenderer = (props: QueueDetailRendererProps) => React.ReactElement;

const rendererRegistry = new Map<string, QueueDetailRenderer>();

/**
 * Register a detail renderer for a specific key
 */
export function registerQueueDetailRenderer(key: string, renderer: QueueDetailRenderer): void {
  rendererRegistry.set(key, renderer);
}

/**
 * Get a detail renderer by key
 */
export function getQueueDetailRenderer(key: string): QueueDetailRenderer | undefined {
  return rendererRegistry.get(key);
}

