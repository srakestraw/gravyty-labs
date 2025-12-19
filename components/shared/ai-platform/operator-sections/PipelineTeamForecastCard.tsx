'use client';

import { TimePill } from '@/components/shared/ui/TimePill';
import { formatCurrencyUSD } from '@/lib/utils/currency';
import type { PipelineTeamForecastData } from '@/lib/data/provider';

interface PipelineTeamForecastCardProps {
  data: PipelineTeamForecastData | null;
}

const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
  switch (confidence) {
    case 'high':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'low':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
  }
};

export function PipelineTeamForecastCard({ data }: PipelineTeamForecastCardProps) {
  if (!data) return null;

  // Forecast total = Committed + Most likely (excludes At risk)
  const forecastTotal = data.committedAmount + data.mostLikelyAmount;
  const withUpside = data.committedAmount + data.mostLikelyAmount + data.atRiskAmount;

  // Dev-only guard to verify calculation
  if (process.env.NODE_ENV === 'development') {
    const expectedTotal = data.committedAmount + data.mostLikelyAmount;
    if (forecastTotal !== expectedTotal) {
      console.warn('[PipelineTeamForecastCard] Forecast total mismatch:', {
        committed: data.committedAmount,
        mostLikely: data.mostLikelyAmount,
        expected: expectedTotal,
        actual: forecastTotal,
      });
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-900">{data.title}</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-3">
          {/* Subtitle and time context */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{data.subtitle}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{data.timeContextLabel}</span>
              <TimePill dateISO={data.timeContextDateISO} mode="due" />
            </div>
          </div>

          {/* Forecast rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Committed</span>
              <span className="font-medium text-gray-900">{formatCurrencyUSD(data.committedAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Most likely</span>
              <span className="font-medium text-gray-900">{formatCurrencyUSD(data.mostLikelyAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">At risk</span>
              <span className="font-medium text-gray-900">{formatCurrencyUSD(data.atRiskAmount)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Forecast total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Forecast total</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrencyUSD(forecastTotal)}</span>
          </div>

          {/* With upside (optional secondary line) */}
          <div className="flex items-center justify-between -mt-1">
            <span className="text-xs text-gray-500">With upside</span>
            <span className="text-xs text-gray-500">{formatCurrencyUSD(withUpside)}</span>
          </div>

          {/* Confidence chip */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Confidence</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceColor(data.confidence)}`}
            >
              {data.confidence.charAt(0).toUpperCase() + data.confidence.slice(1)} confidence
            </span>
          </div>

          {/* Hint line */}
          {data.primaryRiskDriver && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">{data.primaryRiskDriver}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

