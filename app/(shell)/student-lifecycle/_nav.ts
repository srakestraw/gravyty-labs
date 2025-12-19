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

  const aiPlatformSection = buildAiPlatformNav({
    basePath,
    peopleLabel: workspaceConfig.peopleLabel,
    includeSegments: true,
  });

  // Add Program Match for admissions workspace
  if (workspace === 'admissions') {
    aiPlatformSection.items.push({
      name: 'Program Match',
      href: `${basePath}/program-match`,
      icon: 'fa-solid fa-link',
      id: 'program-match',
    });
  }

  return {
    sections: [aiPlatformSection],
  };
}



