import { notFound } from 'next/navigation';
import { isValidWorkspace, getWorkspaceConfig } from '@/lib/student-lifecycle/workspaces';
import { WorkspaceProvider } from '../_components/workspace-provider';

export default function WorkspaceLayout({
  params,
  children,
}: {
  params: { workspace: string };
  children: React.ReactNode;
}) {
  const { workspace } = params;
  if (!isValidWorkspace(workspace)) notFound();

  const config = getWorkspaceConfig(workspace);
  return <WorkspaceProvider workspace={config}>{children}</WorkspaceProvider>;
}



