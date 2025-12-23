'use client';

/**
 * Admissions AI Assistant Page
 * 
 * Wires the shared AI Assistant component with the Admissions domain provider.
 */

import { useAuth } from '@/lib/firebase/auth-context';
import { AiAssistant } from '@/components/shared/ai-assistant/AiAssistant';
import { createProviderRegistry, getProviderForDomain } from '@/lib/ai-assistant/providers/registry';
import { useMemo } from 'react';

export default function AdmissionsAssistantPage() {
  const { user } = useAuth();
  
  // Create provider registry and get Admissions provider
  const providerRegistry = useMemo(() => createProviderRegistry(), []);
  const provider = useMemo(
    () => getProviderForDomain(providerRegistry, 'admissions', {
      userId: user?.uid,
      tenantId: 'admissions', // TODO: Get from actual tenant context
    }),
    [providerRegistry, user]
  );

  const userContext = useMemo(
    () => ({
      userId: user?.uid,
      tenantId: 'admissions',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    }),
    [user]
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admissions AI Assistant
        </h1>
        <p className="text-gray-600 mb-8">
          Ask questions about applicants, applications, and queue items.
        </p>
        
        <AiAssistant
          domain="admissions"
          userContext={userContext}
          provider={provider}
          placeholder="Ask Admissions Assistant…"
        />
      </div>
    </div>
  );
}
