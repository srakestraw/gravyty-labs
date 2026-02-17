import { AgentOpsFilters } from '@/lib/agent-ops/types';
import type { SegmentDefinition } from '@/components/shared/ai-platform/segments/types';

export type AiPlatformMode = 'global' | 'workspace';

export type AiPlatformPageContext = {
  appId?: string;
  workspaceId?: string;
  /** Sub-workspace within the app (e.g. admissions, pipeline, giving). When absent, derived from workspaceId. */
  subWorkspaceId?: string;
  /** Default voice for this workspace (e.g. gift_officer, advisor). Used for template instantiation. */
  defaultVoice?: string;
  mode?: AiPlatformMode;
  peopleLabel?: string;
  activeSegmentId?: string;
  activeSegment?: SegmentDefinition;
  defaults?: {
    peopleFilters?: Partial<AgentOpsFilters>;
    queueView?: Partial<AgentOpsFilters>;
    recommendedAgents?: string[];
    recommendedSegments?: string[];
    segmentTemplates?: string[];
    defaultSegmentId?: string;
  };
};

export function getAiPlatformBasePath(context?: AiPlatformPageContext): string {
  // Phase 2 default behavior: /ai-assistants
  if (!context?.appId) return '/ai-assistants';
  
  // For workspace mode, include workspaceId in the path
  if (context.mode === 'workspace' && context.workspaceId) {
    return `/${context.appId}/${context.workspaceId}`;
  }
  
  return `/${context.appId}`;
}



