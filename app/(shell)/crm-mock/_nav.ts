import type { NavSection } from '@/lib/apps/types';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      {
        id: 'core',
        title: 'Core',
        items: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            href: '/crm-mock',
            icon: 'fa-solid fa-house',
          },
          {
            id: 'constituents',
            name: 'Constituents',
            href: '/crm-mock/constituents',
            icon: 'fa-solid fa-users',
          },
          {
            id: 'portfolios',
            name: 'Portfolios',
            href: '/crm-mock/portfolios',
            icon: 'fa-solid fa-briefcase',
          },
          {
            id: 'opportunities',
            name: 'Opportunities',
            href: '/crm-mock/opportunities',
            icon: 'fa-solid fa-handshake',
          },
          {
            id: 'move-plans',
            name: 'Move Plans',
            href: '/crm-mock/move-plans',
            icon: 'fa-solid fa-route',
          },
          {
            id: 'gifts',
            name: 'Gifts',
            href: '/crm-mock/gifts',
            icon: 'fa-solid fa-gift',
          },
          {
            id: 'outreach-queue',
            name: 'Outreach Queue',
            href: '/crm-mock/outreach-queue',
            icon: 'fa-solid fa-inbox',
          },
          {
            id: 'reports',
            name: 'Reports',
            href: '/crm-mock/reports',
            icon: 'fa-solid fa-chart-bar',
            children: [
              {
                id: 'lapsed-donors',
                name: 'Lapsed Donors',
                href: '/crm-mock/reports/lapsed-donors',
                icon: 'fa-solid fa-user-clock',
              },
              {
                id: 'portfolio-coverage',
                name: 'Portfolio Coverage',
                href: '/crm-mock/reports/portfolio-coverage',
                icon: 'fa-solid fa-chart-pie',
              },
              {
                id: 'outreach-activity',
                name: 'Outreach Activity',
                href: '/crm-mock/reports/outreach-activity',
                icon: 'fa-solid fa-chart-line',
              },
              {
                id: 'giving-trends',
                name: 'Giving Trends',
                href: '/crm-mock/reports/giving-trends',
                icon: 'fa-solid fa-trending-up',
              },
            ],
          },
        ],
      },
      {
        id: 'activity',
        title: 'Activity',
        items: [
          {
            id: 'interactions',
            name: 'Interactions',
            href: '/crm-mock/interactions',
            icon: 'fa-solid fa-comments',
          },
          {
            id: 'tasks',
            name: 'Tasks',
            href: '/crm-mock/tasks',
            icon: 'fa-solid fa-tasks',
          },
          {
            id: 'events',
            name: 'Events',
            href: '/crm-mock/events',
            icon: 'fa-solid fa-calendar',
          },
        ],
      },
      {
        id: 'data',
        title: 'Data',
        items: [
          {
            id: 'organizations',
            name: 'Organizations',
            href: '/crm-mock/organizations',
            icon: 'fa-solid fa-building',
          },
          {
            id: 'relationships',
            name: 'Relationships',
            href: '/crm-mock/relationships',
            icon: 'fa-solid fa-project-diagram',
          },
          {
            id: 'segments',
            name: 'Segments',
            href: '/crm-mock/segments',
            icon: 'fa-solid fa-filter',
          },
        ],
      },
      {
        id: 'admin',
        title: 'Admin',
        items: [
          {
            id: 'campaigns',
            name: 'Campaigns',
            href: '/crm-mock/admin/campaigns',
            icon: 'fa-solid fa-bullhorn',
          },
          {
            id: 'funds',
            name: 'Funds',
            href: '/crm-mock/admin/funds',
            icon: 'fa-solid fa-coins',
          },
          {
            id: 'appeals',
            name: 'Appeals',
            href: '/crm-mock/admin/appeals',
            icon: 'fa-solid fa-envelope-open-text',
          },
          {
            id: 'data-generator',
            name: 'Data Generator',
            href: '/crm-mock/admin/data-generator',
            icon: 'fa-solid fa-database',
          },
          {
            id: 'settings',
            name: 'Settings',
            href: '/crm-mock/admin/settings',
            icon: 'fa-solid fa-gear',
          },
        ],
      },
    ],
  };
}

