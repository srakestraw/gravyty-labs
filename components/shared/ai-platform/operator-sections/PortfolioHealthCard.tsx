'use client';

import type { PipelineLeadershipPortfolioHealthData } from '@/lib/data/provider';

interface PortfolioHealthCardProps {
  data: PipelineLeadershipPortfolioHealthData | null;
}

const getStatusColor = (status: 'on-track' | 'slightly-behind' | 'at-risk') => {
  switch (status) {
    case 'on-track':
      return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    case 'slightly-behind':
      return 'text-amber-700 bg-amber-50 border border-amber-200';
    case 'at-risk':
      return 'text-rose-700 bg-rose-50 border border-rose-200';
  }
};

export function PortfolioHealthCard({ data }: PortfolioHealthCardProps) {
  if (!data) return null;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{data.title}</h2>
        {data.subtitle && <p className="text-xs text-gray-500 mt-0.5">{data.subtitle}</p>}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-2">
          {data.metrics.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-900">{metric.value}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(metric.status)}`}
                >
                  {metric.status === 'on-track' ? 'On track' : metric.status === 'slightly-behind' ? 'Slightly behind' : 'At risk'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





