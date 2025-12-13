'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IdleView } from '@/components/ai-assistant/views/IdleView';
import { ThinkingView } from '@/components/ai-assistant/views/ThinkingView';
import { SummaryView } from '@/components/ai-assistant/views/SummaryView';
import { PriorityListView } from '@/components/ai-assistant/views/PriorityListView';
import { CaseDetailView } from '@/components/ai-assistant/views/CaseDetailView';
import { AssistantChatBar } from '@/components/ai-assistant/AssistantChatBar';
import {
  mockSummaryData,
  mockPriorityCases,
  mockCaseDetails,
  PriorityCase,
} from '@/data/ai-assistant';
import type { AiPlatformPageContext } from '@/components/shared/ai-platform/types';
import { getAiPlatformBasePath } from '@/components/shared/ai-platform/types';
import { getSegmentFromSearchParams } from '@/components/shared/ai-platform/segments/segment-context';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

type AssistantView = 'idle' | 'thinking' | 'summary' | 'priority-list' | 'case-detail';

interface AssistantState {
  view: AssistantView;
  prompt: string;
  thinkingSteps: string[];
  summary?: typeof mockSummaryData;
  selectedPriority?: 'high' | 'medium' | 'low';
  selectedPersonId?: string;
}

export function AssistantPageClient({ context }: { context?: AiPlatformPageContext }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AssistantState>({
    view: 'idle',
    prompt: '',
    thinkingSteps: [],
  });

  // Detect active segment: prefer context, then URL param
  const activeSegment = useMemo(() => {
    if (context?.activeSegment) return context.activeSegment;
    if (context?.activeSegmentId) {
      // Look up segment from mock data
      const { getSegmentById } = require('@/components/shared/ai-platform/segments/mock-data');
      return getSegmentById(context.activeSegmentId);
    }
    // Fall back to URL param
    const urlSegment = getSegmentFromSearchParams(Object.fromEntries(searchParams.entries()));
    return urlSegment;
  }, [context, searchParams]);

  const basePath = getAiPlatformBasePath(context);

  // Generate segment-aware suggestions
  const segmentSuggestions = useMemo(() => {
    if (!activeSegment) return [];
    return [
      `Summarize outreach opportunities for ${activeSegment.title}`,
      `Draft a follow-up message for contacts in ${activeSegment.title}`,
      `What actions should I take for ${activeSegment.title}?`,
    ];
  }, [activeSegment]);

  // Clear segment from URL
  const handleClearSegment = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('segment');
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl);
  };

  // Filter cases by priority when viewing priority list
  const filteredCases: PriorityCase[] =
    state.selectedPriority && state.view === 'priority-list'
      ? mockPriorityCases.filter((c) => c.priority === state.selectedPriority)
      : [];

  // Get case detail when viewing case detail
  const caseDetail =
    state.selectedPersonId && state.view === 'case-detail'
      ? mockCaseDetails[state.selectedPersonId]
      : undefined;

  // Handle prompt submission
  const handlePromptSubmit = (prompt: string) => {
    setState({
      view: 'thinking',
      prompt,
      thinkingSteps: [],
    });

    // Simulate thinking process - transition to summary after delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        view: 'summary',
        summary: mockSummaryData,
      }));
    }, 3000); // 3 seconds of thinking
  };

  // Handle viewing priority list
  const handleViewPriority = (priority: 'high' | 'medium' | 'low') => {
    setState((prev) => ({
      ...prev,
      view: 'priority-list',
      selectedPriority: priority,
    }));
  };

  // Handle case click
  const handleCaseClick = (caseId: string) => {
    setState((prev) => ({
      ...prev,
      view: 'case-detail',
      selectedPersonId: caseId,
    }));
  };

  // Handle back navigation
  const handleBack = () => {
    if (state.view === 'case-detail') {
      setState((prev) => ({
        ...prev,
        view: 'priority-list',
        selectedPersonId: undefined,
      }));
    } else if (state.view === 'priority-list') {
      setState((prev) => ({
        ...prev,
        view: 'summary',
        selectedPriority: undefined,
      }));
    }
  };

  // Show chat bar for all views except idle (which has its own input)
  const showChatBar = state.view !== 'idle';

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Segment Banner */}
      {activeSegment && (
        <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon="fa-solid fa-filter" className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">
                Working with segment: <span className="font-semibold text-blue-900">{activeSegment.title}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSegment}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Clear segment
              </Button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.view === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IdleView onPromptSelect={handlePromptSubmit} customSuggestions={segmentSuggestions} />
          </motion.div>
        )}

        {state.view === 'thinking' && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <ThinkingView prompt={state.prompt} />
          </motion.div>
        )}

        {state.view === 'summary' && state.summary && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <SummaryView summary={state.summary} onViewPriority={handleViewPriority} />
          </motion.div>
        )}

        {state.view === 'priority-list' && state.selectedPriority && (
          <motion.div
            key="priority-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <PriorityListView
              cases={filteredCases}
              priority={state.selectedPriority}
              onCaseClick={handleCaseClick}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {state.view === 'case-detail' && caseDetail && (
          <motion.div
            key="case-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <CaseDetailView caseDetail={caseDetail} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {showChatBar && <AssistantChatBar onSubmit={handlePromptSubmit} showSuggestedPrompts={false} />}
    </div>
  );
}



