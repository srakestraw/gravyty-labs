'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { ProgramMatchAnalytics } from '@/lib/program-match/types';

export default function ProgramMatchOverviewPage() {
  const [analytics, setAnalytics] = useState<ProgramMatchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          end: new Date().toISOString(),
        };
        
        const data = await dataClient.getProgramMatchAnalytics(
          { workspace: 'admissions', app: 'admissions' },
          'quiz_grad_match_v1',
          dateRange
        );
        
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatPercent = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Program Match Overview
            </h1>
            <p className="text-gray-600">
              Monitor your program matching funnel and key metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admissions/program-match/configure">
                <FontAwesomeIcon icon="fa-solid fa-cog" className="h-4 w-4 mr-2" />
                Configure
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admissions/program-match/analytics">
                <FontAwesomeIcon icon="fa-solid fa-chart-bar" className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 bg-white animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {analytics && !loading && (
          <>
            {/* Funnel Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Gate Submits</div>
                  <FontAwesomeIcon icon="fa-solid fa-door-open" className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.funnel.gate_submitted)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.funnel.gate_error_count > 0 && (
                    <span className="text-red-600">
                      {analytics.funnel.gate_error_count} errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Quiz Completions</div>
                  <FontAwesomeIcon icon="fa-solid fa-check-circle" className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.funnel.quiz_completed)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(analytics.rates.completion_rate)} completion rate
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Results Viewed</div>
                  <FontAwesomeIcon icon="fa-solid fa-eye" className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.funnel.results_viewed)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(analytics.rates.readiness_opt_in_rate)} opt-in to readiness
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Readiness Completed</div>
                  <FontAwesomeIcon icon="fa-solid fa-clipboard-check" className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.funnel.readiness_completed)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercent(analytics.rates.readiness_completion_rate)} completion rate
                </div>
              </div>
            </div>

            {/* Key Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Gate Submit Rate</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatPercent(analytics.rates.gate_submit_rate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.funnel.gate_viewed} viewed, {analytics.funnel.gate_submitted} submitted
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Abandon Rate</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatPercent(analytics.rates.abandon_rate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.funnel.resume_link_opened} resumed via link
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Resume Rate</div>
                <div className="text-xl font-semibold text-gray-900">
                  {formatPercent(analytics.rates.resume_rate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Candidates returning via resume link
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {(analytics.funnel.gate_error_count > 0 || analytics.rates.abandon_rate > 0.3) && (
              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-1">Alerts</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {analytics.funnel.gate_error_count > 0 && (
                        <li>
                          • {analytics.funnel.gate_error_count} gate submission errors detected
                        </li>
                      )}
                      {analytics.rates.abandon_rate > 0.3 && (
                        <li>
                          • Abandon rate is {formatPercent(analytics.rates.abandon_rate)} - consider reviewing quiz length
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admissions/program-match/configure">
                    <FontAwesomeIcon icon="fa-solid fa-cog" className="h-4 w-4 mr-2" />
                    Configure Gate
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admissions/program-match/quiz-builder">
                    <FontAwesomeIcon icon="fa-solid fa-pencil" className="h-4 w-4 mr-2" />
                    Open Quiz Builder
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admissions/program-match/deploy">
                    <FontAwesomeIcon icon="fa-solid fa-rocket" className="h-4 w-4 mr-2" />
                    Deploy Widget
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admissions/program-match/analytics">
                    <FontAwesomeIcon icon="fa-solid fa-chart-bar" className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
