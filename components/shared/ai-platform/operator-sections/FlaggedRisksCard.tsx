'use client';

import { cn } from '@/lib/utils';
import type { AdmissionsOperatorFlaggedRiskData } from '@/lib/data/provider';

interface FlaggedRisksCardProps {
  data: AdmissionsOperatorFlaggedRiskData[];
}

export function FlaggedRisksCard({ data }: FlaggedRisksCardProps) {
  if (data.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-900">Flagged Risks</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">No risks flagged at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-900">Flagged Risks</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-2.5">
        <div className="space-y-3">
          {data.map((risk) => (
            <div key={risk.id} className="flex items-start gap-2 text-xs">
              <span
                className={cn(
                  'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                  risk.severity === 'high'
                    ? 'bg-red-500'
                    : risk.severity === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                )}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{risk.title}</div>
                {risk.description && <div className="text-gray-600 mt-0.5">{risk.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

