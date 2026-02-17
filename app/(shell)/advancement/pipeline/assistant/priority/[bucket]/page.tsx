'use client';

/**
 * Advancement Pipeline Assistant - Priority Bucket List Page
 *
 * Route: /advancement/pipeline/assistant/priority/[bucket]
 * Table of prospects for the selected priority bucket.
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { createProviderRegistry, getProviderForDomain } from '@/lib/ai-assistant/providers/registry';
import { AdvancementPipelinePriorityListView } from '@/components/ai-assistant/advancement-pipeline';
import type { PriorityProspectRow, PriorityBucket } from '@/lib/ai-assistant/providers/types';

const VALID_BUCKETS: PriorityBucket[] = ['high', 'medium', 'low'];
const STORAGE_KEY = 'advancement-pipeline-ai-prospects';

export default function AdvancementPipelinePriorityPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const bucket = params.bucket as string;

  const [prospects, setProspects] = useState<PriorityProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [backUrl, setBackUrl] = useState('/advancement/pipeline/assistant');

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
    if (!bucket || !VALID_BUCKETS.includes(bucket as PriorityBucket)) {
      setLoading(false);
      return;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const list = parsed[bucket as 'high' | 'medium' | 'low'];
        if (Array.isArray(list) && list.length > 0) {
          setProspects(list);
          if (parsed.prompt) {
            setBackUrl(`/advancement/pipeline/assistant/results?prompt=${encodeURIComponent(parsed.prompt)}`);
          }
          setLoading(false);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    if (!provider) {
      setLoading(false);
      return;
    }

    provider
      .getPriorityBucket(userContext, bucket as PriorityBucket)
      .then((result) => {
        if (result.data) setProspects(result.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bucket, provider, userContext]);

  const handleProspectClick = (prospectId: string) => {
    router.push(`/advancement/pipeline/assistant/prospect/${prospectId}`);
  };

  const handleBack = () => {
    router.push(backUrl);
  };

  if (!VALID_BUCKETS.includes(bucket)) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid bucket. <a href="/advancement/pipeline/assistant" className="text-primary underline">Go back</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background">
      <AdvancementPipelinePriorityListView
        prospects={prospects}
        bucket={bucket as PriorityBucket}
        onProspectClick={handleProspectClick}
        onBack={handleBack}
      />
    </div>
  );
}
