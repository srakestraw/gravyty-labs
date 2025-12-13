'use client';

import { useState } from 'react';
import type { AdmissionsOperatorRecentWinData } from '@/lib/data/provider';

interface RecentWinsCardProps {
  data: AdmissionsOperatorRecentWinData[];
}

export function RecentWinsCard({ data }: RecentWinsCardProps) {
  const [showWins, setShowWins] = useState(true);

  if (data.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Recent Wins</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">No wins recorded yet today.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Recent Wins</h2>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => setShowWins((prev) => !prev)}
        >
          {showWins ? 'Hide' : 'Show'}
        </button>
      </div>
      {showWins && (
        <div className="bg-white border border-gray-200 rounded-lg p-2.5">
          <div className="space-y-3 text-xs">
            {data.map((win) => (
              <div key={win.id}>
                <div className="font-medium text-gray-900">{win.text}</div>
                {win.detail && <div className="text-gray-600 mt-0.5">{win.detail}</div>}
                {win.assistantName && (
                  <div className="text-gray-500 mt-0.5">Powered by: {win.assistantName}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

