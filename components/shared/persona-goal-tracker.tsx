'use client';

import { cn } from '@/lib/utils';

export type GoalStatus = 'on-track' | 'slightly-behind' | 'at-risk';

export type GoalMetric = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string; // e.g. "donors", "apps", "students"
  trend?: 'up' | 'down' | 'flat'; // optional, for arrows
  status?: GoalStatus; // optional, for backward compatibility
};

export type PersonaGoalTrackerProps = {
  title: string; // e.g. "Goal Tracker"
  subtitle?: string; // short explanation
  timeframeLabel: string; // e.g. "This term", "This cycle", "This week"
  metrics: GoalMetric[];
};

const getStatusStyles = (status: GoalStatus) => {
  switch (status) {
    case 'on-track':
      return {
        bar: 'bg-emerald-500',
        pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        label: 'On track',
      };
    case 'slightly-behind':
      return {
        bar: 'bg-amber-500',
        pill: 'bg-amber-50 text-amber-700 border border-amber-100',
        label: 'Slightly behind',
      };
    case 'at-risk':
      return {
        bar: 'bg-rose-500',
        pill: 'bg-rose-50 text-rose-700 border border-rose-100',
        label: 'At risk',
      };
    default:
      return {
        bar: 'bg-slate-400',
        pill: 'bg-slate-50 text-slate-700 border border-slate-100',
        label: 'Unknown',
      };
  }
};

const calculateStatus = (current: number, target: number): GoalStatus => {
  // Handle division by zero or negative targets
  if (target <= 0) {
    // For reverse metrics (where lower is better), if current is 0 or very low, we're on track
    return current <= 0 ? 'on-track' : current <= target * 0.1 ? 'slightly-behind' : 'at-risk';
  }
  const percentage = (current / target) * 100;
  if (percentage >= 90) return 'on-track';
  if (percentage >= 70) return 'slightly-behind';
  return 'at-risk';
};

const getTrendIcon = (trend?: 'up' | 'down' | 'flat') => {
  if (!trend) return null;
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'flat':
      return '→';
    default:
      return null;
  }
};

export function PersonaGoalTracker({
  title,
  subtitle,
  timeframeLabel,
  metrics,
}: PersonaGoalTrackerProps) {
  // Calculate overall status based on average completion
  const overallCompletion =
    metrics.reduce((sum, m) => sum + (m.current / m.target) * 100, 0) / metrics.length;
  const overallStatus: GoalStatus =
    overallCompletion >= 90 ? 'on-track' : overallCompletion >= 70 ? 'slightly-behind' : 'at-risk';
  const overallStyles = getStatusStyles(overallStatus);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
              overallStyles.pill
            )}
          >
            {overallStyles.label}
          </span>
          <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50">
            {timeframeLabel}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const status = metric.status || calculateStatus(metric.current, metric.target);
          const pct = Math.min((metric.current / metric.target) * 100, 120);
          const { bar, pill, label } = getStatusStyles(status);
          const trendIcon = getTrendIcon(metric.trend);

          return (
            <div key={metric.id} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                    {trendIcon && (
                      <span className="text-xs text-gray-400" aria-label={`Trend: ${metric.trend}`}>
                        {trendIcon}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {metric.unit === '$M'
                      ? `$${metric.current.toFixed(1)}M / $${metric.target.toFixed(1)}M`
                      : metric.unit
                        ? `${metric.current} / ${metric.target} ${metric.unit}`
                        : `${metric.current} / ${metric.target}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                    pill
                  )}
                >
                  {label}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={cn('h-2 rounded-full', bar)}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

