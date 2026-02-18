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

    const run = async () => {
      try {
        // Phase 1: Get thinking steps (fast, small response)
        const stepsRes = await fetch('/api/advancement-pipeline/generate-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode: 'steps' }),
        });
        const stepsJson = await stepsRes.json();

        if (cancelled) return;
        if (!stepsRes.ok) {
          setError(stepsJson.message || stepsJson.error || 'Failed to generate results');
          setView('error');
          return;
        }

        if (cancelled) return;
        setThinkingSteps(stepsJson.thinkingSteps || []);
        setResultType(stepsJson.resultType);
        setResultTitle(stepsJson.resultTitle || '');
        setResultDescription(stepsJson.resultDescription || '');
        setSuggestedNextSteps(stepsJson.suggestedNextSteps || []);
        setView('thinking');

        // Phase 2: Get data (heavier call, runs while user sees thinking steps)
        const dataRes = await fetch('/api/advancement-pipeline/generate-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode: 'data', resultType: stepsJson.resultType }),
        });
        const dataJson = await dataRes.json();

        if (cancelled) return;
        if (!dataRes.ok) {
          setError(dataJson.message || dataJson.error || 'Failed to load results');
          setView('error');
          return;
        }

        if (cancelled) return;
        const rt = stepsJson.resultType;
        const d = dataJson.data;

        if (rt === 'stalled_summary' && d) {
          const stalled = d as StalledSummaryWithProspects;
          setStalledData({
            stalledCount: stalled.stalledCount,
            highCount: stalled.highCount,
            mediumCount: stalled.mediumCount,
            lowCount: stalled.lowCount,
            highProspects: stalled.highProspects,
            mediumProspects: stalled.mediumProspects,
            lowProspects: stalled.lowProspects,
          });
          try {
            sessionStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                high: stalled.highProspects || [],
                medium: stalled.mediumProspects || [],
                low: stalled.lowProspects || [],
                prompt,
              })
            );
          } catch {
            /* ignore */
          }
        } else if (rt === 'likely_to_give' && Array.isArray(d)) {
          setLikelyToGiveData(d);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ likelyToGive: d, prompt }));
          } catch {
            /* ignore */
          }
        } else if (rt === 'priority_list' && Array.isArray(d)) {
          setPriorityListData(d);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ priorityList: d, prompt }));
          } catch {
            /* ignore */
          }
        }

        // Use metadata from data response if provided (e.g. fallback mode)
        if (dataJson.resultTitle) setResultTitle(dataJson.resultTitle);
        if (dataJson.resultDescription) setResultDescription(dataJson.resultDescription);
        if (Array.isArray(dataJson.suggestedNextSteps)) setSuggestedNextSteps(dataJson.suggestedNextSteps);

        if (!cancelled) setView('summary');
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
