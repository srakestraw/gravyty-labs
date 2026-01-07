'use client';

import { TimePill } from '@/components/shared/ui/TimePill';
import { formatCurrencyUSD } from '@/lib/utils/currency';
import type { PipelineLeadershipTeamForecastSnapshotData } from '@/lib/data/provider';

interface PipelineLeadershipTeamForecastSnapshotCardProps {
  data: PipelineLeadershipTeamForecastSnapshotData | null;
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

const getStatusLabel = (status: 'on-track' | 'slightly-behind' | 'at-risk') => {
  switch (status) {
    case 'on-track':
      return 'On track';
    case 'slightly-behind':
      return 'Slightly behind';
    case 'at-risk':
      return 'At risk';
  }
};

export function PipelineLeadershipTeamForecastSnapshotCard({ data }: PipelineLeadershipTeamForecastSnapshotCardProps) {
  if (!data) return null;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{data.title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{data.subtitle}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-2">
          {data.rows.map((row) => {
            const forecastTotal = row.committedAmount + row.mostLikelyAmount;

            return (
              <div key={row.id} className="py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{row.name}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-300 ${getStatusColor(row.status)}`}
                      >
                        {getStatusLabel(row.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{row.primaryRiskDriver}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrencyUSD(forecastTotal)}</span>
                    <TimePill dateISO={row.nextCloseDateISO} mode="due" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}





