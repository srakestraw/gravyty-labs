import type { NavSection } from '@/lib/apps/types';

function resolveWorkspaceFromPathname(pathname: string): 'student' | 'alumni' | null {
  if (pathname.startsWith('/engagement-hub/student')) return 'student';
  if (pathname.startsWith('/engagement-hub/alumni')) return 'alumni';
  return null;
}

export function getAppNav(params: { pathname: string }): { sections: NavSection[] } {
  const workspace = resolveWorkspaceFromPathname(params.pathname);

  const workspaceItems = [
    { name: 'Overview', href: '/engagement-hub', icon: 'fa-solid fa-compass', id: 'overview' },
    { name: 'Student Hub', href: '/engagement-hub/student', icon: 'fa-solid fa-graduation-cap', id: 'student' },
    { name: 'Alumni Hub', href: '/engagement-hub/alumni', icon: 'fa-solid fa-users', id: 'alumni' },
  ];

  return {
    sections: [
      {
        id: 'topLevel',
        items: workspaceItems,
      },
    ],
  };
}
