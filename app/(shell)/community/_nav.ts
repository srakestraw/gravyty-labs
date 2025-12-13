import type { NavSection, NavItem } from '@/lib/apps/types';
import { buildAiPlatformNav } from '@/lib/nav/ai-platform-nav';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  // Build AI Platform nav but override Command Center to point to /community instead of /community/ai
  const aiPlatformNav = buildAiPlatformNav({
    basePath: '/community',
    includeSegments: false,
  });
  
  // Update Command Center href to point to /community
  const updatedItems = aiPlatformNav.items.map(item => 
    item.id === 'command-center' 
      ? { ...item, href: '/community' }
      : item
  );

  return {
    sections: [
      {
        ...aiPlatformNav,
        items: updatedItems,
      },
    ],
  };
}



