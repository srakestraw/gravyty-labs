import type { NavSection } from '@/lib/apps/types';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      {
        id: 'topLevel',
        items: [
          { name: 'Command Center', href: '/admissions/ai', icon: 'fa-solid fa-compass', id: 'command-center' },
          { name: 'AI Assistant', href: '/admissions/assistant', icon: 'fa-solid fa-comments', id: 'assistant' },
          { name: 'Applicants', href: '/admissions/agent-ops/people', icon: 'fa-solid fa-users', id: 'applicants' },
          { name: 'Queue', href: '/admissions/agent-ops/queue', icon: 'fa-solid fa-list', id: 'queue' },
          { name: 'Segments', href: '/admissions/segments', icon: 'fa-solid fa-filter', id: 'segments' },
          { name: 'Agents', href: '/admissions/agents', icon: 'fa-solid fa-bolt', id: 'agents' },
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
          { name: 'Permissions', href: '/ai-assistants/permissions', icon: 'fa-solid fa-key' },
          { name: 'Settings', href: '/ai-assistants/settings', icon: 'fa-solid fa-cog' },
        ],
      },
    ],
  };
}

