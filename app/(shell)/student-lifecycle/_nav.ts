import type { NavSection, NavItem } from '@/lib/apps/types';
import { isValidWorkspace, type WorkspaceId, getWorkspaceConfig } from '@/lib/student-lifecycle/workspaces';
import { buildAiPlatformNav } from '@/lib/nav/ai-platform-nav';

function resolveWorkspaceFromPathname(pathname: string): WorkspaceId {
  const match = pathname.match(/^\/student-lifecycle\/([^/]+)/);
  const candidate = match?.[1];
  if (candidate && isValidWorkspace(candidate)) return candidate;
  return 'admissions';
}

export function getAppNav(params: { pathname: string }): { sections: NavSection[] } {
  const workspace = resolveWorkspaceFromPathname(params.pathname);
  const basePath = `/student-lifecycle/${workspace}`;
  const workspaceConfig = getWorkspaceConfig(workspace);

  return {
    sections: [
      buildAiPlatformNav({
        basePath,
        peopleLabel: workspaceConfig.peopleLabel,
        includeSegments: true,
      }),
    ],
  };
}



