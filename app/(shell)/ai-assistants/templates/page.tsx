'use client';

export const dynamic = 'force-static';

import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockTemplates } from '../lib/data';

export default function TemplatesPage() {
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
        <p className="text-gray-600 mt-1">
          Choose from pre-configured assistant templates to get started quickly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FontAwesomeIcon
                  icon={template.icon}
                  className="h-6 w-6 text-purple-600"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className="text-xs text-gray-500">{template.category}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">{template.description}</p>
            {canManage ? (
              <Link href={`/ai-assistants/new?template=${template.id}`}>
                <Button className="w-full">
                  Use Template
                </Button>
              </Link>
            ) : (
              <Button className="w-full" disabled>
                View Only
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">About Templates</h3>
        <p className="text-sm text-gray-600">
          Templates provide pre-configured settings and guardrails for common use cases.
          You can customize any template after creating an assistant from it.
        </p>
      </div>
    </div>
  );
}

