'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Assistants', href: '/ai-assistants', icon: 'fa-solid fa-user-robot' },
  { name: 'Guardrails', href: '/ai-assistants/guardrails', icon: 'fa-solid fa-shield-halved' },
  { name: 'Eval & Logs', href: '/ai-assistants/eval', icon: 'fa-solid fa-chart-line' },
  { name: 'Templates', href: '/ai-assistants/templates', icon: 'fa-solid fa-file-lines' },
  { name: 'Permissions', href: '/ai-assistants/permissions', icon: 'fa-solid fa-key' },
  { name: 'Settings', href: '/ai-assistants/settings', icon: 'fa-solid fa-cog' },
];

export default function AIAssistantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const aiAssistantsEnabled = useFeatureFlag('ai_assistants');

  // Check access
  if (!aiAssistantsEnabled || !canAccessAIAssistants(user?.email || user?.uid)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access AI Assistants.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon="fa-solid fa-user-robot" className="h-8 w-8 text-[#8B5CF6]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Assistants
              </h1>
              <p className="text-gray-600 mt-1">
                Configure and monitor AI-driven assistants
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              Beta
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Nav */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/ai-assistants' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                    'hover:bg-gray-100 text-gray-700',
                    isActive && 'bg-purple-50 text-purple-700 font-medium'
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

