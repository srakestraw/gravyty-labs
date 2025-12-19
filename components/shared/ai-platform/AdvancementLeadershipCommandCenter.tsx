'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { dataClient } from '@/lib/data';
import type { 
  PipelineLeadershipStatusSummaryData,
  PipelineLeadershipKeyRiskOrOpportunity,
  PipelineLeadershipIntervention,
  PipelineLeadershipInsightsData,
  PipelineLeadershipForecastData,
  PipelineLeadershipPortfolioHealthData,
  PipelineLeadershipTeamForecastSnapshotData,
  AdmissionsOperatorFlaggedRiskData,
  AdmissionsOperatorRecentWinData,
  AdmissionsOperatorAssistantData,
  AdmissionsOperatorRecentActivityData,
} from '@/lib/data/provider';
import { PipelineLeadershipForecastCard } from './operator-sections/PipelineLeadershipForecastCard';
import { PortfolioHealthCard } from './operator-sections/PortfolioHealthCard';
import { PipelineLeadershipTeamForecastSnapshotCard } from './operator-sections/PipelineLeadershipTeamForecastSnapshotCard';
import { PipelineInsightsAndTrackingSection } from './operator-sections/PipelineInsightsAndTrackingSection';
import { FlaggedRisksCard } from './operator-sections/FlaggedRisksCard';
import { RecentWinsCard } from './operator-sections/RecentWinsCard';
import { AssistantsWorkingCard } from './operator-sections/AssistantsWorkingCard';
import { RecommendedAgentsCard } from './operator-sections/RecommendedAgentsCard';
import { RecentActivityCard } from './operator-sections/RecentActivityCard';
import type { AiPlatformPageContext } from './types';
import { getAiPlatformBasePath } from './types';

/**
 * Leadership mode for Advancement Pipeline Command Center.
 * Leader-focused experience with forecast, portfolio health, and interventions.
 */
