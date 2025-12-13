'use client';

import { useState, useEffect } from 'react';
import { PersonaGoalTracker } from '@/components/shared/persona-goal-tracker';
import { cn } from '@/lib/utils';
import type { AdmissionsOperatorGoalTrackerData } from '@/lib/data/provider';

interface GoalImpact {
  goalId: string;
  deltaLabel: string;
  deltaValue?: number;
  taskTitle?: string;
}

interface GoalTrackerCardProps {
  data: AdmissionsOperatorGoalTrackerData | null;
  goalImpacts?: GoalImpact[]; // PHASE 2: Goal impacts from completed tasks
}

export function GoalTrackerCard({ data, goalImpacts = [] }: GoalTrackerCardProps) {
  const [highlightedGoalIds, setHighlightedGoalIds] = useState<Set<string>>(new Set());
  const [goalImpactMessages, setGoalImpactMessages] = useState<Map<string, string>>(new Map());

  // PHASE 2: Handle goal impact highlights
  useEffect(() => {
    if (!goalImpacts.length || !data) return;

    const newHighlights = new Set<string>();
    const newMessages = new Map<string, string>();

    goalImpacts.forEach((impact) => {
      const goal = data.metrics.find((m) => m.id === impact.goalId);
      if (goal) {
        newHighlights.add(impact.goalId);
        
        // Build microcopy message
        const deltaText = impact.deltaValue !== undefined 
          ? `+${impact.deltaValue}` 
          : '';
        const message = impact.taskTitle 
          ? `From: ${impact.taskTitle} ${deltaText}`.trim()
          : `${impact.deltaLabel} ${deltaText}`.trim();
        
        newMessages.set(impact.goalId, message);
      }
    });

    setHighlightedGoalIds(newHighlights);
    setGoalImpactMessages(newMessages);

    // Fade out after 3 seconds
    const timer = setTimeout(() => {
      setHighlightedGoalIds(new Set());
      setGoalImpactMessages(new Map());
    }, 3000);

    return () => clearTimeout(timer);
  }, [goalImpacts, data]);

  if (!data) return null;

  return (
    <div className={cn(
      'transition-all duration-300',
      highlightedGoalIds.size > 0 && 'ring-2 ring-green-400 ring-opacity-50 rounded-lg p-1'
    )}>
      <PersonaGoalTracker
        title={data.title}
        timeframeLabel={data.timeframeLabel}
        subtitle={data.subtitle}
        metrics={data.metrics.map((m) => ({
          id: m.id,
          label: m.label,
          current: m.current,
          target: m.target,
          unit: m.unit,
          trend: m.trend,
          status: m.status as 'on-track' | 'slightly-behind' | 'at-risk' | undefined,
          // PHASE 2: Pass highlight state and impact message
          highlight: highlightedGoalIds.has(m.id),
          impactMessage: goalImpactMessages.get(m.id),
        }))}
      />
    </div>
  );
}

