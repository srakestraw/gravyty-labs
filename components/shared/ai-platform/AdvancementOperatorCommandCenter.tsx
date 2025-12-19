'use client';

import { useState, useEffect } from 'react';
import { dataClient } from '@/lib/data';
import type {
  AdmissionsOperatorTodaysFocusData,
  AdmissionsOperatorGamePlanData,
  AdmissionsOperatorMomentumData,
  AdmissionsOperatorFlaggedRiskData,
  AdmissionsOperatorGoalTrackerData,
  AdmissionsOperatorAssistantData,
  AdmissionsOperatorRecentWinData,
  AdmissionsOperatorRecentActivityData,
} from '@/lib/data/provider';
import {
  TodaysFocusCard,
  RotatingMomentumCard,
  TodaysGamePlanCard,
  FlaggedRisksCard,
  GoalTrackerCard,
  AssistantsWorkingCard,
  RecentWinsCard,
  RecentActivityCard,
  RecommendedAgentsCard,
} from './operator-sections';
import { getAiPlatformBasePath } from './types';
import type { AiPlatformPageContext } from './types';

/**
 * Advancement Pipeline Team Command Center with two-column layout.
 * Answers "What should I focus on today?" with Today's Game Plan as the dominant execution surface.
 */
export function AdvancementOperatorCommandCenter({ 
  context,
  recommendedAgents = [],
  basePath,
}: { 
  context?: AiPlatformPageContext;
  recommendedAgents?: Array<{ id: string; name: string; purpose: string }>;
  basePath?: string;
}) {
  const [todaysFocus, setTodaysFocus] = useState<AdmissionsOperatorTodaysFocusData | null>(null);
  const [gamePlan, setGamePlan] = useState<AdmissionsOperatorGamePlanData | null>(null);
  const [momentum, setMomentum] = useState<AdmissionsOperatorMomentumData | null>(null);
  const [flaggedRisks, setFlaggedRisks] = useState<AdmissionsOperatorFlaggedRiskData[]>([]);
  const [goalTracker, setGoalTracker] = useState<AdmissionsOperatorGoalTrackerData | null>(null);
  const [assistants, setAssistants] = useState<AdmissionsOperatorAssistantData[]>([]);
  const [recentWins, setRecentWins] = useState<AdmissionsOperatorRecentWinData[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdmissionsOperatorRecentActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveBasePath = basePath || getAiPlatformBasePath(context);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const ctx = {
        workspace: 'advancement',
        app: 'advancement',
        mode: 'team' as const,
      };

      try {
        const [
          focusData,
          gamePlanData,
          momentumData,
          risksData,
          goalData,
          assistantsData,
          winsData,
          activityData,
        ] = await Promise.all([
          dataClient.getPipelineTeamTodaysFocus(ctx),
          dataClient.getPipelineTeamGamePlan(ctx),
          dataClient.getPipelineTeamMomentum(ctx),
          dataClient.getPipelineTeamFlaggedRisks(ctx),
          dataClient.getPipelineTeamGoalTracker(ctx),
          dataClient.getPipelineTeamAssistants(ctx),
          dataClient.getPipelineTeamRecentWins(ctx),
          dataClient.getPipelineTeamRecentActivity(ctx),
        ]);

        setTodaysFocus(focusData);
        setGamePlan(gamePlanData);
        setMomentum(momentumData);
        setFlaggedRisks(risksData);
        setGoalTracker(goalData);
        setAssistants(assistantsData);
        setRecentWins(winsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to load Pipeline Team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-32 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-96 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-64 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-48 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-48 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-64 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-48 animate-pulse" />
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* LEFT COLUMN */}
      <div className="space-y-4">
        {/* Compact Today's Focus - framing cue for Game Plan */}
        <TodaysFocusCard data={todaysFocus} />
        {/* Today's Game Plan immediately follows with minimal gap */}
        <TodaysGamePlanCard data={gamePlan} basePath={effectiveBasePath} />
        {/* Goal Tracker in left column only */}
        <GoalTrackerCard 
          data={goalTracker} 
          goalImpacts={gamePlan?.items
            .filter((item) => item.status === 'completed' && item.goalImpacts && item.goalImpacts.length > 0)
            .flatMap((item) => 
              (item.goalImpacts || []).map((impact) => ({
                ...impact,
                taskTitle: item.title,
              }))
            ) || []}
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-4">
        <RotatingMomentumCard data={momentum} />
        <FlaggedRisksCard data={flaggedRisks} />
        <RecentWinsCard data={recentWins} />
        <AssistantsWorkingCard data={assistants} basePath={effectiveBasePath} />
        {recommendedAgents.length > 0 && (
          <RecommendedAgentsCard agents={recommendedAgents} basePath={effectiveBasePath} />
        )}
        <RecentActivityCard data={recentActivity} basePath={effectiveBasePath} />
      </div>
    </div>
  );
}

