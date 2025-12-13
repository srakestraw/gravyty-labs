'use client';

import type { AdmissionsLeadershipInsights } from '@/lib/data/provider';

interface InsightsAndTrackingSectionProps {
  insights: AdmissionsLeadershipInsights | null;
}

export function InsightsAndTrackingSection({ insights }: InsightsAndTrackingSectionProps) {
  if (!insights) return null;

  const blocks = [
    {
      title: 'Outcome Coverage',
      metrics: insights.outcomeCoverage,
    },
    {
      title: 'Flow Health',
      metrics: insights.flowHealth,
    },
    {
      title: 'Intervention Impact',
      metrics: insights.interventionImpact,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Insights & Tracking</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((block) => (
          <div key={block.title} className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {block.title}
            </h4>
            {block.metrics.length === 0 ? (
              <p className="text-xs text-gray-500">No insights available yet.</p>
            ) : (
              <div className="space-y-2">
                {block.metrics.map((metric) => (
                  <div key={metric.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-gray-600">{metric.label}</span>
                      <span className="text-xs font-semibold text-gray-900">{metric.value}</span>
                    </div>
                    {metric.subtext && (
                      <p className="text-xs text-gray-500 mt-0.5">{metric.subtext}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

