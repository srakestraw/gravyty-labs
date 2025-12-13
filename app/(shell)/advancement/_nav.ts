import type { NavSection } from '@/lib/apps/types';
import { buildAiPlatformNav } from '@/lib/nav/ai-platform-nav';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      buildAiPlatformNav({
        basePath: '/advancement',
        includeSegments: false,
      }),
      {
        id: 'topLevel',
        items: [
          { name: 'Overview', href: '/advancement', icon: 'fa-solid fa-gift', id: 'overview' },
          { name: 'Agents', href: '/advancement/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
          { name: 'Queue', href: '/advancement/queue', icon: 'fa-solid fa-list', id: 'queue' },
        ],
      },
      {
        id: 'dataAndAudiences',
        title: 'Data and audiences',
        items: [
          { name: 'Contacts', href: '/contacts', icon: 'fa-solid fa-users' },
          { name: 'Segments', href: '/segments', icon: 'fa-solid fa-filter' },
        ],
      },
    ],
  };
}



