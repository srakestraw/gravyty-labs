import type { NavSection } from '@/lib/apps/types';
import { buildAiPlatformNav } from '@/lib/nav/ai-platform-nav';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      buildAiPlatformNav({
        basePath: '/ai-assistants',
        includeSegments: true,
      }),
      {
        id: 'dataAndAudiences',
        title: 'Data and audiences',
        items: [
          { name: 'Contacts', href: '/contacts', icon: 'fa-solid fa-users' },
        ],
      },
      {
        id: 'adminTools',
        title: 'Admin Tools',
        items: [
          { name: 'Guardrails', href: '/admin/guardrails', icon: 'fa-solid fa-shield-halved' },
          { name: 'Do Not Engage', href: '/ai-assistants/do-not-engage', icon: 'fa-solid fa-user-slash' },
          { name: 'Evals', href: '/ai-assistants/evals', icon: 'fa-solid fa-chart-line' },
          { name: 'Logs', href: '/ai-assistants/logs', icon: 'fa-solid fa-list' },
          { name: 'Voice & Tone', href: '/ai-assistants/voice-and-tone', icon: 'fa-solid fa-comments' },
          { name: 'Templates', href: '/ai-assistants/templates', icon: 'fa-solid fa-file-lines' },
          { name: 'Permissions', href: '/ai-assistants/permissions', icon: 'fa-solid fa-key' },
          { name: 'Agents Reporting', href: '/ai-assistants/reports', icon: 'fa-solid fa-chart-pie' },
          { name: 'Settings', href: '/ai-assistants/settings', icon: 'fa-solid fa-cog' },
          { name: 'Design System Preview', href: 'https://advance-admin-steel.vercel.app/ai-assistant', icon: 'fa-solid fa-palette', external: true },
        ],
      },
    ],
  };
}



