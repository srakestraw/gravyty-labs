'use client';

/**
 * Advancement AI Assistant Page (Phase 1: Stub)
 * 
 * Wires the shared AI Assistant component with the Advancement domain provider.
 * Phase 1: Returns "not implemented" responses (feature-flagged).
 */

import { useAuth } from '@/lib/firebase/auth-context';
import { AiAssistant } from '@/components/shared/ai-assistant/AiAssistant';
import { createProviderRegistry, getProviderForDomain, isDomainAvailable } from '@/lib/ai-assistant/providers/registry';
import { useMemo } from 'react';

export default function AdvancementAssistantPage() {
  const { user } = useAuth();
  
  const isAvailable = isDomainAvailable('advancement');
  
  // Create provider registry and get Advancement provider
  const providerRegistry = useMemo(() => createProviderRegistry(), []);
  
  // Only get provider if domain is available (feature flag enabled)
  const provider = useMemo(() => {
    if (!isAvailable) {
      return null;
    }
    try {
      return getProviderForDomain(providerRegistry, 'advancement', {
        userId: user?.uid,
        tenantId: 'advancement',
      });
    } catch {
      return null;
    }
  }, [providerRegistry, user, isAvailable]);

  const userContext = useMemo(
    () => ({
      userId: user?.uid,
      tenantId: 'advancement',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    }),
    [user]
  );

  if (!isAvailable || !provider) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advancement AI Assistant
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>Phase 1:</strong> Advancement Pipeline Assistant is planned for a later phase and is not yet available.
              To enable the stub (which will return "not implemented" responses), set{' '}
              <code className="bg-yellow-100 px-1 rounded">features.advancementPipelineAssistantEnabled = true</code>{' '}
              in <code className="bg-yellow-100 px-1 rounded">lib/features.ts</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advancement AI Assistant
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <strong>Phase 1:</strong> This is a stub implementation. Pipeline features are planned for a later phase.
            All queries will return "not implemented" responses.
          </p>
        </div>
        
        <AiAssistant
          domain="advancement"
          userContext={userContext}
          provider={provider}
          placeholder="Ask Advancement Assistant…"
        />
      </div>
    </div>
  );
}
