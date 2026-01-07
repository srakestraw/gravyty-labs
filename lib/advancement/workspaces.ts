/**
 * Advancement workspace configuration
 * Similar to Student Lifecycle workspaces but for Advancement app
 */

export type AdvancementWorkspaceId = 'pipeline' | 'giving' | 'payments';

export type AdvancementWorkspaceConfig = {
  id: AdvancementWorkspaceId;
  label: string;
};

export const ADVANCEMENT_WORKSPACES: AdvancementWorkspaceConfig[] = [
  {
    id: 'pipeline',
    label: 'Pipeline',
  },
  {
    id: 'giving',
    label: 'Giving',
  },
  {
    id: 'payments',
    label: 'Payments & Processing',
  },
];

export function isValidAdvancementWorkspace(id: string): id is AdvancementWorkspaceId {
  return ADVANCEMENT_WORKSPACES.some((w) => w.id === id);
}

export function getAdvancementWorkspaceConfig(id: string): AdvancementWorkspaceConfig {
  const ws = ADVANCEMENT_WORKSPACES.find((w) => w.id === id);
  if (!ws) throw new Error(`Unknown Advancement workspace: ${id}`);
  return ws;
}





