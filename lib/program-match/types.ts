/**
 * Program Match - Type Definitions
 * 
 * Types for the Program Match feature including programs, quizzes, leads, outcomes, and readiness assessments.
 */

// ============================================================================
// Program and ICP (Ideal Candidate Profile)
// ============================================================================

export interface Program {
  program_id: string;
  name: string;
  short_description: string;
  tags: string[];
  modality_flags: {
    online?: boolean;
    hybrid?: boolean;
    on_campus?: boolean;
    part_time?: boolean;
    full_time?: boolean;
  };
  icp_trait_weights: Record<string, number>; // trait_id -> weight
  icp_skill_weights: Record<string, number>; // skill_id -> weight
  status: 'active' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface Trait {
  trait_id: string;
  label: string;
  description: string;
  type: 'learning_style' | 'orientation' | 'preference' | 'personality' | 'other';
}

export interface Skill {
  skill_id: string;
  label: string;
  description: string;
  type: 'confidence' | 'exposure' | 'experience' | 'other';
}

// ============================================================================
// Quiz and Questions
// ============================================================================

export interface QuizQuestion {
  question_id: string;
  text: string;
  type: 'single_select' | 'multi_select' | 'slider' | 'text';
  options?: QuizOption[];
  required: boolean;
  order: number;
}

export interface QuizOption {
  option_id: string;
  text: string;
  trait_deltas?: Record<string, number>; // trait_id -> delta value
  skill_deltas?: Record<string, number>; // skill_id -> delta value
}

export interface Quiz {
  quiz_id: string;
  version_id: string;
  institution_id: string;
  questions: QuizQuestion[];
  mappings: QuestionMapping[];
  voiceToneProfileId: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionMapping {
  question_id: string;
  option_id: string;
  trait_deltas: Record<string, number>;
  skill_deltas?: Record<string, number>;
}

// ============================================================================
// Lead Capture and Progress
// ============================================================================

export interface LeadCaptureConfig {
  mode: 'required_pre_quiz';
  fields: {
    email: { required: true; enabled: true };
    first_name?: { required: boolean; enabled: boolean };
    last_name?: { required: boolean; enabled: boolean };
    phone?: { required: boolean; enabled: boolean };
    intended_start_term?: { required: boolean; enabled: boolean };
    modality_preference?: { required: boolean; enabled: boolean };
  };
  consent: {
    email_consent?: { required: boolean; enabled: boolean; label: string };
    sms_consent?: { required: boolean; enabled: boolean; label: string };
  };
  resume_ttl_hours: number;
  abandon_window_minutes: number;
  lead_capture_counts_as_rfi: boolean;
  send_resume_link_immediately: boolean;
}

export interface ProgramMatchLead {
  lead_id: string;
  institution_id: string;
  quiz_id: string;
  version_id: string;
  // Contact fields
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  intended_start_term?: string;
  modality_preference?: string;
  // Consent
  email_consent?: boolean;
  sms_consent?: boolean;
  // Status and tracking
  status: 'captured' | 'in_progress' | 'completed' | 'expired';
  resume_token: string;
  resume_expires_at: string;
  resume_url?: string;
  // Tracking context
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  // Timestamps
  created_at: string;
  last_activity_at: string;
}

export interface ProgramMatchProgress {
  lead_id: string;
  responses_partial: Record<string, string | string[]>; // question_id -> answer(s)
  current_step: 'gate' | 'quiz' | 'results' | 'readiness';
  current_question_index?: number;
  updated_at: string;
}

// ============================================================================
// Match Outcomes
// ============================================================================

export type ConfidenceBand = 'strong' | 'good' | 'explore';
export type GlobalConfidence = 'high' | 'medium' | 'low';

export interface ProgramMatch {
  program_id: string;
  confidence_band: ConfidenceBand;
  reasons: string[];
  trait_signals?: Record<string, number>; // trait_id -> alignment score
  skill_signals?: Record<string, number>; // skill_id -> alignment score
}

export interface ProgramMatchOutcome {
  lead_id: string;
  ranked_programs: ProgramMatch[];
  global_confidence: GlobalConfidence;
  generated_by: 'baseline' | 'ai' | 'fallback';
  top_trait_signals?: Record<string, number>;
  top_skill_signals?: Record<string, number>;
  session_context?: {
    completion_time_seconds?: number;
    questions_answered?: number;
    total_questions?: number;
  };
  created_at: string;
}

// ============================================================================
// Readiness Assessment
// ============================================================================

export type ReadinessBand = 'ready' | 'nearly_ready' | 'explore_prep_path';

export interface ReadinessDimension {
  dimension_id: string;
  label: string;
  description: string;
  weight: number;
  levels: ReadinessLevel[];
}

export interface ReadinessLevel {
  level: 0 | 1 | 2 | 3;
  descriptor: string;
  description: string;
}

export interface ReadinessRubric {
  program_id: string;
  dimensions: ReadinessDimension[];
  band_thresholds: {
    ready: number; // minimum score for "ready"
    nearly_ready: number; // minimum score for "nearly_ready"
    explore_prep_path: number; // below this is "explore_prep_path"
  };
}

export interface ReadinessQuestion {
  question_id: string;
  text: string;
  type: 'single_select' | 'multi_select' | 'slider' | 'confidence';
  options?: ReadinessOption[];
  dimension_mappings: Record<string, number>; // dimension_id -> level contribution
  required: boolean;
  order: number;
}

export interface ReadinessOption {
  option_id: string;
  text: string;
  dimension_scores: Record<string, number>; // dimension_id -> level score
}

export interface PrepGuidance {
  guidance_id: string;
  program_id: string;
  gap_dimensions: string[]; // dimension_ids that trigger this guidance
  title: string;
  description: string;
  steps: string[];
  next_action_cta?: string;
}

export interface ProgramMatchReadiness {
  lead_id: string;
  program_id: string;
  readiness_band: ReadinessBand;
  dimension_scores: Record<string, number>; // dimension_id -> score
  prep_guidance_ids: string[];
  prep_guidance?: PrepGuidance[];
  summary?: string;
  next_steps?: string[];
  completed_at: string;
}

// ============================================================================
// Configuration and Admin
// ============================================================================

export interface ProgramMatchConfig {
  institution_id: string;
  quiz_id: string;
  version_id?: string;
  lead_capture_config: LeadCaptureConfig;
  voice_tone_profile_id: string;
  programs: Program[];
  readiness_available: Record<string, boolean>; // program_id -> available
  theming?: {
    primary_color?: string;
    font_family?: string;
  };
}

// ============================================================================
// Events
// ============================================================================

export type ProgramMatchEventType =
  | 'lead_gate_viewed'
  | 'lead_gate_submitted'
  | 'lead_gate_error'
  | 'quiz_started'
  | 'question_answered'
  | 'progress_saved'
  | 'quiz_completed'
  | 'results_viewed'
  | 'readiness_started'
  | 'readiness_completed'
  | 'resume_link_opened'
  | 'quiz_abandoned'
  | 'cta_clicked'
  | 'recommendation_feedback';

export interface ProgramMatchEvent {
  event_type: ProgramMatchEventType;
  lead_id?: string;
  quiz_id?: string;
  version_id?: string;
  institution_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Analytics
// ============================================================================

export interface ProgramMatchFunnelMetrics {
  date_range: { start: string; end: string };
  gate_viewed: number;
  gate_submitted: number;
  gate_error_count: number;
  quiz_started: number;
  quiz_completed: number;
  results_viewed: number;
  readiness_started: number;
  readiness_completed: number;
  resume_link_opened: number;
  completed_matches: number;
}

export interface ProgramMatchAnalytics {
  funnel: ProgramMatchFunnelMetrics;
  rates: {
    gate_submit_rate: number;
    abandon_rate: number;
    resume_rate: number;
    completion_rate: number;
    readiness_opt_in_rate: number;
    readiness_completion_rate: number;
  };
  match_distribution: Record<string, number>; // program_id -> count
  confidence_distribution: Record<ConfidenceBand, number>;
  readiness_distribution: Record<ReadinessBand, number>;
  drop_off_by_question?: Record<string, number>; // question_id -> abandon count
}

