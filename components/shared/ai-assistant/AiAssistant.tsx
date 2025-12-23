'use client';

/**
 * Shared AI Assistant Component
 * 
 * A reusable AI Assistant component that can be embedded in multiple modules.
 * All data access must go through the provided domain-scoped data provider.
 * 
 * @example
 * ```tsx
 * <AiAssistant
 *   domain="admissions"
 *   userContext={{ userId: 'user123', tenantId: 'org1' }}
 *   provider={admissionsProvider}
 * />
 * ```
 */

import { useEffect } from 'react';
import { useAssistantStore } from '@/lib/ai-assistant/store';
import type { Domain, UserContext } from '@/lib/ai-assistant/providers/types';
import type { AdmissionsDataProvider, AdvancementDataProvider } from '@/lib/ai-assistant/providers/types';
import type { AssistantMessage } from '@/lib/ai-assistant/types';
import { AssistantChatBar } from '@/components/ai-assistant/AssistantChatBar';
import { ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai-assistant/types';

export interface AiAssistantProps {
  domain: Domain;
  userContext: UserContext;
  provider: AdmissionsDataProvider | AdvancementDataProvider;
  placeholder?: string;
  className?: string;
}

export function AiAssistant({
  domain,
  userContext,
  provider,
  placeholder,
  className,
}: AiAssistantProps) {
  const { messages, isLoading, error, setDomain, addMessage, setLoading, setError } = useAssistantStore();

  useEffect(() => {
    setDomain(domain);
    // Add system message on mount
    addMessage({
      role: 'system',
      content: ASSISTANT_SYSTEM_PROMPT,
    });
  }, [domain, setDomain, addMessage]);

  const handleSubmit = async (prompt: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: prompt,
    });

    setLoading(true);
    setError(null);

    try {
      // Phase 1: Simple echo response with provider awareness
      // In future phases, this would integrate with LLM runtime
      const response = await handleAssistantQuery(domain, provider, userContext, prompt);
      
      addMessage({
        role: 'assistant',
        content: response.content,
        metadata: response.metadata,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      addMessage({
        role: 'assistant',
        content: `I encountered an error: ${errorMessage}. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultPlaceholder = 
    domain === 'admissions' 
      ? 'Ask Admissions Assistant…'
      : 'Ask Advancement Assistant…';

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Messages */}
        <div className="space-y-4 min-h-[400px]">
          {messages
            .filter(m => m.role !== 'system')
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.sources && message.metadata.sources.length > 0 && (
                    <div className="mt-2 text-xs opacity-70">
                      Sources: {message.metadata.sources.map(s => s.name || s.id).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-destructive/10 text-destructive rounded-lg p-4">
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <AssistantChatBar
          onSubmit={handleSubmit}
          placeholder={placeholder || defaultPlaceholder}
          showSuggestedPrompts={false}
        />
      </div>
    </div>
  );
}

/**
 * Handle assistant query using domain provider
 * Phase 1: Simple pattern matching and provider calls
 * Future: Integrate with LLM runtime
 */
async function handleAssistantQuery(
  domain: Domain,
  provider: AdmissionsDataProvider | AdvancementDataProvider,
  userContext: UserContext,
  prompt: string
): Promise<{ content: string; metadata?: AssistantMessage['metadata'] }> {
  const promptLower = prompt.toLowerCase();

  // Admissions domain handlers
  if (domain === 'admissions') {
    const admissionsProvider = provider as AdmissionsDataProvider;

    // Pattern: "get applicant [id]" or "show applicant [id]"
    const applicantMatch = prompt.match(/(?:get|show|find)\s+applicant\s+(\w+)/i);
    if (applicantMatch) {
      const applicantId = applicantMatch[1];
      const result = await admissionsProvider.getApplicantSummary(userContext, applicantId);
      
      if (result.errors) {
        return {
          content: `Error: ${result.errors[0].message}`,
        };
      }
      
      if (result.data) {
        return {
          content: `**Applicant Summary**\n\nName: ${result.data.name}\nEmail: ${result.data.email || 'N/A'}\nStatus: ${result.data.status}\nProgram: ${result.data.program || 'N/A'}`,
          metadata: {
            sources: result.sources,
            confidence: result.confidence,
          },
        };
      }
    }

    // Pattern: "search applicants [query]"
    const searchMatch = prompt.match(/search\s+applicants\s+(.+)/i);
    if (searchMatch) {
      const query = searchMatch[1];
      const result = await admissionsProvider.searchApplicants(userContext, query);
      
      if (result.errors) {
        return {
          content: `Error: ${result.errors[0].message}`,
        };
      }
      
      if (result.data) {
        const count = result.data.applicants.length;
        const total = result.data.total;
        return {
          content: `Found ${count} of ${total} applicants matching "${query}".\n\n${result.data.applicants.slice(0, 5).map(a => `- ${a.name} (${a.status})`).join('\n')}${total > 5 ? '\n...' : ''}`,
          metadata: {
            sources: result.sources,
            confidence: result.confidence,
          },
        };
      }
    }

    // Pattern: "queue snapshot" or "show queue"
    if (promptLower.includes('queue') && (promptLower.includes('snapshot') || promptLower.includes('show'))) {
      const result = await admissionsProvider.getQueueSnapshot(userContext);
      
      if (result.errors) {
        return {
          content: `Error: ${result.errors[0].message}`,
        };
      }
      
      if (result.data) {
        return {
          content: `**Queue Snapshot**\n\nTotal Items: ${result.data.totalItems}\n\nBy Status:\n${Object.entries(result.data.itemsByStatus).map(([status, count]) => `- ${status}: ${count}`).join('\n')}`,
          metadata: {
            sources: result.sources,
            confidence: result.confidence,
          },
        };
      }
    }
  }

  // Advancement domain handlers
  if (domain === 'advancement') {
    const advancementProvider = provider as AdvancementDataProvider;

    // All advancement queries return "not implemented" in Phase 1
    if (promptLower.includes('donor') || promptLower.includes('prospect') || promptLower.includes('pipeline')) {
      const result = await advancementProvider.getDonorSummary(userContext, 'test');
      // This will always return an error in Phase 1
      if (result.errors) {
        return {
          content: result.errors[0].message,
        };
      }
    }
  }

  // Default response
  return {
    content: `I understand you're asking about "${prompt}". In Phase 1, I can help with:\n\n**Admissions:**\n- Get applicant summary: "get applicant [id]"\n- Search applicants: "search applicants [query]"\n- Queue snapshot: "show queue"\n\n**Advancement:**\n- Pipeline features are planned for a later phase.`,
  };
}