export function AdvancementLeadershipCommandCenter({ 
  context,
  recommendedAgents = [],
  basePath,
}: { 
  context?: AiPlatformPageContext;
  recommendedAgents?: Array<{ id: string; name: string; purpose: string }>;
  basePath?: string;
}) {
  const { user } = useAuth();
  const [statusSummary, setStatusSummary] = useState<PipelineLeadershipStatusSummaryData | null>(null);
  const [keyRisksAndOpportunities, setKeyRisksAndOpportunities] = useState<PipelineLeadershipKeyRiskOrOpportunity[]>([]);
  const [whatChanged, setWhatChanged] = useState<string[]>([]);
  const [recommendedInterventions, setRecommendedInterventions] = useState<PipelineLeadershipIntervention[]>([]);
  const [whatToWatchNext, setWhatToWatchNext] = useState<string[]>([]);
  const [insights, setInsights] = useState<PipelineLeadershipInsightsData | null>(null);
  const [portfolioHealth, setPortfolioHealth] = useState<PipelineLeadershipPortfolioHealthData | null>(null);
  const [teamForecastSnapshot, setTeamForecastSnapshot] = useState<PipelineLeadershipTeamForecastSnapshotData | null>(null);
  const [forecast, setForecast] = useState<PipelineLeadershipForecastData | null>(null);
  const [flaggedRisks, setFlaggedRisks] = useState<AdmissionsOperatorFlaggedRiskData[]>([]);
  const [recentWins, setRecentWins] = useState<AdmissionsOperatorRecentWinData[]>([]);
  const [assistants, setAssistants] = useState<AdmissionsOperatorAssistantData[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdmissionsOperatorRecentActivityData[]>([]);

  const effectiveBasePath = basePath || getAiPlatformBasePath(context) || '/advancement/pipeline';

  useEffect(() => {
    const loadData = async () => {
      const ctx = {
        workspace: 'advancement',
        app: 'advancement',
        mode: 'leadership' as const,
        userId: user?.id,
      };

      try {
        const [
          statusSummaryData,
          keyRisksData,
          whatChangedData,
          interventionsData,
          whatToWatchData,
          insightsData,
          portfolioHealthData,
          teamForecastSnapshotData,
          forecastData,
          risksData,
          winsData,
          assistantsData,
          activityData,
        ] = await Promise.all([
          dataClient.getPipelineLeadershipStatusSummary(ctx),
          dataClient.getPipelineLeadershipKeyRisksAndOpportunities(ctx),
          dataClient.getPipelineLeadershipWhatChanged(ctx),
          dataClient.getPipelineLeadershipRecommendedInterventions(ctx),
          dataClient.getPipelineLeadershipWhatToWatchNext(ctx),
          dataClient.getPipelineLeadershipInsightsAndTracking(ctx),
          dataClient.getPipelineLeadershipPortfolioHealth(ctx),
          dataClient.getPipelineLeadershipTeamForecastSnapshot(ctx),
          dataClient.getPipelineLeadershipForecast(ctx),
          dataClient.getPipelineLeadershipFlaggedRisks(ctx),
          dataClient.getPipelineLeadershipRecentWins(ctx),
          dataClient.getPipelineLeadershipAssistants(ctx),
          dataClient.getPipelineLeadershipRecentActivity(ctx),
        ]);

        setStatusSummary(statusSummaryData);
        setKeyRisksAndOpportunities(keyRisksData);
        setWhatChanged(whatChangedData);
        setRecommendedInterventions(interventionsData);
        setWhatToWatchNext(whatToWatchData);
        setInsights(insightsData);
        setPortfolioHealth(portfolioHealthData);
        setTeamForecastSnapshot(teamForecastSnapshotData);
        setForecast(forecastData);
        setFlaggedRisks(risksData);
        setRecentWins(winsData);
        setAssistants(assistantsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to load leadership data:', error);
      }
    };

    loadData();
  }, [user?.id]);

  // Mock user name - in real app, this would come from auth context
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Alex';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!statusSummary && !keyRisksAndOpportunities.length && !forecast) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading leadership data...</p>
        </div>
      </div>
    );
  }

  // Helper function to handle CTA actions (no-op for now)
  const handleInterventionAction = (actionKey: string) => {
    // TODO: Wire to actual routes/pages when available
    console.log('Intervention action:', actionKey);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 block mb-1">
              Advancement Workspace
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}.
            </h2>
            <p className="text-sm text-gray-600">
              Make strategic decisions to protect your forecast and guide your team's priorities.
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          {/* 1. Status Summary */}
          {statusSummary && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Summary</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                {statusSummary.statusSummary}
              </p>
            </div>
          )}

          {/* Portfolio Health - placed after Status Summary */}
          <PortfolioHealthCard data={portfolioHealth} />

          {/* 2. Key Risks & Opportunities */}
          {keyRisksAndOpportunities.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Risks & Opportunities</h3>
              <div className="space-y-4">
                {keyRisksAndOpportunities.map((item) => {
                  const borderColor = 
                    item.type === 'opportunity' ? 'border-green-500' :
                    item.severity === 'high' ? 'border-red-500' :
                    item.severity === 'medium' ? 'border-orange-500' :
                    'border-gray-400';
                  
                  return (
                    <div key={item.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Forecast impact: {item.forecastImpactLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Forecast Snapshot - placed near Key Risks */}
          <PipelineLeadershipTeamForecastSnapshotCard data={teamForecastSnapshot} />

          {/* 3. What Changed */}
          {whatChanged.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Changed</h3>
              <p className="text-sm text-gray-600 mb-3">
                The following changes explain the current forecast gap:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                {whatChanged.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Recommended Interventions */}
          {recommendedInterventions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Interventions</h3>
              <div className="space-y-4">
                {recommendedInterventions.map((intervention, index) => (
                  <div key={intervention.id}>
                    <p className="text-sm text-gray-700 mb-2">
                      {intervention.primaryOwner && (
                        <span className="font-medium text-gray-600">{intervention.primaryOwner}: </span>
                      )}
                      <span className="font-semibold text-gray-900">{index + 1}. {intervention.title}</span> {intervention.rationale}
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500">Estimated impact: {intervention.estimatedImpact}</span>
                    </div>
                    {intervention.ctas.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {intervention.ctas.map((cta, ctaIndex) => (
                          <Button
                            key={cta.actionKey}
                            variant={index === recommendedInterventions.length - 1 && ctaIndex === 0 ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleInterventionAction(cta.actionKey)}
                          >
                            {cta.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. What to Watch Next */}
          {whatToWatchNext.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Watch Next</h3>
              <p className="text-sm text-gray-600 mb-3">
                We expect improvement if the forecast is recovering:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                {whatToWatchNext.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Insights & Tracking */}
          <PipelineInsightsAndTrackingSection insights={insights} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Forecast */}
          {forecast && <PipelineLeadershipForecastCard data={forecast} />}
          
          {/* Flagged Risks */}
          <FlaggedRisksCard data={flaggedRisks} />
          
          {/* Recent Wins */}
          <RecentWinsCard data={recentWins} />
          
          {/* Assistants */}
          <AssistantsWorkingCard data={assistants} basePath={effectiveBasePath} />
          
          {/* Recommended Agents */}
          {recommendedAgents.length > 0 && (
            <RecommendedAgentsCard agents={recommendedAgents} basePath={effectiveBasePath} />
          )}
          
          {/* Recent Activity */}
          <RecentActivityCard data={recentActivity} basePath={effectiveBasePath} />
        </div>
      </div>
    </div>
  );
}

