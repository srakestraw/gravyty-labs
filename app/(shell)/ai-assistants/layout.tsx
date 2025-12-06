'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { canAccessAIAssistants } from '@/lib/roles';
import { useFeatureFlag } from '@/lib/features';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

export default function AIAssistantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
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

      {/* Content Area - navigation is now in the main sidebar */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

