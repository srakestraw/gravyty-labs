'use client';

import type { PipelineLeadershipInsightsData } from '@/lib/data/provider';

interface PipelineInsightsAndTrackingSectionProps {
  insights: PipelineLeadershipInsightsData | null;
}

// Helper to extract directional qualifier from delta values
function getDirectionalQualifier(value: string): string | null {
  if (value.startsWith('+')) return 'increase';
  if (value.startsWith('-')) return 'decrease';
  if (value.toLowerCase().includes('improved') || value.toLowerCase().includes('better')) return 'improved';
  if (value.toLowerCase().includes('worsened') || value.toLowerCase().includes('worse')) return 'worsened';
  return null;
}

export function PipelineInsightsAndTrackingSection({ insights }: PipelineInsightsAndTrackingSectionProps) {
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
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Insights & Tracking</h3>
        <p className="text-xs text-gray-500 mt-1">
          System-level signals to validate whether recent interventions are working.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((block, blockIndex) => (
          <div key={block.title} className={blockIndex < blocks.length - 1 ? 'border-r border-gray-100 pr-6' : ''}>
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
              {block.title}
            </h4>
            {block.metrics.length === 0 ? (
              <p className="text-xs text-gray-500">No insights available yet.</p>
            ) : (
              <div className="space-y-4">
                {block.metrics.map((metric) => {
                  const directionalQualifier = getDirectionalQualifier(metric.value);
                  
                  return (
                    <div key={metric.id} className="space-y-1">
                      {/* Label */}
                      <div className="text-xs text-gray-600">{metric.label}</div>
                      {/* Primary value - visually dominant */}
                      <div className="text-base font-semibold text-gray-900">
                        {metric.value}
                        {directionalQualifier && (
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            ({directionalQualifier})
                          </span>
                        )}
                      </div>
                      {/* Supporting context - muted subtext */}
                      {metric.subtext && (
                        <p className="text-xs text-gray-500">{metric.subtext}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


