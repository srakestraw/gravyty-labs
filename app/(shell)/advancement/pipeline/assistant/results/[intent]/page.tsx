'use client';

/**
 * Advancement Pipeline Assistant - Legacy Intent Route
 *
 * Route: /advancement/pipeline/assistant/results/[intent]
 * Redirects to results?prompt= for AI-generated mock data (backward compatibility).
 */

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

const INTENT_TO_PROMPT: Record<string, string> = {
  'stalled-this-week': 'Who stalled this week?',
  'likely-to-give': 'People likely to give in 30 days',
  'priority-list': 'Build my priority list for today',
  'needs-nudge': 'Who needs a nudge to keep going?',
  'at-risk-lapsing': 'Who is at risk of lapsing?',
};

export default function AdvancementPipelineResultsIntentPage() {
  const router = useRouter();
  const params = useParams();
  const intent = params.intent as string;

  useEffect(() => {
    const prompt = INTENT_TO_PROMPT[intent] || intent;
    router.replace(
      `/advancement/pipeline/assistant/results?prompt=${encodeURIComponent(prompt)}`
    );
  }, [intent, router]);

  return (
    <div className="p-8 text-center text-muted-foreground">Redirecting...</div>
  );
}
