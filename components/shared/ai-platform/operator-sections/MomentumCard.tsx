'use client';

import type { AdmissionsOperatorMomentumData } from '@/lib/data/provider';

interface MomentumCardProps {
  data: AdmissionsOperatorMomentumData | null;
}

export function MomentumCard({ data }: MomentumCardProps) {
  if (!data) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-500">Your Momentum</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Active streak</div>
              <div className="text-2xl font-semibold text-gray-900">
                {data.streakDays} days
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Reducing stalled applicants</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium text-gray-600 mb-1">Daily impact score</div>
              <div className="h-12 w-12 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-medium text-purple-600">
                {data.score}/100
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">Based on applicants progressed today</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This week's progress</span>
              <span className="font-medium text-gray-900">
                {data.weeklyChallenge.completed}/{data.weeklyChallenge.total}
              </span>
            </div>
            <div className="text-xs text-gray-500">applicants moved forward</div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-purple-600"
                style={{
                  width: `${Math.min(
                    100,
                    (data.weeklyChallenge.completed / data.weeklyChallenge.total) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600">Clearing stalled applicants is the fastest way to increase today's momentum.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

