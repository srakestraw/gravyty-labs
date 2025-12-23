import type { NavSection } from '@/lib/apps/types';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      {
        id: 'topLevel',
        items: [
          // Core section
          {
            id: 'dashboard',
            name: 'Dashboard',
            href: '/crm',
            icon: 'fa-solid fa-house',
          },
          {
            id: 'constituents',
            name: 'Constituents',
            href: '/crm/constituents',
            icon: 'fa-solid fa-users',
          },
          {
            id: 'portfolios',
            name: 'Portfolios',
            href: '/crm/portfolios',
            icon: 'fa-solid fa-briefcase',
          },
          {
            id: 'outreach-queue',
            name: 'Outreach Queue',
            href: '/crm/outreach-queue',
            icon: 'fa-solid fa-inbox',
          },
          {
            id: 'reports',
            name: 'Reports',
            href: '/crm/reports',
            icon: 'fa-solid fa-chart-bar',
            children: [
              {
                id: 'lapsed-donors',
                name: 'Lapsed Donors',
                href: '/crm/reports/lapsed-donors',
                icon: 'fa-solid fa-user-clock',
              },
              {
                id: 'portfolio-coverage',
                name: 'Portfolio Coverage',
                href: '/crm/reports/portfolio-coverage',
                icon: 'fa-solid fa-chart-pie',
              },
              {
                id: 'outreach-activity',
                name: 'Outreach Activity',
                href: '/crm/reports/outreach-activity',
                icon: 'fa-solid fa-chart-line',
              },
              {
                id: 'giving-trends',
                name: 'Giving Trends',
                href: '/crm/reports/giving-trends',
                icon: 'fa-solid fa-trending-up',
              },
            ],
          },
          // Activity section
          {
            id: 'interactions',
            name: 'Interactions',
            href: '/crm/interactions',
            icon: 'fa-solid fa-comments',
          },
          {
            id: 'tasks',
            name: 'Tasks',
            href: '/crm/tasks',
            icon: 'fa-solid fa-tasks',
          },
          {
            id: 'events',
            name: 'Events',
            href: '/crm/events',
            icon: 'fa-solid fa-calendar',
          },
          // Data section
          {
            id: 'organizations',
            name: 'Organizations',
            href: '/crm/organizations',
            icon: 'fa-solid fa-building',
          },
          {
            id: 'relationships',
            name: 'Relationships',
            href: '/crm/relationships',
            icon: 'fa-solid fa-project-diagram',
          },
          {
            id: 'segments',
            name: 'Segments',
            href: '/crm/segments',
            icon: 'fa-solid fa-filter',
          },
          // Admin section
          {
            id: 'data-generator',
            name: 'Data Generator',
            href: '/crm/admin/data-generator',
            icon: 'fa-solid fa-database',
          },
          {
            id: 'settings',
            name: 'Settings',
            href: '/crm/admin/settings',
            icon: 'fa-solid fa-gear',
          },
        ],
      },
    ],
  };
}
