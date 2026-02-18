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
      // Pipeline uses sectioned nav: Overview, Work, Pipeline & Portfolio, Campaigns, Data and audiences, Insights, Admin Tools
      return {
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            items: [
              { name: 'Command Center', href: '/advancement/pipeline', icon: 'fa-solid fa-compass', id: 'command-center' },
            ],
          },
          {
            id: 'work',
            title: 'Work',
            items: [
              { name: 'AI Assistant', href: '/advancement/pipeline/assistant', icon: 'fa-solid fa-comments', id: 'assistant' },
              { name: 'Task Queue', href: '/advancement/pipeline/agent-ops/queue', icon: 'fa-solid fa-list', id: 'queue' },
              { name: 'Agents & Workflow', href: '/advancement/pipeline/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
            ],
          },
          {
            id: 'pipelinePortfolio',
            title: 'Pipeline & Portfolio',
            items: [
              { name: 'Opportunities', href: '/advancement/pipeline/opportunities', icon: 'fa-solid fa-handshake-angle', id: 'opportunities' },
              { name: 'Portfolios', href: '/advancement/pipeline/portfolios', icon: 'fa-solid fa-briefcase', id: 'portfolios' },
              { name: 'Plans (Moves)', href: '/advancement/pipeline/plans', icon: 'fa-solid fa-diagram-project', id: 'plans' },
            ],
          },
          {
            id: 'campaigns',
            title: 'Campaigns',
            items: [
              { name: 'Campaigns', href: '/advancement/pipeline/campaigns', icon: 'fa-solid fa-bullhorn', id: 'campaigns' },
              { name: 'Events', href: '/advancement/pipeline/events', icon: 'fa-solid fa-calendar-days', id: 'events' },
              { name: 'Narrative Messaging', href: '/advancement/pipeline/narrative-messaging', icon: 'fa-solid fa-message-lines', id: 'narrative-messaging' },
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
          {
            id: 'insights',
            title: 'Insights',
            items: [
              { name: 'Reports', href: '/advancement/pipeline/reports', icon: 'fa-solid fa-chart-line', id: 'reports' },
              { name: 'Forecast', href: '/advancement/pipeline/forecast', icon: 'fa-solid fa-chart-column', id: 'forecast' },
              { name: 'Alerts', href: '/advancement/pipeline/alerts', icon: 'fa-solid fa-bell', id: 'alerts' },
            ],
          },
          {
            id: 'adminTools',
            title: 'Admin Tools',
            items: [
              { name: 'Settings', href: '/advancement/pipeline/settings', icon: 'fa-solid fa-gear', id: 'settings' },
              { name: 'Data Quality', href: '/advancement/pipeline/data-quality', icon: 'fa-solid fa-broom', id: 'data-quality' },
            ],
          },
        ],
      };
    } else if (workspace === 'giving') {
      workspaceSpecificItems = [
        { name: 'Overview', href: '/advancement/giving', icon: 'fa-solid fa-hand-holding-heart', id: 'overview' },
        { name: 'Narrative Messaging', href: '/advancement/giving/narrative-messaging', icon: 'fa-solid fa-message-lines', id: 'narrative-messaging' },
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



