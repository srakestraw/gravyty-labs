'use client';

import { TimePill } from '@/components/shared/ui/TimePill';
import { formatCurrencyUSD } from '@/lib/utils/currency';
import type { PipelineLeadershipForecastData } from '@/lib/data/provider';

interface PipelineLeadershipForecastCardProps {
  data: PipelineLeadershipForecastData | null;
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

const getGapColor = (gap: number) => {
  if (gap >= 0) {
    return 'text-emerald-700';
  } else if (gap >= -100000) {
    return 'text-amber-700';
  } else {
    return 'text-rose-700';
  }
};

export function PipelineLeadershipForecastCard({ data }: PipelineLeadershipForecastCardProps) {
  if (!data) return null;

  // Dev-only guard to verify calculation
  if (process.env.NODE_ENV === 'development') {
    const expectedTotal = data.committedAmount + data.mostLikelyAmount;
    if (data.forecastTotal !== expectedTotal) {
      console.warn('[PipelineLeadershipForecastCard] Forecast total mismatch:', {
        committed: data.committedAmount,
        mostLikely: data.mostLikelyAmount,
        expected: expectedTotal,
        actual: data.forecastTotal,
      });
    }
    const expectedGap = data.forecastTotal - data.quarterGoal;
    if (Math.abs(data.gap - expectedGap) > 1) {
      console.warn('[PipelineLeadershipForecastCard] Gap calculation mismatch:', {
        forecastTotal: data.forecastTotal,
        quarterGoal: data.quarterGoal,
        expected: expectedGap,
        actual: data.gap,
      });
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-900">Forecast</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-3">
          {/* Quarter goal and time context */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Quarter goal</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrencyUSD(data.quarterGoal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{data.timeContextLabel}</span>
              <TimePill dateISO={data.timeContextDateISO} mode="due" />
            </div>
          </div>

          {/* Forecast total and gap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Forecast total</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrencyUSD(data.forecastTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Gap</span>
              <span className={`text-xs font-medium ${getGapColor(data.gap)}`}>
                {data.gap >= 0 ? '+' : ''}{formatCurrencyUSD(data.gap)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Buckets */}
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

          {/* Confidence chip */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Confidence</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceColor(data.confidence)}`}
            >
              {data.confidence.charAt(0).toUpperCase() + data.confidence.slice(1)} confidence
            </span>
          </div>

          {/* Risk driver */}
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

