import { AgentOpsFilters } from '@/lib/agent-ops/types';

export type WorkspaceId =
  | 'admissions'
  | 'financial-aid'
  | 'registrar'
  | 'student-success'
  | 'housing';

export type WorkspaceDefaults = {
  peopleLabel: string;
  defaultPeopleFilters?: Partial<AgentOpsFilters>;
  defaultQueueView?: Partial<AgentOpsFilters>;
  recommendedAgents?: string[];
  recommendedSegments?: string[];
  segmentTemplates?: string[];
  defaultSegmentId?: string;
  // Future: persona support
  // defaultPersona?: 'frontline' | 'manager' | 'executive';
  // supportedPersonas?: ('frontline' | 'manager' | 'executive')[];
};

import type { WorkingMode } from '@/lib/command-center/workingModeUtils';
export type { WorkingMode } from '@/lib/command-center/workingModeUtils';

export type WorkspaceConfig = {
  id: WorkspaceId;
  label: string;
  peopleLabel: string;
  defaultPeopleFilters?: Partial<AgentOpsFilters>;
  defaultQueueView?: Partial<AgentOpsFilters>;
  recommendedAgents?: string[];
  recommendedSegments?: string[];
  segmentTemplates?: string[];
  defaultSegmentId?: string;
  enableWorkingModeSelector?: boolean;
  workingModeDefault?: WorkingMode;
  // Future: persona support
  // defaultPersona?: 'frontline' | 'manager' | 'executive';
  // supportedPersonas?: ('frontline' | 'manager' | 'executive')[];
};

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'admissions',
    label: 'Admissions',
    peopleLabel: 'Applicants',
    defaultPeopleFilters: {
      role: 'Admissions',
      status: 'Open',
      severity: 'All',
    },
    defaultQueueView: {
      role: 'Admissions',
      status: 'Open',
      severity: 'High',
    },
    recommendedAgents: ['agent-transcript-helper', 'agent-high-intent-prospect'],
    recommendedSegments: ['seg-high-intent-prospects', 'seg-missing-transcript', 'seg-incomplete-app-7d', 'seg-melt-risk'],
    enableWorkingModeSelector: true,
    workingModeDefault: 'team',
    // Future: persona support
    // defaultPersona: 'frontline',
    // supportedPersonas: ['frontline', 'manager'],
  },
  {
    id: 'financial-aid',
    label: 'Financial Aid',
    peopleLabel: 'Students',
    defaultPeopleFilters: {
      role: 'Registrar',
      status: 'Open',
    },
    defaultQueueView: {
      role: 'Registrar',
      status: 'Open',
      type: 'Error',
    },
    recommendedAgents: ['agent-registration-requirements'],
  },
  {
    id: 'registrar',
    label: 'Registrar',
    peopleLabel: 'Students',
    defaultPeopleFilters: {
      role: 'Registrar',
      status: 'Open',
    },
    defaultQueueView: {
      role: 'Registrar',
      status: 'Open',
    },
    recommendedAgents: ['agent-registration-requirements'],
    recommendedSegments: ['seg-missing-transcript'],
    // Future: persona support
    // defaultPersona: 'frontline',
  },
  {
    id: 'student-success',
    label: 'Student Success',
    peopleLabel: 'Students',
    defaultPeopleFilters: {
      role: 'Student Success',
      status: 'Open',
    },
    defaultQueueView: {
      role: 'Student Success',
      status: 'Open',
    },
    recommendedAgents: [],
    recommendedSegments: ['seg-at-risk-no-lms-10d'],
    // Future: persona support
    // defaultPersona: 'manager',
  },
  {
    id: 'housing',
    label: 'Housing',
    peopleLabel: 'Residents',
    defaultPeopleFilters: {
      role: 'All',
      status: 'Open',
      type: 'Escalation',
    },
    defaultQueueView: {
      role: 'All',
      status: 'Open',
      type: 'Escalation',
    },
    recommendedAgents: [],
    // Future: persona support
    // defaultPersona: 'frontline',
  },
];

export function isValidWorkspace(id: string): id is WorkspaceId {
  return WORKSPACES.some((w) => w.id === id);
}

export function getWorkspaceConfig(id: string): WorkspaceConfig {
  const ws = WORKSPACES.find((w) => w.id === id);
  if (!ws) throw new Error(`Unknown workspace: ${id}`);
  return ws;
}

export function getWorkspaceDefaults(id: string): WorkspaceDefaults {
  const config = getWorkspaceConfig(id);
  return {
    peopleLabel: config.peopleLabel,
    defaultPeopleFilters: config.defaultPeopleFilters,
    defaultQueueView: config.defaultQueueView,
    recommendedAgents: config.recommendedAgents,
    recommendedSegments: config.recommendedSegments,
    segmentTemplates: config.segmentTemplates,
    defaultSegmentId: config.defaultSegmentId,
    // Future: persona support
    // defaultPersona: config.defaultPersona,
    // supportedPersonas: config.supportedPersonas,
  };
}

