import type { AppDefinition } from './types';

// NOTE: Registry order must match the current App Switcher UI order.
export function getAppRegistry(params?: { persona?: 'higher-ed' | 'nonprofit' }): AppDefinition[] {
  const persona = params?.persona ?? 'higher-ed';
  const isHigherEd = persona === 'higher-ed';

  const main: AppDefinition[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'fa-solid fa-house',
      href: '/dashboard',
      color: '#3B82F6',
      poweredBy: 'Platform',
      description: 'Your unified dashboard with insights, alerts, and shortcuts across your programs.',
      group: 'main',
    },
    {
      id: 'student-lifecycle',
      label: isHigherEd ? 'Student Lifecycle' : 'Supporter Lifecycle',
      icon: 'fa-solid fa-graduation-cap',
      href: '/student-lifecycle',
      color: '#8B5CF6',
      requiresRole: true,
      description: isHigherEd
        ? 'AI assistants and workflows for admissions, financial aid, registrar, student success, and housing.'
        : 'AI assistants for supporter onboarding, donations, renewals, stewardship workflows, and service interactions.',
      pills: isHigherEd
        ? [
            { id: 'admissions', label: 'Admissions', href: '/student-lifecycle/admissions' },
            { id: 'financial-aid', label: 'Financial Aid', href: '/student-lifecycle/financial-aid' },
            { id: 'registrar', label: 'Registrar', href: '/student-lifecycle/registrar' },
            { id: 'student-success', label: 'Student Success', href: '/student-lifecycle/student-success' },
            { id: 'housing', label: 'Housing', href: '/student-lifecycle/housing' },
          ]
        : undefined,
      group: 'main',
    },
    {
      id: 'ai-chatbots-messaging',
      label: 'AI Chatbots & Messaging',
      icon: 'fa-solid fa-comments',
      href: '/ai-assistants/assistant',
      color: '#8B5CF6',
      requiresRole: true,
      description: isHigherEd
        ? '24/7 student-facing chatbot and messaging powered by Ivy & Ocelot.'
        : '24/7 supporter-facing chatbot and messaging powered by Ivy & Ocelot.',
      group: 'main',
    },
    {
      id: 'engagement-hub',
      label: isHigherEd ? 'Engagement Hub' : 'Community Engagement',
      icon: 'fa-solid fa-users',
      href: '/community',
      color: '#7C3AED',
      poweredBy: 'Platform',
      description: isHigherEd
        ? 'Community and alumni engagement — events, volunteering, mentoring, groups, and messaging. Includes: Graduway & Athlete Network.'
        : 'Constituent and community engagement — events, volunteering, peer programs, groups, and messaging.',
      group: 'main',
    },
    {
      id: 'advancement-philanthropy',
      label: isHigherEd ? 'Advancement & Philanthropy' : 'Development & Fundraising',
      icon: 'fa-solid fa-gift',
      href: '/advancement',
      color: '#DC2626',
      poweredBy: 'Platform',
      description: isHigherEd
        ? 'Fundraising and annual giving — giving forms, campaigns, appeals, Giving Day, recurring gifts, stewardship, and fundraising ambassadors. Includes: Advance, Raise, Gratavid.'
        : 'Donor development and fundraising — campaigns, appeals, recurring giving, stewardship, and ambassadors.',
      group: 'main',
    },
    {
      id: 'career-services',
      label: 'Career Services',
      icon: 'fa-solid fa-briefcase',
      href: '/career',
      color: '#00B8D9',
      poweredBy: ['AI Career Hub', 'Graduway', 'Athlete Network'],
      description: isHigherEd
        ? 'Career Hub for students and alumni – jobs, internships, and employer recruiting.'
        : 'Career Hub for supporters, alumni, or program participants — jobs, internships, and employer recruiting.',
      group: 'main',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: 'fa-solid fa-chart-bar',
      href: '/data',
      color: '#059669',
      poweredBy: 'Platform',
      description: 'Reporting and data across all products.',
      group: 'main',
    },
    {
      id: 'admin-settings',
      label: 'Admin & Settings',
      icon: 'fa-solid fa-shield',
      href: '/admin',
      color: '#059669',
      poweredBy: 'Platform',
      description: 'Organization, users & permissions, AI policies, and platform configuration.',
      group: 'main',
    },
  ];

  const sim: AppDefinition[] = [
    {
      id: 'sim-apps',
      label: isHigherEd ? 'SIM Apps' : 'Connected Systems (SIM Apps)',
      icon: 'fa-solid fa-th',
      href: '/sim-apps',
      color: '#6366F1',
      poweredBy: 'Simulation',
      pills: [
        { id: 'banner-sis-sim', label: 'Banner SIS (SIM)', href: '/sim/banner-sis' },
        { id: 'colleague-sis-sim', label: 'Colleague SIS (SIM)', href: '/sim/colleague-sis' },
        { id: 'slate-sis-sim', label: 'Slate SIS (SIM)', href: '/sim/slate-sis' },
        { id: 'salesforce-crm-sim', label: 'Salesforce CRM (SIM)', href: '/sim/salesforce-crm' },
        { id: 'blackbaud-crm-sim', label: 'Blackbaud CRM (SIM)', href: '/sim/blackbaud-crm' },
        { id: 'canvas-lms-sim', label: 'Canvas LMS (SIM)', href: '/sim/canvas-lms' },
        { id: 'blackboard-lms-sim', label: 'Blackboard LMS (SIM)', href: '/sim/blackboard-lms' },
      ],
      group: 'sim',
    },
  ];

  return [...main, ...sim];
}


