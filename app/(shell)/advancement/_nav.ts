import type { NavSection } from '@/lib/apps/types';
import { buildAiPlatformNav } from '@/lib/nav/ai-platform-nav';

function resolveWorkspaceFromPathname(pathname: string): 'pipeline' | 'giving' | 'payments' | null {
  if (pathname.startsWith('/advancement/pipeline')) return 'pipeline';
  if (pathname.startsWith('/advancement/giving')) return 'giving';
  if (pathname.startsWith('/advancement/payments')) return 'payments';
  return null;
}

export function getAppNav(params: { pathname: string }): { sections: NavSection[] } {
  const workspace = resolveWorkspaceFromPathname(params.pathname);
  
  // If we're in a workspace, show workspace-specific navigation
  if (workspace) {
    const basePath = `/advancement/${workspace}`;
    
    // Workspace switcher items (shown in header, not in sidebar for Pipeline)
    const workspaceSwitcherItems = [
      { name: 'Pipeline', href: '/advancement/pipeline', icon: 'fa-solid fa-chart-line', id: 'pipeline' },
      { name: 'Giving', href: '/advancement/giving', icon: 'fa-solid fa-hand-holding-heart', id: 'giving' },
      { name: 'Payments & Processing', href: '/advancement/payments', icon: 'fa-solid fa-credit-card', id: 'payments' },
    ];
    
    // Workspace-specific top-level items
    let workspaceSpecificItems: typeof workspaceSwitcherItems = [];
    
    if (workspace === 'pipeline') {
      workspaceSpecificItems = [
        { name: 'Command Center', href: '/advancement/pipeline', icon: 'fa-solid fa-compass', id: 'command-center' },
        { name: 'AI Assistant', href: '/advancement/pipeline/assistant', icon: 'fa-solid fa-comments', id: 'assistant' },
        { name: 'Queue', href: '/advancement/pipeline/agent-ops/queue', icon: 'fa-solid fa-list', id: 'queue' },
        { name: 'Agents', href: '/advancement/pipeline/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
      ];
      // Pipeline doesn't show workspace switcher in sidebar (only in header)
    } else if (workspace === 'giving') {
      workspaceSpecificItems = [
        { name: 'Overview', href: '/advancement/giving', icon: 'fa-solid fa-hand-holding-heart', id: 'overview' },
        { name: 'Campaigns', href: '/advancement/giving/campaigns', icon: 'fa-solid fa-bullhorn', id: 'campaigns' },
        { name: 'Donors', href: '/advancement/giving/donors', icon: 'fa-solid fa-users', id: 'donors' },
      ];
    } else if (workspace === 'payments') {
      workspaceSpecificItems = [
        { name: 'Overview', href: '/advancement/payments', icon: 'fa-solid fa-credit-card', id: 'overview' },
        { name: 'Transactions', href: '/advancement/payments/transactions', icon: 'fa-solid fa-receipt', id: 'transactions' },
        { name: 'Processing', href: '/advancement/payments/processing', icon: 'fa-solid fa-cog', id: 'processing' },
      ];
    }
    
    // Combine workspace-specific items with workspace switcher (except for Pipeline)
    const topLevelItems = workspace === 'pipeline' 
      ? workspaceSpecificItems 
      : [...workspaceSpecificItems, ...workspaceSwitcherItems];
    
    return {
      sections: [
        {
          id: 'topLevel',
          items: topLevelItems,
        },
        buildAiPlatformNav({
          basePath,
          includeSegments: true,
        }),
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

  // Default navigation for /advancement root
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



