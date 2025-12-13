'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { usePersona } from '../contexts/persona-context';

interface WorkspaceCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

const workspaceCards: WorkspaceCard[] = [
  {
    id: 'admissions',
    name: 'Admissions Assistant',
    description: 'AI assistants for application tracking, document management, and enrollment workflows.',
    href: '/student-lifecycle/admissions',
    icon: 'fa-solid fa-clipboard-check',
    color: '#00B8D9',
  },
  {
    id: 'financial-aid',
    name: 'Financial Aid Assistant',
    description: 'AI assistants for FAFSA processing, aid eligibility, and financial aid workflows.',
    href: '/student-lifecycle/financial-aid',
    icon: 'fa-solid fa-dollar-sign',
    color: '#059669',
  },
  {
    id: 'registrar',
    name: 'Registrar Assistant',
    description: 'AI assistants for course registration, transcript management, and academic records.',
    href: '/student-lifecycle/registrar',
    icon: 'fa-solid fa-graduation-cap',
    color: '#7C3AED',
  },
  {
    id: 'student-success',
    name: 'Student Success Assistant',
    description: 'AI assistants for student support, retention, and success workflows.',
    href: '/student-lifecycle/student-success',
    icon: 'fa-solid fa-user-graduate',
    color: '#8B5CF6',
  },
];

export default function StudentLifecycleLanding() {
  const { persona } = usePersona();
  const isHigherEd = persona === 'higher-ed';

  if (!isHigherEd) {
    // For NPO persona, this page might not be applicable
    // But we'll show a simple message
    return (
      <main className="space-y-6 p-6">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">Supporter Lifecycle AI</h1>
          <p className="text-sm text-gray-600">
            AI assistants for supporter onboarding, donations, renewals, and stewardship workflows.
          </p>
        </header>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Student Lifecycle AI</h1>
        <p className="text-sm text-gray-600">
          Choose a workspace to manage AI assistants for admissions, financial aid, registrar, or student success.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {workspaceCards.map((workspace) => (
          <Link
            key={workspace.id}
            href={workspace.href}
            className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${workspace.color}15` }}
              >
                <FontAwesomeIcon
                  icon={workspace.icon}
                  className="h-6 w-6"
                  style={{ color: workspace.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {workspace.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">{workspace.description}</p>
              </div>
              <FontAwesomeIcon
                icon="fa-solid fa-chevron-right"
                className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"
              />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
