'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Metrics {
  students: number;
  sections: number;
  registrations: number;
  periods: number;
  yearsSpan: string;
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  gpaDistribution: {
    '<2.0': number;
    '2.0-2.5': number;
    '2.5-3.0': number;
    '3.0-3.5': number;
    '3.5+': number;
  };
  currentSimDate: string | null;
}

export default function DataHealthPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics
      const [studentsRes, sectionsRes, registrationsRes, periodsRes, risksRes, gradesRes, simStateRes] =
        await Promise.all([
          fetch('/api/banner/students'),
          fetch('/api/banner/sections'),
          fetch('/api/banner/section-registrations'),
          fetch('/api/banner/academic-periods'),
          fetch('/api/banner/students').then(async (res) => {
            // We'll need to calculate risk from a different endpoint
            // For now, use a placeholder
            return { json: async () => [] };
          }),
          fetch('/api/banner/student-transcript-grades'),
          fetch('/api/banner/academic-periods?status=active'),
        ]);

      const students = await studentsRes.json();
      const sections = await sectionsRes.json();
      const registrations = await registrationsRes.json();
      const periods = await periodsRes.json();
      const grades = await gradesRes.json();

      // Calculate years span
      const periodCodes = periods.map((p: any) => p.code).sort();
      const startYear = periodCodes[0]?.substring(0, 4) || 'N/A';
      const endYear = periodCodes[periodCodes.length - 1]?.substring(0, 4) || 'N/A';
      const yearsSpan = `${startYear}-${endYear}`;

      // Calculate risk distribution
      let riskDistribution = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
      };
      try {
        const risksRes = await fetch('/api/banner/student-risks');
        if (risksRes.ok) {
          const risks = await risksRes.json();
          for (const risk of risks) {
            if (risk.overallRiskBucket === 'LOW') riskDistribution.LOW++;
            else if (risk.overallRiskBucket === 'MEDIUM') riskDistribution.MEDIUM++;
            else if (risk.overallRiskBucket === 'HIGH') riskDistribution.HIGH++;
          }
        }
      } catch (err) {
        console.error('Failed to fetch risk data:', err);
      }

      // Calculate GPA distribution
      const completedGrades = grades.filter((g: any) => g.status === 'final' && g.gradePoints !== null);
      const gpaDistribution = {
        '<2.0': 0,
        '2.0-2.5': 0,
        '2.5-3.0': 0,
        '3.0-3.5': 0,
        '3.5+': 0,
      };

      // Group by student and calculate GPA
      const studentGPAs: Record<string, { points: number; credits: number }> = {};
      for (const grade of completedGrades) {
        if (!studentGPAs[grade.student.id]) {
          studentGPAs[grade.student.id] = { points: 0, credits: 0 };
        }
        studentGPAs[grade.student.id].points +=
          Number(grade.gradePoints || 0) * Number(grade.creditsEarned);
        studentGPAs[grade.student.id].credits += Number(grade.creditsEarned);
      }

      for (const studentId in studentGPAs) {
        const { points, credits } = studentGPAs[studentId];
        if (credits > 0) {
          const gpa = points / credits;
          if (gpa < 2.0) gpaDistribution['<2.0']++;
          else if (gpa < 2.5) gpaDistribution['2.0-2.5']++;
          else if (gpa < 3.0) gpaDistribution['2.5-3.0']++;
          else if (gpa < 3.5) gpaDistribution['3.0-3.5']++;
          else gpaDistribution['3.5+']++;
        }
      }

      // Get simulation state
      let currentSimDate = null;
      try {
        const simStateRes = await fetch('/api/internal/simulation-state');
        if (simStateRes.ok) {
          const simState = await simStateRes.json();
          currentSimDate = simState.currentSimDate;
        }
      } catch (err) {
        console.error('Failed to fetch simulation state:', err);
      }

      setMetrics({
        students: students.length,
        sections: sections.length,
        registrations: registrations.length,
        periods: periods.length,
        yearsSpan,
        riskDistribution,
        gpaDistribution,
        currentSimDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }

  async function runSimulationTick() {
    try {
      setSimulating(true);
      setError(null);

      const response = await fetch('/api/internal/simulator/tick', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Simulation failed');
      }

      // Reload metrics after simulation
      await loadMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin h-5 w-5" />
          <span>Loading data health metrics...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon="fa-solid fa-exclamation-circle" className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium text-gray-900 mb-2">Error</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadMetrics}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon="fa-solid fa-chart-line" className="h-8 w-8 text-[#336AEA]" />
              Data Health Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Dev / Internal - Affinity University SIS Metrics</p>
          </div>
          <div className="flex items-center gap-3">
            {metrics?.currentSimDate && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Simulation Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(metrics.currentSimDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <Button
              onClick={runSimulationTick}
              disabled={simulating}
              className="bg-[#336AEA] hover:bg-[#2a5bd4]"
            >
              {simulating ? (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-spinner" className="animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-play" className="mr-2" />
                  Run Weekly Tick
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <FontAwesomeIcon icon="fa-solid fa-exclamation-circle" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {metrics && (
        <>
          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.students.toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon="fa-solid fa-user-graduate" className="h-8 w-8 text-[#336AEA]" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sections</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.sections.toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon="fa-solid fa-chalkboard" className="h-8 w-8 text-[#336AEA]" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Registrations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metrics.registrations.toLocaleString()}
                  </p>
                </div>
                <FontAwesomeIcon icon="fa-solid fa-clipboard-list" className="h-8 w-8 text-[#336AEA]" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Academic Periods</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.periods}</p>
                  <p className="text-xs text-gray-500 mt-1">Years: {metrics.yearsSpan}</p>
                </div>
                <FontAwesomeIcon icon="fa-solid fa-calendar" className="h-8 w-8 text-[#336AEA]" />
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon="fa-solid fa-exclamation-triangle" className="h-5 w-5 text-[#336AEA]" />
              Risk Distribution (Current Term)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((bucket) => {
                const count = metrics.riskDistribution[bucket];
                const total = Object.values(metrics.riskDistribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

                return (
                  <div
                    key={bucket}
                    className={cn(
                      'rounded-lg p-4 border-2',
                      bucket === 'LOW' && 'bg-green-50 border-green-200',
                      bucket === 'MEDIUM' && 'bg-yellow-50 border-yellow-200',
                      bucket === 'HIGH' && 'bg-red-50 border-red-200'
                    )}
                  >
                    <p className="text-sm font-medium text-gray-700">{bucket} Risk</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{percent}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GPA Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="h-5 w-5 text-[#336AEA]" />
              GPA Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(metrics.gpaDistribution).map(([range, count]) => {
                const total = Object.values(metrics.gpaDistribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                const width = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={range}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{range}</span>
                      <span className="text-sm text-gray-600">
                        {count.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#336AEA] h-2 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

