/**
 * Agent Options Provider for Advancement AI Assistant
 *
 * Provides filtered list of real agents/workflows for AI recommendations.
 * Only Advancement-relevant agents with status Active or Paused.
 */

import { MOCK_AGENTS } from '@/lib/agents/mock-data';
import type { MockAgent } from '@/lib/agents/mock-data';

export interface AgentOption {
  id: string;
  name: string;
  type: 'Autonomous' | 'Flow Builder';
  role: string;
  purpose: string;
  status: 'Active' | 'Paused' | 'Error' | 'Draft';
  capabilities?: string[];
}

const STATUS_MAP: Record<string, AgentOption['status']> = {
  active: 'Active',
  paused: 'Paused',
  error: 'Error',
  draft: 'Draft',
};

/**
 * Get Advancement-relevant agent options for AI recommendations.
 * Filters: role === "Advancement" AND status in ["Active", "Paused"].
 * Excludes Error and Draft by default.
 */
export function getAdvancementAgentOptions(): AgentOption[] {
  return MOCK_AGENTS.filter(
    (a: MockAgent) =>
      a.role === 'Advancement' &&
      (a.status === 'active' || a.status === 'paused')
  ).map((a: MockAgent) => ({
    id: a.id,
    name: a.name,
    type: a.type === 'FLOW' ? 'Flow Builder' : 'Autonomous',
    role: a.role,
    purpose: a.purpose ?? '',
    status: STATUS_MAP[a.status ?? 'draft'] ?? 'Draft',
    capabilities: a.purpose ? [a.purpose] : undefined,
  }));
}

/**
 * Get agent option by id from the Advancement list.
 * Returns undefined if not found or not Advancement-relevant.
 */
export function getAdvancementAgentOptionById(id: string): AgentOption | undefined {
  return getAdvancementAgentOptions().find((o) => o.id === id);
}
