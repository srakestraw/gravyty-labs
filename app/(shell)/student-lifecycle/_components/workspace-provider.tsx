'use client';

import * as React from 'react';
import type { WorkspaceConfig, WorkspaceId } from '../lib/workspaces';

type WorkspaceContextValue = {
  workspaceId: WorkspaceId;
  workspaceLabel: string;
  peopleLabel: string;
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({
  workspace,
  children,
}: {
  workspace: WorkspaceConfig;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({
      workspaceId: workspace.id,
      workspaceLabel: workspace.label,
      peopleLabel: workspace.peopleLabel,
    }),
    [workspace.id, workspace.label, workspace.peopleLabel]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}



