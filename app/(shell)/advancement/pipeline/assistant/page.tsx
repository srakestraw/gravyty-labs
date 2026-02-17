'use client';

/**
 * Advancement Pipeline Assistant - Landing Page
 *
 * Route: /advancement/pipeline/assistant
 * All prompts (quick actions or free-form) navigate to results with prompt for AI-generated mock data.
 */

import { useRouter } from 'next/navigation';
import { AdvancementPipelineLandingView } from '@/components/ai-assistant/advancement-pipeline';

export default function AdvancementPipelineAssistantPage() {
  const router = useRouter();

  const handlePromptSelect = (prompt: string) => {
    const trimmed = prompt?.trim();
    if (!trimmed) return;
    router.push(
      `/advancement/pipeline/assistant/results?prompt=${encodeURIComponent(trimmed)}`
    );
  };

  return (
    <div className="min-h-screen pb-32 bg-background">
      <AdvancementPipelineLandingView onPromptSelect={handlePromptSelect} />
    </div>
  );
}
