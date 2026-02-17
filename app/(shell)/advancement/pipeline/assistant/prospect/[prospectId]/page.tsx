'use client';

/**
 * Advancement Pipeline Assistant - Prospect Detail Page
 *
 * Route: /advancement/pipeline/assistant/prospect/[prospectId]
 * Pipeline Agent detail view with timeline and recommended actions.
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { createProviderRegistry, getProviderForDomain } from '@/lib/ai-assistant/providers/registry';
import { AdvancementPipelineProspectDetailView } from '@/components/ai-assistant/advancement-pipeline';
import type { ProspectDetail } from '@/lib/ai-assistant/providers/types';

export default function AdvancementPipelineProspectPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const prospectId = params.prospectId as string;

  const [prospect, setProspect] = useState<ProspectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const provider = useMemo(() => {
    const registry = createProviderRegistry();
    return getProviderForDomain(registry, 'advancement', {
      userId: user?.uid,
      tenantId: 'advancement',
    });
  }, [user]);

  const userContext = useMemo(
    () => ({
      userId: user?.uid,
      tenantId: 'advancement',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    }),
    [user]
  );

  useEffect(() => {
    if (!prospectId) {
      setLoading(false);
      return;
    }

    const buildDetailFromRow = (row: {
      id: string;
      name: string;
      subtitle?: string;
      priority: string;
      lastActivity: string;
      stallReasons: string[];
      officer: string;
    }): ProspectDetail => ({
      id: row.id,
      name: row.name,
      officer: row.officer,
      lastActivity: row.lastActivity,
      segment: row.subtitle,
      priority: row.priority as 'high' | 'medium' | 'low',
      overview: `${row.name} is in the pipeline. ${row.stallReasons?.length ? 'Stall reasons: ' + row.stallReasons.join(', ') : 'Consider follow-up.'}`,
      currentFindings: row.stallReasons.length ? row.stallReasons : ['No recent touchpoints'],
      whyStalled: row.stallReasons.length ? row.stallReasons : ['Early stage - monitor for activity'],
      recentActions: [],
      whatHappensNext: 'Schedule a follow-up touchpoint.',
      recommendedNextSteps: [
        { label: 'Create task', action: 'create-task' },
        { label: 'Draft email', action: 'draft-email' },
        { label: 'Send email', action: 'send-email' },
        { label: 'Tag for follow-up', action: 'tag-follow-up' },
        { label: 'Open profile', action: 'open-profile' },
        { label: 'Flag for manager review', action: 'flag-manager' },
      ],
      timeline: [],
    });

    const trySessionStorage = (): ProspectDetail | null => {
      try {
        const stored = sessionStorage.getItem('advancement-pipeline-ai-prospects');
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        for (const key of ['high', 'medium', 'low']) {
          const list = parsed[key];
          if (Array.isArray(list)) {
            const row = list.find((p: { id: string }) => p.id === prospectId);
            if (row) return buildDetailFromRow(row);
          }
        }
      } catch {
        /* ignore */
      }
      return null;
    };

    if (!provider) {
      const fromStorage = trySessionStorage();
      if (fromStorage) setProspect(fromStorage);
      setLoading(false);
      return;
    }

    provider
      .getProspectDetail(userContext, prospectId)
      .then((result) => {
        if (result.data) {
          setProspect(result.data);
        } else if (result.errors) {
          const fromStorage = trySessionStorage();
          if (fromStorage) {
            setProspect(fromStorage);
          } else {
            setError(result.errors[0]?.message || 'Failed to load prospect');
          }
        }
        setLoading(false);
      })
      .catch(() => {
        const fromStorage = trySessionStorage();
        if (fromStorage) setProspect(fromStorage);
        else setError('Failed to load prospect');
        setLoading(false);
      });
  }, [prospectId, provider, userContext]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">{error || 'Prospect not found'}</p>
        <a href="/advancement/pipeline/assistant" className="text-primary underline">
          Go back to assistant
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background">
      <AdvancementPipelineProspectDetailView
        prospect={prospect}
        onBack={handleBack}
      />
    </div>
  );
}
