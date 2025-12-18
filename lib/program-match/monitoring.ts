/**
 * Monitoring and Health Checks for Program Match
 * 
 * Provides operational health metrics and monitoring:
 * - System health checks
 * - Performance metrics
 * - Error rate tracking
 * - Alert conditions
 */

import type { ProgramMatchAnalytics } from './types';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: 'ok' | 'error';
    scoring: 'ok' | 'error';
    aiService?: 'ok' | 'error' | 'disabled';
    eventTracking: 'ok' | 'error';
  };
  timestamp: string;
}

export interface PerformanceMetrics {
  averageScoringTime: number; // milliseconds
  averageQuizCompletionTime: number; // seconds
  gateErrorRate: number; // percentage
  scoringErrorRate: number; // percentage
  aiSuccessRate?: number; // percentage (if AI enabled)
}

/**
 * Run health check
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = {
    database: 'ok', // TODO: Check database connectivity
    scoring: 'ok', // TODO: Test scoring engine
    eventTracking: 'ok', // TODO: Check event tracking service
  };

  // Check AI service if enabled
  // const aiEnabled = await checkAIServiceEnabled();
  // if (aiEnabled) {
  //   checks.aiService = await testAIService() ? 'ok' : 'error';
  // } else {
  //   checks.aiService = 'disabled';
  // }

  const hasErrors = Object.values(checks).some((status) => status === 'error');
  const hasWarnings = Object.values(checks).some(
    (status) => status === 'disabled'
  );

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (hasErrors) {
    status = 'unhealthy';
  } else if (hasWarnings) {
    status = 'degraded';
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate performance metrics
 */
export async function calculatePerformanceMetrics(
  analytics: ProgramMatchAnalytics
): Promise<PerformanceMetrics> {
  // In production, these would be calculated from actual metrics
  // For now, return placeholder structure

  return {
    averageScoringTime: 300, // milliseconds
    averageQuizCompletionTime: 180, // seconds (3 minutes)
    gateErrorRate: analytics.funnel.gate_error_count / analytics.funnel.gate_submitted || 0,
    scoringErrorRate: 0, // Would track scoring failures
    aiSuccessRate: undefined, // Would track AI call success rate
  };
}

/**
 * Check for alert conditions
 */
export interface AlertCondition {
  type: 'error_rate' | 'abandon_rate' | 'performance' | 'health';
  severity: 'warning' | 'critical';
  message: string;
  threshold?: number;
  current?: number;
}

export function checkAlertConditions(
  analytics: ProgramMatchAnalytics,
  health: HealthCheckResult
): AlertCondition[] {
  const alerts: AlertCondition[] = [];

  // Check health status
  if (health.status === 'unhealthy') {
    alerts.push({
      type: 'health',
      severity: 'critical',
      message: 'System health check failed',
    });
  }

  // Check gate error rate
  const gateErrorRate =
    analytics.funnel.gate_error_count / analytics.funnel.gate_submitted;
  if (gateErrorRate > 0.05) {
    // 5% error rate threshold
    alerts.push({
      type: 'error_rate',
      severity: 'critical',
      message: `Gate error rate is ${(gateErrorRate * 100).toFixed(1)}%`,
      threshold: 0.05,
      current: gateErrorRate,
    });
  }

  // Check abandon rate
  if (analytics.rates.abandon_rate > 0.5) {
    // 50% abandon rate threshold
    alerts.push({
      type: 'abandon_rate',
      severity: 'warning',
      message: `Abandon rate is ${(analytics.rates.abandon_rate * 100).toFixed(1)}%`,
      threshold: 0.5,
      current: analytics.rates.abandon_rate,
    });
  }

  return alerts;
}

