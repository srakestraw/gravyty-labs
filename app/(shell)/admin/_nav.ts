import type { NavSection } from '@/lib/apps/types';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      {
        id: 'topLevel',
        items: [{ name: 'Overview', href: '/admin', icon: 'fa-solid fa-shield', id: 'overview' }],
      },
      {
        id: 'adminTools',
        title: 'Admin Tools',
        items: [
          { name: 'Guardrails', href: '/admin/guardrails', icon: 'fa-solid fa-shield-halved' },
          { name: 'Do Not Engage', href: '/admin/do-not-engage', icon: 'fa-solid fa-user-slash' },
          { name: 'Evals', href: '/admin/evals', icon: 'fa-solid fa-chart-line' },
          { name: 'Logs', href: '/admin/logs', icon: 'fa-solid fa-list' },
          { name: 'Voice & Tone', href: '/ai-assistants/voice-and-tone', icon: 'fa-solid fa-comments' },
          { name: 'Permissions', href: '/admin/permissions', icon: 'fa-solid fa-key' },
          { name: 'Settings', href: '/admin/settings', icon: 'fa-solid fa-cog' },
        ],
      },
    ],
  };
}








