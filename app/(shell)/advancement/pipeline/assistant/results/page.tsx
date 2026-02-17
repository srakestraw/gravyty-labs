'use client';

/**
 * Advancement Pipeline Assistant - Results Page (AI-generated)
 *
 * Route: /advancement/pipeline/assistant/results?prompt=...
 * Calls AI API to generate mock data from user prompt, shows thinking steps then result.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  AdvancementPipelineThinkingAnimation,
  AdvancementPipelineThinkingView,
  AdvancementPipelineSummaryView,
  AdvancementPipelineLikelyToGiveView,
  AdvancementPipelinePriorityListTodayView,
} from '@/components/ai-assistant/advancement-pipeline';
import type {
  StalledSummary,
  LikelyToGiveProspect,
  PriorityProspectRow,
} from '@/lib/ai-assistant/providers/types';

const STORAGE_KEY = 'advancement-pipeline-ai-prospects';

interface StalledSummaryWithProspects extends StalledSummary {
  highProspects?: PriorityProspectRow[];
  mediumProspects?: PriorityProspectRow[];
  lowProspects?: PriorityProspectRow[];
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt')?.trim();

  const [view, setView] = useState<'loading' | 'thinking' | 'summary' | 'error'>('loading');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [resultType, setResultType] = useState<string | null>(null);
  const [resultTitle, setResultTitle] = useState<string>('');
  const [resultDescription, setResultDescription] = useState<string>('');
  const [suggestedNextSteps, setSuggestedNextSteps] = useState<string[]>([]);
  const [stalledData, setStalledData] = useState<StalledSummaryWithProspects | null>(null);
  const [likelyToGiveData, setLikelyToGiveData] = useState<LikelyToGiveProspect[] | null>(null);
  const [priorityListData, setPriorityListData] = useState<PriorityProspectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prompt) {
      router.replace('/advancement/pipeline/assistant');
      return;
    }

    let cancelled = false;
    let summaryTimerId: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      try {
        const res = await fetch('/api/advancement-pipeline/generate-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const json = await res.json();

        if (cancelled) return;
        if (!res.ok) {
          setError(json.message || json.error || 'Failed to generate results');
          setView('error');
          return;
        }

        if (cancelled) return;
        setThinkingSteps(json.thinkingSteps || []);
        setResultType(json.resultType);
        setResultTitle(json.resultTitle || '');
        setResultDescription(json.resultDescription || '');
        setSuggestedNextSteps(json.suggestedNextSteps || []);
        setView('thinking');

        if (json.resultType === 'stalled_summary' && json.data) {
          const d = json.data as StalledSummaryWithProspects;
          setStalledData({
            stalledCount: d.stalledCount,
            highCount: d.highCount,
            mediumCount: d.mediumCount,
            lowCount: d.lowCount,
            highProspects: d.highProspects,
            mediumProspects: d.mediumProspects,
            lowProspects: d.lowProspects,
          });
          try {
            sessionStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                high: d.highProspects || [],
                medium: d.mediumProspects || [],
                low: d.lowProspects || [],
                prompt,
              })
            );
          } catch {
            /* ignore */
          }
        } else if (json.resultType === 'likely_to_give' && Array.isArray(json.data)) {
          setLikelyToGiveData(json.data);
        } else if (json.resultType === 'priority_list' && Array.isArray(json.data)) {
          setPriorityListData(json.data);
        }

        summaryTimerId = setTimeout(() => {
          if (!cancelled) setView('summary');
        }, 2500);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setView('error');
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (summaryTimerId) clearTimeout(summaryTimerId);
    };
  }, [prompt, router]);

  const handleViewPriority = (bucket: 'high' | 'medium' | 'low') => {
    router.push(`/advancement/pipeline/assistant/priority/${bucket}`);
  };

  if (!prompt) return null;

  if (view === 'error') {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <a href="/advancement/pipeline/assistant" className="text-primary underline">
          Go back
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background">
      {view === 'loading' && (
        <AdvancementPipelineThinkingAnimation prompt={prompt} />
      )}
      {view === 'thinking' && (
        <AdvancementPipelineThinkingView
          prompt={prompt}
          thinkingSteps={thinkingSteps}
        />
      )}
      {view === 'summary' && (
        <>
          {resultType === 'stalled_summary' && stalledData && (
            <AdvancementPipelineSummaryView
              summary={stalledData}
              onViewPriority={handleViewPriority}
              resultTitle={resultTitle}
              resultDescription={resultDescription}
              suggestedNextSteps={suggestedNextSteps}
            />
          )}
          {resultType === 'likely_to_give' && likelyToGiveData && (
            <AdvancementPipelineLikelyToGiveView
              prospects={likelyToGiveData}
              resultTitle={resultTitle}
              resultDescription={resultDescription}
              suggestedNextSteps={suggestedNextSteps}
            />
          )}
          {resultType === 'priority_list' && priorityListData && (
            <AdvancementPipelinePriorityListTodayView
              prospects={priorityListData}
              resultTitle={resultTitle}
              resultDescription={resultDescription}
              suggestedNextSteps={suggestedNextSteps}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function AdvancementPipelineResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
