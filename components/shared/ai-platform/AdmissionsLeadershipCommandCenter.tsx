'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { dataClient } from '@/lib/data';
import type { 
  AdmissionsLeadershipTrendData,
  AdmissionsLeadershipBottleneckData,
  AdmissionsLeadershipData,
  AdmissionsLeadershipInsights,
} from '@/lib/data/provider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InsightsAndTrackingSection } from './InsightsAndTrackingSection';

/**
 * Leadership mode for Admissions Command Center.
 * Forecast-led, decision-focused experience that answers:
 * 1. Where will we land if we do nothing? (Forecast)
 * 2. Where is the risk or opportunity? (Admissions-owned)
 * 3. Why is this happening? (What changed)
 * 4. What should we do now? (Interventions with forecast impact)
 * 
 * Goals are used only as secondary contextual reference, never as primary drivers.
 */
export function AdmissionsLeadershipCommandCenter() {
  const [leadershipData, setLeadershipData] = useState<AdmissionsLeadershipData | null>(null);
  const [insightsData, setInsightsData] = useState<AdmissionsLeadershipInsights | null>(null);
  const [trendData, setTrendData] = useState<AdmissionsLeadershipTrendData | null>(null);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        mode: 'leadership' as const,
      };

      // Load main leadership data
      try {
        const data = await dataClient.getAdmissionsLeadershipData(ctx);
        setLeadershipData(data);
      } catch (error) {
        console.error('Failed to load leadership data:', error);
        setLeadershipData(null);
      }

      // Load insights data
      try {
        const insights = await dataClient.getAdmissionsLeadershipInsights(ctx);
        setInsightsData(insights);
      } catch (error) {
        console.error('Failed to load insights data:', error);
        setInsightsData(null);
      }

      // Load trend data (optional, for small inline chart)
      setIsLoadingTrend(true);
      try {
        const trend = await dataClient.getAdmissionsLeadershipTrend(ctx);
        setTrendData(trend);
      } catch (error) {
        console.error('Failed to load trend data:', error);
        setTrendData(null);
      } finally {
        setIsLoadingTrend(false);
      }
    };

    loadData();
  }, []);

  // Format trend data for optional small chart
  const trendChartData = trendData
    ? trendData.dates.map((date, index) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        deposits: trendData.deposits[index],
      }))
    : [];

  if (!leadershipData) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading leadership data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leadership-to-team alignment line */}
      {leadershipData.alignmentSummary && (
        <div className="bg-blue-50/50 border-l-2 border-blue-400 pl-3 py-2 rounded">
          <p className="text-sm text-gray-700 font-medium">{leadershipData.alignmentSummary}</p>
        </div>
      )}

      {/* 1. Status Summary (Narrative, Forecast-Led) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Summary</h3>
        <p className="text-base text-gray-700 leading-relaxed">
          {leadershipData.statusSummary}
        </p>
        {/* Optional small inline chart - visually secondary, reduced height */}
        {trendData && trendChartData.length > 0 && !isLoadingTrend && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Deposit trend (last 14 days)</p>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#e5e7eb"
                  height={20}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  stroke="#e5e7eb"
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '11px',
                    padding: '4px 8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="#8b5cf6" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Key Risks & Opportunities (Admissions-Owned, Forecast-Impact Focused) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Risks & Opportunities</h3>
        <div className="space-y-4">
          {leadershipData.keyRisksAndOpportunities.map((risk) => {
            const borderColor = 
              risk.severity === 'high' ? 'border-red-500' :
              risk.severity === 'medium' ? 'border-orange-500' :
              risk.severity === 'opportunity' ? 'border-green-500' :
              'border-gray-400';
            
            return (
              <div key={risk.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {risk.title}
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  {risk.description}
                </p>
                <p className="text-xs text-gray-500">
                  Forecast impact: {risk.forecastImpact}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Upstream Demand Signals (Context Only) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upstream Demand Signals</h3>
        <p className="text-sm text-gray-600 mb-3">
          The following signals reflect upstream demand and are provided for context only. These are not within Admissions' direct control.
        </p>
        <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
          {leadershipData.upstreamDemandSignals.map((signal, index) => (
            <li key={index}>{signal}</li>
          ))}
        </ul>
      </div>

      {/* 4. What Changed (Delta-Based, Forecast-Affecting) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What Changed</h3>
        <p className="text-sm text-gray-600 mb-3">
          The following changes explain the current forecast gap:
        </p>
        <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
          {leadershipData.whatChanged.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </div>

      {/* 5. Recommended Interventions (Forecast-Driven) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Interventions</h3>
        {leadershipData.interventionToTeamNote && (
          <p className="text-sm text-gray-600 mb-4">
            {leadershipData.interventionToTeamNote}
          </p>
        )}
        <div className="space-y-4">
          {leadershipData.recommendedInterventions.map((intervention, index) => (
            <div key={intervention.id}>
              <p className="text-sm text-gray-700 mb-2">
                {intervention.ownerLabel && (
                  <span className="font-medium text-gray-600">{intervention.ownerLabel}: </span>
                )}
                <span className="font-semibold text-gray-900">{index + 1}. {intervention.title}</span> {intervention.description}
              </p>
              {intervention.cta && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant={index === leadershipData.recommendedInterventions.length - 1 ? 'default' : 'outline'} 
                    size="sm" 
                    className="text-xs"
                  >
                    {intervention.cta.label}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. What to Watch Next (Forecast Validation Signals) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Watch Next</h3>
        <p className="text-sm text-gray-600 mb-3">
          We expect improvement if the forecast is recovering:
        </p>
        <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
          {leadershipData.whatToWatchNext.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 7. Insights & Tracking (Secondary, Compact) */}
      <InsightsAndTrackingSection insights={insightsData} />
    </div>
  );
}
