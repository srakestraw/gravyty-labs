/**
 * Voice & Tone Integration for Program Match
 * 
 * Provides copy generation and validation aligned to Voice & Tone profiles
 */

import type { VoiceProfile } from '@/lib/communication/types';
import { resolveVoiceProfile } from '@/lib/communication/resolveVoiceProfile';
import type { AssignmentRule } from '@/lib/communication/types';

export interface ProgramMatchCopySlots {
  // Gate copy
  gate_title: string;
  gate_subtitle: string;
  gate_disclosure: string;
  gate_save_progress_text: string;
  
  // Quiz copy
  quiz_progress_text: string;
  quiz_complete_button: string;
  
  // Results copy
  results_title: string;
  results_subtitle: string;
  results_confidence_labels: {
    strong: string;
    good: string;
    explore: string;
  };
  results_readiness_cta: string;
  results_primary_cta: string;
  
  // Readiness copy
  readiness_title: string;
  readiness_subtitle: string;
  readiness_band_labels: {
    ready: string;
    nearly_ready: string;
    explore_prep_path: string;
  };
}

/**
 * Generate copy for Program Match using Voice & Tone profile
 * 
 * This is a placeholder that demonstrates the structure.
 * In production, this would use OpenAI with Voice & Tone constraints.
 */
export async function generateProgramMatchCopy(
  profile: VoiceProfile,
  slots: Partial<ProgramMatchCopySlots> = {}
): Promise<ProgramMatchCopySlots> {
  // TODO: Use OpenAI to generate copy aligned to voice profile
  // For now, return template-based copy with profile characteristics applied

  const formality = profile.characteristics.formality > 66 ? 'formal' : 
                    profile.characteristics.formality > 33 ? 'neutral' : 'casual';
  const warmth = profile.characteristics.warmth > 66 ? 'warm' : 
                 profile.characteristics.warmth > 33 ? 'friendly' : 'professional';

  return {
    gate_title: slots.gate_title || 'Find Your Program Match',
    gate_subtitle: slots.gate_subtitle || 
      (warmth === 'warm' 
        ? "We'll help you discover the perfect program for your goals. Let's get started!"
        : 'Get personalized program recommendations in just a few minutes.'),
    gate_disclosure: slots.gate_disclosure || 
      'We\'ll save your progress so you can return anytime.',
    gate_save_progress_text: slots.gate_save_progress_text || 
      'Save your progress and receive results via email',
    
    quiz_progress_text: slots.quiz_progress_text || 'Question {current} of {total}',
    quiz_complete_button: slots.quiz_complete_button || 'Complete',
    
    results_title: slots.results_title || 'Your Program Matches',
    results_subtitle: slots.results_subtitle || 
      'Based on your responses, here are the programs that best fit your goals and interests.',
    results_confidence_labels: slots.results_confidence_labels || {
      strong: 'Strong Match',
      good: 'Good Fit',
      explore: 'Explore',
    },
    results_readiness_cta: slots.results_readiness_cta || 'Check Readiness',
    results_primary_cta: slots.results_primary_cta || 'Learn More',
    
    readiness_title: slots.readiness_title || 'Readiness Assessment',
    readiness_subtitle: slots.readiness_subtitle || 
      'Let\'s assess your readiness for this program.',
    readiness_band_labels: slots.readiness_band_labels || {
      ready: 'Ready',
      nearly_ready: 'Nearly Ready',
      explore_prep_path: 'Explore Prep Path',
    },
  };
}

/**
 * Validate that all required copy slots are present
 */
export function validateCopySlots(slots: ProgramMatchCopySlots): {
  valid: boolean;
  missing: string[];
} {
  const required: (keyof ProgramMatchCopySlots)[] = [
    'gate_title',
    'gate_subtitle',
    'results_title',
    'results_subtitle',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!slots[key] || (typeof slots[key] === 'string' && slots[key].trim() === '')) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Resolve voice profile for Program Match context
 */
export function resolveProgramMatchVoiceProfile(
  profiles: VoiceProfile[],
  rules: AssignmentRule[],
  voiceToneProfileId?: string
): VoiceProfile {
  // If specific profile ID provided, use it
  if (voiceToneProfileId) {
    const profile = profiles.find((p) => p.id === voiceToneProfileId);
    if (profile) return profile;
  }

  // Otherwise, resolve using assignment rules
  const result = resolveVoiceProfile(profiles, rules, {
    app: 'admissions',
    channel: 'website',
  });

  const profile = profiles.find((p) => p.id === result.profileId);
  return profile || profiles.find((p) => p.isDefault) || profiles[0];
}

