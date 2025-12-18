/**
 * Program Match Event Tracking
 * 
 * Handles event tracking for analytics and funnel monitoring
 */

import type { ProgramMatchEvent, ProgramMatchEventType } from './types';
import { dataClient } from '@/lib/data';

/**
 * Track a Program Match event
 */
export async function trackEvent(
  eventType: ProgramMatchEventType,
  metadata?: {
    lead_id?: string;
    quiz_id?: string;
    version_id?: string;
    institution_id?: string;
    [key: string]: unknown;
  }
): Promise<void> {
  const event: ProgramMatchEvent = {
    event_type: eventType,
    lead_id: metadata?.lead_id,
    quiz_id: metadata?.quiz_id,
    version_id: metadata?.version_id,
    institution_id: metadata?.institution_id,
    timestamp: new Date().toISOString(),
    metadata: metadata ? { ...metadata } : undefined,
  };

  try {
    await dataClient.trackProgramMatchEvent(
      {
        workspace: 'admissions',
        app: 'admissions',
      },
      event
    );
  } catch (error) {
    // Don't block UI on event tracking failures
    console.error('Failed to track event:', error);
  }
}

/**
 * Track gate viewed
 */
export function trackGateViewed(metadata?: { quiz_id?: string; version_id?: string }) {
  return trackEvent('lead_gate_viewed', metadata);
}

/**
 * Track gate submitted
 */
export function trackGateSubmitted(metadata?: { lead_id: string; quiz_id?: string; version_id?: string }) {
  return trackEvent('lead_gate_submitted', metadata);
}

/**
 * Track gate error
 */
export function trackGateError(metadata?: { error: string; quiz_id?: string; version_id?: string }) {
  return trackEvent('lead_gate_error', metadata);
}

/**
 * Track quiz started
 */
export function trackQuizStarted(metadata?: { lead_id: string; quiz_id?: string; version_id?: string }) {
  return trackEvent('quiz_started', metadata);
}

/**
 * Track question answered
 */
export function trackQuestionAnswered(metadata?: {
  lead_id: string;
  question_id: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('question_answered', metadata);
}

/**
 * Track progress saved
 */
export function trackProgressSaved(metadata?: {
  lead_id: string;
  questions_answered: number;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('progress_saved', metadata);
}

/**
 * Track quiz completed
 */
export function trackQuizCompleted(metadata?: {
  lead_id: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('quiz_completed', metadata);
}

/**
 * Track results viewed
 */
export function trackResultsViewed(metadata?: {
  lead_id: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('results_viewed', metadata);
}

/**
 * Track readiness started
 */
export function trackReadinessStarted(metadata?: {
  lead_id: string;
  program_id: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('readiness_started', metadata);
}

/**
 * Track readiness completed
 */
export function trackReadinessCompleted(metadata?: {
  lead_id: string;
  program_id: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('readiness_completed', metadata);
}

/**
 * Track resume link opened
 */
export function trackResumeLinkOpened(metadata?: {
  lead_id: string;
  token: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('resume_link_opened', metadata);
}

/**
 * Track CTA clicked
 */
export function trackCTAClicked(metadata?: {
  lead_id: string;
  cta_type: string;
  program_id?: string;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('cta_clicked', metadata);
}

/**
 * Track recommendation feedback
 */
export function trackRecommendationFeedback(metadata?: {
  lead_id: string;
  helpful: boolean;
  quiz_id?: string;
  version_id?: string;
}) {
  return trackEvent('recommendation_feedback', metadata);
}

