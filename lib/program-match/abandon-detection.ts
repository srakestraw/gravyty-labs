/**
 * Abandon Detection for Program Match
 * 
 * Detects abandoned quiz sessions and triggers follow-up actions:
 * - Email resume link to candidate
 * - Create task for admissions team
 * - Track abandon events
 */

import type { ProgramMatchLead, ProgramMatchProgress, LeadCaptureConfig } from './types';
import { dataClient } from '@/lib/data';
import { trackEvent } from './events';

export interface AbandonedLead {
  lead_id: string;
  lead: ProgramMatchLead;
  progress?: ProgramMatchProgress;
  abandon_reason: 'timeout' | 'incomplete' | 'no_activity';
  last_activity_at: string;
  resume_url?: string;
}

/**
 * Detect abandoned leads based on configuration
 */
export async function detectAbandonedLeads(
  config: LeadCaptureConfig,
  leads: ProgramMatchLead[],
  progressMap: Map<string, ProgramMatchProgress>
): Promise<AbandonedLead[]> {
  const abandoned: AbandonedLead[] = [];
  const now = new Date();
  const abandonWindowMs = config.abandon_window_minutes * 60 * 1000;

  for (const lead of leads) {
    // Skip if already completed
    if (lead.status === 'completed') continue;

    // Skip if expired
    if (new Date(lead.resume_expires_at) < now) continue;

    const lastActivity = new Date(lead.last_activity_at);
    const timeSinceActivity = now.getTime() - lastActivity.getTime();

    // Check if abandoned (no activity within abandon window)
    if (timeSinceActivity > abandonWindowMs) {
      const progress = progressMap.get(lead.lead_id);
      
      // Determine abandon reason
      let abandonReason: 'timeout' | 'incomplete' | 'no_activity' = 'no_activity';
      if (progress) {
        if (progress.current_step === 'quiz' && progress.current_question_index !== undefined) {
          abandonReason = 'incomplete';
        } else {
          abandonReason = 'timeout';
        }
      }

      abandoned.push({
        lead_id: lead.lead_id,
        lead,
        progress,
        abandon_reason: abandonReason,
        last_activity_at: lead.last_activity_at,
        resume_url: lead.resume_url,
      });
    }
  }

  return abandoned;
}

/**
 * Process abandoned lead - send resume email and create task
 */
export async function processAbandonedLead(
  abandoned: AbandonedLead,
  options?: {
    sendEmail?: boolean;
    createTask?: boolean;
    taskAssigneeId?: string;
  }
): Promise<void> {
  const { sendEmail = true, createTask = true } = options || {};

  // Track abandon event
  await trackEvent('quiz_abandoned', {
    lead_id: abandoned.lead_id,
    quiz_id: abandoned.lead.quiz_id,
    version_id: abandoned.lead.version_id,
    abandon_reason: abandoned.abandon_reason,
    questions_answered: abandoned.progress
      ? Object.keys(abandoned.progress.responses_partial).length
      : 0,
  });

  // Send resume email if enabled and resume URL exists
  if (sendEmail && abandoned.resume_url && abandoned.lead.email) {
    try {
      // TODO: Integrate with email service
      // await sendResumeEmail({
      //   to: abandoned.lead.email,
      //   resumeUrl: abandoned.resume_url,
      //   programName: 'Your Program Match',
      // });
      console.log('Would send resume email to:', abandoned.lead.email, abandoned.resume_url);
    } catch (error) {
      console.error('Failed to send resume email:', error);
    }
  }

  // Create task for admissions team if enabled
  if (createTask) {
    try {
      // TODO: Integrate with task/queue system
      // await createAbandonTask({
      //   leadId: abandoned.lead_id,
      //   leadEmail: abandoned.lead.email,
      //   assigneeId: options?.taskAssigneeId,
      //   abandonReason: abandoned.abandon_reason,
      //   resumeUrl: abandoned.resume_url,
      // });
      console.log('Would create task for abandoned lead:', abandoned.lead_id);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }
}

/**
 * Batch process abandoned leads
 */
export async function processAbandonedLeads(
  abandoned: AbandonedLead[],
  options?: {
    sendEmail?: boolean;
    createTask?: boolean;
    taskAssigneeId?: string;
  }
): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;

  for (const abandonedLead of abandoned) {
    try {
      await processAbandonedLead(abandonedLead, options);
      processed++;
    } catch (error) {
      console.error('Error processing abandoned lead:', abandonedLead.lead_id, error);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Job function to run abandon detection (call from cron/scheduler)
 */
export async function runAbandonDetectionJob(
  institutionId: string,
  quizId: string,
  options?: {
    sendEmail?: boolean;
    createTask?: boolean;
    taskAssigneeId?: string;
  }
): Promise<{
  detected: number;
  processed: number;
  errors: number;
}> {
  try {
    // Get all in-progress leads for this quiz
    // In production, this would query the database
    // For now, this is a placeholder structure
    
    // TODO: Replace with actual data fetching
    // const leads = await getInProgressLeads(institutionId, quizId);
    // const progressMap = await getProgressMap(leads.map(l => l.lead_id));
    // const config = await getConfig(institutionId, quizId);
    
    // const abandoned = await detectAbandonedLeads(config.lead_capture_config, leads, progressMap);
    // const { processed, errors } = await processAbandonedLeads(abandoned, options);
    
    // return {
    //   detected: abandoned.length,
    //   processed,
    //   errors,
    // };

    // Placeholder return
    return {
      detected: 0,
      processed: 0,
      errors: 0,
    };
  } catch (error) {
    console.error('Abandon detection job failed:', error);
    throw error;
  }
}

