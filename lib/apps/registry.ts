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
      id: 'student-lifecycle',
      label: isHigherEd ? 'Student Lifecycle AI' : 'Supporter Lifecycle',
      icon: 'fa-solid fa-users',
      href: '/student-lifecycle',
      color: '#8B5CF6',
      requiresRole: true,
      description: isHigherEd
        ? 'AI assistants across the student lifecycle.'
        : 'AI assistants for supporter onboarding, donations, renewals, stewardship workflows, and service interactions.',
      pills: isHigherEd
        ? [
            { id: 'admissions', label: 'Admissions', href: '/student-lifecycle/admissions' },
            { id: 'registrar', label: 'Registrar', href: '/student-lifecycle/registrar' },
            { id: 'financial-aid', label: 'Financial Aid', href: '/student-lifecycle/financial-aid' },
            { id: 'bursar', label: 'Bursar', href: '/student-lifecycle/bursar' },
            { id: 'housing', label: 'Housing', href: '/student-lifecycle/housing' },
            { id: 'student-success', label: 'Student Success', href: '/student-lifecycle/student-success' },
          ]
        : undefined,
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
      icon: 'fa-solid fa-hand-holding-heart',
      href: '/advancement',
      color: '#DC2626',
      poweredBy: 'Platform',
      description: isHigherEd
        ? 'Build stronger donor relationships with human-centered AI'
        : 'Donor development and fundraising — campaigns, appeals, recurring giving, stewardship, and ambassadors.',
      pills: isHigherEd
        ? [
            { id: 'pipeline', label: 'Pipeline', href: '/advancement/pipeline' },
            { id: 'giving', label: 'Giving', href: '/advancement/giving' },
            { id: 'payments', label: 'Payments & Processing', href: '/advancement/payments' },
          ]
        : undefined,
      group: 'main',
    },
    {
      id: 'admissions',
      label: 'Admissions Management',
      icon: 'fa-solid fa-clipboard-check',
      href: '/admissions',
      color: '#00B8D9',
      poweredBy: 'Platform',
      description: isHigherEd
        ? 'Streamline your admissions process with intelligent automation, program matching, and lead management.'
        : 'Streamline your admissions process with intelligent automation, program matching, and lead management.',
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
      id: 'banner-sis-sim',
      label: 'Ellucian Banner',
      icon: 'fa-solid fa-graduation-cap',
      href: '/sim/banner-sis',
      color: '#7C3AED',
      poweredBy: 'Simulation',
      group: 'sim',
    },
    {
      id: 'colleague-sis-sim',
      label: 'Ellucian Colleague',
      icon: 'fa-solid fa-graduation-cap',
      href: '/sim/colleague-sis',
      color: '#7C3AED',
      poweredBy: 'Simulation',
      group: 'sim',
    },
    {
      id: 'slate-sis-sim',
      label: 'Slate',
      icon: 'fa-solid fa-clipboard-list',
      href: '/sim/slate-sis',
      color: '#3B82F6',
      poweredBy: 'Simulation',
      group: 'sim',
    },
    {
      id: 'salesforce-crm-sim',
      label: 'Salesforce',
      icon: 'fa-solid fa-cloud',
      href: '/sim/salesforce-crm',
      color: '#00A1E0',
      poweredBy: 'Simulation',
      group: 'sim',
    },
    {
      id: 'canvas-lms-sim',
      label: 'Canvas',
      icon: 'fa-solid fa-chalkboard',
      href: '/sim/canvas-lms',
      color: '#E63F31',
      poweredBy: 'Simulation',
      group: 'sim',
    },
    {
      id: 'blackboard-lms-sim',
      label: 'Blackboard',
      icon: 'fa-solid fa-chalkboard-user',
      href: '/sim/blackboard-lms',
      color: '#000000',
      poweredBy: 'Simulation',
      group: 'sim',
    },
  ];

  return [...main, ...sim];
}


