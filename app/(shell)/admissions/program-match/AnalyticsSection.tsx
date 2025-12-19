'use client';

import { useState, useEffect, useMemo } from 'react';
import { dataClient } from '@/lib/data';
import type { ProgramMatchPublishSnapshot, ProgramMatchAnalytics } from '@/lib/data/provider';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';

interface AnalyticsSectionProps {
  publishedSnapshots: ProgramMatchPublishSnapshot[];
}

export function AnalyticsSection({ publishedSnapshots }: AnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState<ProgramMatchAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  const latestSnapshot = useMemo(() => {
    if (publishedSnapshots.length === 0) return null;
    return publishedSnapshots.sort((a, b) => b.version - a.version)[0];
  }, [publishedSnapshots]);

  useEffect(() => {
    setSelectedSnapshotId(latestSnapshot?.id || null);
  }, [latestSnapshot]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedSnapshotId) {
        setAnalytics(null);
        return;
      }

      setIsLoading(true);
      try {
        const ctx = {
          workspace: 'admissions',
          app: 'student-lifecycle',
        };
        const data = await dataClient.getProgramMatchAnalytics(ctx, {
          publishedSnapshotId: selectedSnapshotId,
          rangeDays,
        });
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedSnapshotId, rangeDays]);

  if (!latestSnapshot) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">No published version yet. Publish your draft to see analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
        <div className="flex items-center gap-2">
          {publishedSnapshots.length > 1 && (
            <select
              value={selectedSnapshotId || ''}
              onChange={(e) => setSelectedSnapshotId(e.target.value || null)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {publishedSnapshots.sort((a, b) => b.version - a.version).map(s => (
                <option key={s.id} value={s.id}>Version {s.version}</option>
              ))}
            </select>
          )}
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value) as 7 | 30 | 90)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs font-medium text-blue-600 mb-1">Gate Submits</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tiles.gateSubmits}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xs font-medium text-purple-600 mb-1">Quiz Starts</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tiles.quizStarts}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs font-medium text-green-600 mb-1">Quiz Completes</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tiles.quizCompletes}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-xs font-medium text-yellow-600 mb-1">Results Viewed</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tiles.resultsViewed}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-xs font-medium text-red-600 mb-1">Abandon Rate</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tiles.abandonRate}%</div>
        </div>
      </div>

      {/* Funnel */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Funnel</h4>
        <div className="space-y-2">
          {analytics.funnel.map((step, idx) => {
            const prevCount = idx > 0 ? analytics.funnel[idx - 1].count : step.count;
            const conversionRate = prevCount > 0 ? Math.round((step.count / prevCount) * 100) : 0;
            const width = prevCount > 0 ? (step.count / prevCount) * 100 : 0;

            return (
              <div key={step.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{step.step}</span>
                  <span className="text-gray-600">{step.count} ({conversionRate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Table */}
      {analytics.byDay.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Daily Trend</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Gate Submits</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Quiz Completes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.byDay.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{day.gateSubmits}</td>
                    <td className="px-4 py-2 text-gray-600">{day.quizCompletes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



