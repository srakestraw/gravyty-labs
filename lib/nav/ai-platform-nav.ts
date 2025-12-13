import type { NavSection, NavItem } from '@/lib/apps/types';

export function buildAiPlatformNav(params: {
  basePath: string;
  peopleLabel?: string;
  sectionTitle?: string;
  includeSegments?: boolean;
}): NavSection {
  const { basePath, peopleLabel, sectionTitle = 'AI Platform', includeSegments = true } = params;

  const items: NavItem[] = [
    { name: 'Command Center', href: `${basePath}/ai`, icon: 'fa-solid fa-compass', id: 'command-center' },
    { name: 'AI Assistant', href: `${basePath}/assistant`, icon: 'fa-solid fa-comments', id: 'assistant' },
    {
      name: peopleLabel || 'People',
      href: `${basePath}/agent-ops/people`,
      icon: 'fa-solid fa-users',
      id: 'people',
    },
    { name: 'Queue', href: `${basePath}/agent-ops/queue`, icon: 'fa-solid fa-list', id: 'queue' },
    ...(includeSegments ? [{ name: 'Segments', href: `${basePath}/segments`, icon: 'fa-solid fa-filter', id: 'segments' }] : []),
    { name: 'Agents', href: `${basePath}/agents`, icon: 'fa-solid fa-bolt', id: 'agents' },
  ];

  return {
    id: 'aiPlatform',
    title: sectionTitle,
    items,
  };
}

