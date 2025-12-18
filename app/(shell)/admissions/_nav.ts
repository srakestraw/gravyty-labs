import type { NavSection } from '@/lib/apps/types';

export function getAppNav(_params: { pathname: string }): { sections: NavSection[] } {
  return {
    sections: [
      {
        id: 'topLevel',
        items: [
          { name: 'Overview', href: '/admissions', icon: 'fa-solid fa-house', id: 'overview' },
          { name: 'Program Match Overview', href: '/admissions/program-match/overview', icon: 'fa-solid fa-chart-line', id: 'program-match-overview' },
          { name: 'Configure', href: '/admissions/program-match/configure', icon: 'fa-solid fa-cog', id: 'program-match-configure' },
          { name: 'Quiz Builder', href: '/admissions/program-match/quiz-builder', icon: 'fa-solid fa-pencil', id: 'program-match-quiz-builder' },
          { name: 'Readiness Assessment', href: '/admissions/program-match/readiness', icon: 'fa-solid fa-clipboard-check', id: 'program-match-readiness' },
          { name: 'Preview', href: '/admissions/program-match/preview', icon: 'fa-solid fa-eye', id: 'program-match-preview' },
          { name: 'Deploy', href: '/admissions/program-match/deploy', icon: 'fa-solid fa-rocket', id: 'program-match-deploy' },
          { name: 'Analytics', href: '/admissions/program-match/analytics', icon: 'fa-solid fa-chart-bar', id: 'program-match-analytics' },
        ],
      },
    ],
  };
}

