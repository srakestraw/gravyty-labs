'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProgramMatchAnalytics } from '@/lib/program-match/types';

export default function ProgramMatchAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ProgramMatchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await dataClient.getProgramMatchAnalytics(
        { workspace: 'admissions', app: 'admissions' },
        'quiz_grad_match_v1',
        {
          start: new Date(dateRange.start).toISOString(),
          end: new Date(dateRange.end + 'T23:59:59').toISOString(),
        }
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercent = (num: number) => (num * 100).toFixed(1) + '%';

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Program Match Analytics
            </h1>
            <p className="text-gray-600">
              Analyze funnel performance, match distribution, and drop-off patterns
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">Start</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">End</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            <Button variant="outline" onClick={loadAnalytics}>
              <FontAwesomeIcon icon="fa-solid fa-download" className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading && (
          <div className="border rounded-lg p-12 bg-white text-center">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        )}

        {analytics && !loading && (
          <>
            {/* Funnel Visualization */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Funnel Overview</h2>
              <div className="space-y-4">
                {[
                  { label: 'Gate Viewed', value: analytics.funnel.gate_viewed },
                  { label: 'Gate Submitted', value: analytics.funnel.gate_submitted, rate: analytics.rates.gate_submit_rate },
                  { label: 'Quiz Started', value: analytics.funnel.quiz_started },
                  { label: 'Quiz Completed', value: analytics.funnel.quiz_completed, rate: analytics.rates.completion_rate },
                  { label: 'Results Viewed', value: analytics.funnel.results_viewed },
                  { label: 'Readiness Started', value: analytics.funnel.readiness_started, rate: analytics.rates.readiness_opt_in_rate },
                  { label: 'Readiness Completed', value: analytics.funnel.readiness_completed, rate: analytics.rates.readiness_completion_rate },
                ].map((step, index, array) => {
                  const prevValue = index > 0 ? array[index - 1].value : step.value;
                  const conversionRate = prevValue > 0 ? (step.value / prevValue) * 100 : 0;
                  
                  return (
                    <div key={step.label} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-600">{step.label}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${(step.value / analytics.funnel.gate_viewed) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                              {formatNumber(step.value)}
                            </div>
                          </div>
                          {step.rate && (
                            <div className="w-20 text-xs text-gray-500 text-right">
                              {formatPercent(step.rate)}
                            </div>
                          )}
                          {!step.rate && index > 0 && (
                            <div className="w-20 text-xs text-gray-500 text-right">
                              {conversionRate.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Distribution</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.match_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([programId, count]) => (
                      <div key={programId} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{programId}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-primary h-4 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(analytics.match_distribution))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                            {formatNumber(count)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Confidence Distribution</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.confidence_distribution).map(([band, count]) => (
                    <div key={band} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{band}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${
                              band === 'strong' ? 'bg-green-500' :
                              band === 'good' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.confidence_distribution))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {formatNumber(count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Gate Submit Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(analytics.rates.gate_submit_rate)}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Abandon Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(analytics.rates.abandon_rate)}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Resume Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(analytics.rates.resume_rate)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
