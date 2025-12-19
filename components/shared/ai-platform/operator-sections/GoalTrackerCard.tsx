'use client';

import { useState, useEffect } from 'react';
import { PersonaGoalTracker, type GoalTimeframe } from '@/components/shared/persona-goal-tracker';
import { cn } from '@/lib/utils';
import type { AdmissionsOperatorGoalTrackerData } from '@/lib/data/provider';
import { dataClient } from '@/lib/data';
import type { DataContext } from '@/lib/data/provider';

interface GoalImpact {
  goalId: string;
  deltaLabel: string;
  deltaValue?: number;
  taskTitle?: string;
}

interface GoalTrackerCardProps {
  data: AdmissionsOperatorGoalTrackerData | null;
  goalImpacts?: GoalImpact[]; // PHASE 2: Goal impacts from completed tasks
  // Optional: Enable timeframe selector for Pipeline Team
  enableTimeframeSelector?: boolean;
  dataContext?: DataContext; // Context for fetching data when timeframe changes
}

const STORAGE_KEY = 'pipelineGoalTimeframe';

const TIMEFRAMES: Array<{ value: GoalTimeframe; label: string }> = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'fiscalYear', label: 'This fiscal year' },
];

export function GoalTrackerCard({ 
  data: initialData, 
  goalImpacts = [],
  enableTimeframeSelector = false,
  dataContext,
}: GoalTrackerCardProps) {
  const [highlightedGoalIds, setHighlightedGoalIds] = useState<Set<string>>(new Set());
  const [goalImpactMessages, setGoalImpactMessages] = useState<Map<string, string>>(new Map());
  
  // Initialize timeframe from localStorage or default to 'month'
  const getInitialTimeframe = (): GoalTimeframe => {
    if (!enableTimeframeSelector || typeof window === 'undefined') return 'month';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'week' || stored === 'month' || stored === 'quarter' || stored === 'fiscalYear') {
      return stored;
    }
    return 'month';
  };

  const [selectedTimeframe, setSelectedTimeframe] = useState<GoalTimeframe>(getInitialTimeframe());
  const [data, setData] = useState<AdmissionsOperatorGoalTrackerData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data when timeframe changes (if selector enabled)
  useEffect(() => {
    if (!enableTimeframeSelector || !dataContext) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const newData = await dataClient.getPipelineTeamGoalTracker(dataContext, selectedTimeframe);
        setData(newData);
      } catch (error) {
        console.error('Failed to load goal tracker data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe, enableTimeframeSelector, dataContext]);

  // Update data when initialData changes (for non-selector mode)
  useEffect(() => {
    if (!enableTimeframeSelector) {
      setData(initialData);
    }
  }, [initialData, enableTimeframeSelector]);

  const handleTimeframeChange = (timeframe: GoalTimeframe) => {
    setSelectedTimeframe(timeframe);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, timeframe);
    }
  };

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

  const currentTimeframe = TIMEFRAMES.find((tf) => tf.value === selectedTimeframe);

  return (
    <div className={cn(
      'transition-all duration-300',
      highlightedGoalIds.size > 0 && 'ring-2 ring-green-400 ring-opacity-50 rounded-lg p-1',
      isLoading && 'opacity-60'
    )}>
      <PersonaGoalTracker
        title={data.title}
        timeframeLabel={currentTimeframe?.label || data.timeframeLabel}
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
        timeframes={enableTimeframeSelector ? TIMEFRAMES : undefined}
        selectedTimeframe={enableTimeframeSelector ? selectedTimeframe : undefined}
        onTimeframeChange={enableTimeframeSelector ? handleTimeframeChange : undefined}
      />
    </div>
  );
}

