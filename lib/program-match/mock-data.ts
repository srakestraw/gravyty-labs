/**
 * Mock data for Program Match feature
 */

import type {
  Program,
  Trait,
  Skill,
  Quiz,
  QuizQuestion,
  QuizOption,
  ProgramMatchConfig,
  ProgramMatchLead,
  ProgramMatchProgress,
  ProgramMatchOutcome,
  ReadinessRubric,
  PrepGuidance,
} from './types';

// Mock Traits Library
export const MOCK_TRAITS: Trait[] = [
  {
    trait_id: 'learning_style_visual',
    label: 'Visual Learner',
    description: 'Prefers visual aids and diagrams',
    type: 'learning_style',
  },
  {
    trait_id: 'learning_style_hands_on',
    label: 'Hands-On Learner',
    description: 'Learns best through practice and application',
    type: 'learning_style',
  },
  {
    trait_id: 'orientation_research',
    label: 'Research-Oriented',
    description: 'Enjoys research and theoretical exploration',
    type: 'orientation',
  },
  {
    trait_id: 'orientation_applied',
    label: 'Applied Focus',
    description: 'Prefers practical, real-world application',
    type: 'orientation',
  },
  {
    trait_id: 'collaboration_preference',
    label: 'Collaborative',
    description: 'Works well in teams and group settings',
    type: 'preference',
  },
  {
    trait_id: 'leadership_orientation',
    label: 'Leadership-Oriented',
    description: 'Takes initiative and leads others',
    type: 'personality',
  },
  {
    trait_id: 'persistence',
    label: 'Persistent',
    description: 'Demonstrates resilience and determination',
    type: 'personality',
  },
  {
    trait_id: 'curiosity',
    label: 'Curious',
    description: 'Naturally inquisitive and eager to learn',
    type: 'personality',
  },
];

// Mock Skills Library
export const MOCK_SKILLS: Skill[] = [
  {
    skill_id: 'quantitative_confidence',
    label: 'Quantitative Skills',
    description: 'Confidence with math and data analysis',
    type: 'confidence',
  },
  {
    skill_id: 'writing_confidence',
    label: 'Writing & Communication',
    description: 'Confidence with written and verbal communication',
    type: 'confidence',
  },
  {
    skill_id: 'research_experience',
    label: 'Research Experience',
    description: 'Previous research or academic research experience',
    type: 'experience',
  },
  {
    skill_id: 'project_management',
    label: 'Project Management',
    description: 'Experience managing projects or teams',
    type: 'experience',
  },
];

// Mock Programs
export const MOCK_PROGRAMS: Program[] = [
  {
    program_id: 'mba',
    name: 'Master of Business Administration',
    short_description: 'Comprehensive business leadership program',
    tags: ['business', 'leadership', 'management'],
    modality_flags: {
      online: true,
      hybrid: true,
      on_campus: true,
      part_time: true,
      full_time: true,
    },
    icp_trait_weights: {
      leadership_orientation: 0.25,
      collaboration_preference: 0.20,
      persistence: 0.15,
      orientation_applied: 0.20,
      learning_style_hands_on: 0.20,
    },
    icp_skill_weights: {
      project_management: 0.30,
      writing_confidence: 0.25,
      quantitative_confidence: 0.25,
      research_experience: 0.20,
    },
    status: 'active',
  },
  {
    program_id: 'ms_data_science',
    name: 'Master of Science in Data Science',
    short_description: 'Advanced data analysis and machine learning',
    tags: ['data', 'analytics', 'technology'],
    modality_flags: {
      online: true,
      hybrid: true,
      on_campus: true,
      part_time: true,
      full_time: true,
    },
    icp_trait_weights: {
      orientation_research: 0.20,
      curiosity: 0.25,
      persistence: 0.20,
      learning_style_visual: 0.20,
      learning_style_hands_on: 0.15,
    },
    icp_skill_weights: {
      quantitative_confidence: 0.40,
      research_experience: 0.30,
      writing_confidence: 0.15,
      project_management: 0.15,
    },
    status: 'active',
  },
  {
    program_id: 'ma_education',
    name: 'Master of Arts in Education',
    short_description: 'Advanced teaching and educational leadership',
    tags: ['education', 'teaching', 'leadership'],
    modality_flags: {
      online: true,
      hybrid: true,
      on_campus: false,
      part_time: true,
      full_time: true,
    },
    icp_trait_weights: {
      collaboration_preference: 0.25,
      leadership_orientation: 0.20,
      persistence: 0.20,
      orientation_applied: 0.20,
      learning_style_hands_on: 0.15,
    },
    icp_skill_weights: {
      writing_confidence: 0.35,
      project_management: 0.25,
      research_experience: 0.20,
      quantitative_confidence: 0.20,
    },
    status: 'active',
  },
];

// Mock Quiz Questions
const createMockQuestions = (): QuizQuestion[] => [
  {
    question_id: 'q1',
    text: 'How do you prefer to learn new concepts?',
    type: 'single_select',
    required: true,
    order: 1,
    options: [
      {
        option_id: 'opt1_1',
        text: 'Through visual diagrams and charts',
        trait_deltas: { learning_style_visual: 10 },
      },
      {
        option_id: 'opt1_2',
        text: 'By doing hands-on practice',
        trait_deltas: { learning_style_hands_on: 10 },
      },
      {
        option_id: 'opt1_3',
        text: 'Through reading and research',
        trait_deltas: { orientation_research: 10 },
      },
      {
        option_id: 'opt1_4',
        text: 'By applying to real problems',
        trait_deltas: { orientation_applied: 10 },
      },
    ],
  },
  {
    question_id: 'q2',
    text: 'What best describes your work style?',
    type: 'single_select',
    required: true,
    order: 2,
    options: [
      {
        option_id: 'opt2_1',
        text: 'I prefer working in teams',
        trait_deltas: { collaboration_preference: 10 },
      },
      {
        option_id: 'opt2_2',
        text: 'I like to take the lead',
        trait_deltas: { leadership_orientation: 10 },
      },
      {
        option_id: 'opt2_3',
        text: 'I work well independently',
        trait_deltas: { persistence: 8 },
      },
    ],
  },
  {
    question_id: 'q3',
    text: 'How confident are you with quantitative analysis?',
    type: 'slider',
    required: true,
    order: 3,
  },
  {
    question_id: 'q4',
    text: 'What interests you most about graduate study?',
    type: 'multi_select',
    required: true,
    order: 4,
    options: [
      {
        option_id: 'opt4_1',
        text: 'Research and discovery',
        trait_deltas: { orientation_research: 8, curiosity: 8 },
      },
      {
        option_id: 'opt4_2',
        text: 'Practical application',
        trait_deltas: { orientation_applied: 8 },
      },
      {
        option_id: 'opt4_3',
        text: 'Leadership development',
        trait_deltas: { leadership_orientation: 8 },
      },
    ],
  },
];

// Mock Quiz
export const MOCK_QUIZ: Quiz = {
  quiz_id: 'quiz_grad_match_v1',
  version_id: 'v1',
  institution_id: 'inst_123',
  questions: createMockQuestions(),
  mappings: [],
  voiceToneProfileId: 'voice_tone_default',
  status: 'published',
  published_at: new Date().toISOString(),
  published_by: 'admin@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock Config
export function getMockProgramMatchConfig(
  institutionId: string = 'inst_123',
  quizId: string = 'quiz_grad_match_v1',
  versionId?: string
): ProgramMatchConfig {
  return {
    institution_id: institutionId,
    quiz_id: quizId,
    version_id: versionId || 'v1',
    lead_capture_config: {
      mode: 'required_pre_quiz',
      fields: {
        email: { required: true, enabled: true },
        first_name: { required: false, enabled: true },
        last_name: { required: false, enabled: true },
        phone: { required: false, enabled: true },
        intended_start_term: { required: false, enabled: true },
        modality_preference: { required: false, enabled: true },
      },
      consent: {
        email_consent: {
          required: false,
          enabled: true,
          label: 'I agree to receive email communications',
        },
        sms_consent: {
          required: false,
          enabled: true,
          label: 'I agree to receive SMS communications',
        },
      },
      resume_ttl_hours: 168, // 7 days
      abandon_window_minutes: 30,
      lead_capture_counts_as_rfi: true,
      send_resume_link_immediately: false,
    },
    voice_tone_profile_id: 'voice_tone_default',
    programs: MOCK_PROGRAMS,
    readiness_available: {
      mba: true,
      ms_data_science: true,
      ma_education: true,
    },
  };
}

// In-memory storage for leads and progress (replace with real persistence)
const leadsStore = new Map<string, ProgramMatchLead>();
const progressStore = new Map<string, ProgramMatchProgress>();
const outcomesStore = new Map<string, ProgramMatchOutcome>();

export function createMockLead(data: {
  quiz_id: string;
  version_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  intended_start_term?: string;
  modality_preference?: string;
  email_consent?: boolean;
  sms_consent?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
}): ProgramMatchLead {
  const lead_id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const resume_token = `token_${Math.random().toString(36).substr(2, 32)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const lead: ProgramMatchLead = {
    lead_id,
    institution_id: 'inst_123',
    quiz_id: data.quiz_id,
    version_id: data.version_id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    intended_start_term: data.intended_start_term,
    modality_preference: data.modality_preference,
    email_consent: data.email_consent,
    sms_consent: data.sms_consent,
    status: 'captured',
    resume_token,
    resume_expires_at: expiresAt.toISOString(),
    resume_url: `${typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}/program-match/resume?token=${resume_token}`,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    referrer: data.referrer,
    device_type: data.device_type,
    created_at: now.toISOString(),
    last_activity_at: now.toISOString(),
  };

  leadsStore.set(lead_id, lead);
  return lead;
}

export function getMockLead(leadId: string): ProgramMatchLead | null {
  return leadsStore.get(leadId) || null;
}

export function getMockLeadByToken(token: string): ProgramMatchLead | null {
  for (const lead of leadsStore.values()) {
    if (lead.resume_token === token) {
      return lead;
    }
  }
  return null;
}

export function saveMockProgress(
  leadId: string,
  data: {
    responses_partial: Record<string, string | string[]>;
    current_step: 'gate' | 'quiz' | 'results' | 'readiness';
    current_question_index?: number;
  }
): ProgramMatchProgress {
  const progress: ProgramMatchProgress = {
    lead_id: leadId,
    responses_partial: data.responses_partial,
    current_step: data.current_step,
    current_question_index: data.current_question_index,
    updated_at: new Date().toISOString(),
  };

  progressStore.set(leadId, progress);

  // Update lead last_activity_at
  const lead = leadsStore.get(leadId);
  if (lead) {
    lead.last_activity_at = new Date().toISOString();
    if (data.current_step !== 'gate') {
      lead.status = 'in_progress';
    }
    leadsStore.set(leadId, lead);
  }

  return progress;
}

export function getMockProgress(leadId: string): ProgramMatchProgress | null {
  return progressStore.get(leadId) || null;
}

export function saveMockOutcome(leadId: string, outcome: ProgramMatchOutcome): void {
  outcomesStore.set(leadId, outcome);

  // Update lead status
  const lead = leadsStore.get(leadId);
  if (lead) {
    lead.status = 'completed';
    lead.last_activity_at = new Date().toISOString();
    leadsStore.set(leadId, lead);
  }
}

export function getMockOutcome(leadId: string): ProgramMatchOutcome | null {
  return outcomesStore.get(leadId) || null;
}

// Mock Readiness Data
const readinessStore = new Map<string, ProgramMatchReadiness>();

export const MOCK_READINESS_RUBRICS: Record<string, ReadinessRubric> = {
  mba: {
    program_id: 'mba',
    dimensions: [
      {
        dimension_id: 'quantitative_readiness',
        label: 'Quantitative Readiness',
        description: 'Math and data analysis skills',
        weight: 0.30,
        levels: [
          { level: 0, descriptor: 'No experience', description: 'No quantitative background' },
          { level: 1, descriptor: 'Basic', description: 'Some quantitative coursework' },
          { level: 2, descriptor: 'Intermediate', description: 'Strong quantitative foundation' },
          { level: 3, descriptor: 'Advanced', description: 'Expert-level quantitative skills' },
        ],
      },
      {
        dimension_id: 'writing_communication',
        label: 'Writing & Communication',
        description: 'Written and verbal communication skills',
        weight: 0.25,
        levels: [
          { level: 0, descriptor: 'No experience', description: 'Limited writing experience' },
          { level: 1, descriptor: 'Basic', description: 'Some writing experience' },
          { level: 2, descriptor: 'Intermediate', description: 'Strong communication skills' },
          { level: 3, descriptor: 'Advanced', description: 'Excellent communication skills' },
        ],
      },
      {
        dimension_id: 'business_familiarity',
        label: 'Business Familiarity',
        description: 'Understanding of business concepts',
        weight: 0.25,
        levels: [
          { level: 0, descriptor: 'No experience', description: 'No business background' },
          { level: 1, descriptor: 'Basic', description: 'Some business exposure' },
          { level: 2, descriptor: 'Intermediate', description: 'Good business understanding' },
          { level: 3, descriptor: 'Advanced', description: 'Strong business background' },
        ],
      },
      {
        dimension_id: 'time_modality_fit',
        label: 'Time & Modality Fit',
        description: 'Ability to commit time and preferred learning format',
        weight: 0.20,
        levels: [
          { level: 0, descriptor: 'Poor fit', description: 'Limited time availability' },
          { level: 1, descriptor: 'Fair fit', description: 'Some time constraints' },
          { level: 2, descriptor: 'Good fit', description: 'Good time availability' },
          { level: 3, descriptor: 'Excellent fit', description: 'Ideal time and modality match' },
        ],
      },
    ],
    band_thresholds: {
      ready: 2.0,
      nearly_ready: 1.5,
      explore_prep_path: 0.0,
    },
  },
};

export const MOCK_READINESS_QUESTIONS: Record<string, ReadinessQuestion[]> = {
  mba: [
    {
      question_id: 'rq1',
      text: 'How confident are you with quantitative analysis and data interpretation?',
      type: 'confidence',
      required: true,
      order: 1,
      dimension_mappings: {
        quantitative_readiness: 0.03, // Maps slider value (0-100) to dimension score
      },
    },
    {
      question_id: 'rq2',
      text: 'What is your experience with business writing and professional communication?',
      type: 'single_select',
      required: true,
      order: 2,
      options: [
        {
          option_id: 'rq2_1',
          text: 'Limited experience',
          dimension_scores: { writing_communication: 0.5 },
        },
        {
          option_id: 'rq2_2',
          text: 'Some experience',
          dimension_scores: { writing_communication: 1.5 },
        },
        {
          option_id: 'rq2_3',
          text: 'Regular experience',
          dimension_scores: { writing_communication: 2.5 },
        },
        {
          option_id: 'rq2_4',
          text: 'Extensive experience',
          dimension_scores: { writing_communication: 3.0 },
        },
      ],
      dimension_mappings: {},
    },
    {
      question_id: 'rq3',
      text: 'Which business areas are you familiar with?',
      type: 'multi_select',
      required: true,
      order: 3,
      options: [
        {
          option_id: 'rq3_1',
          text: 'Finance',
          dimension_scores: { business_familiarity: 0.5 },
        },
        {
          option_id: 'rq3_2',
          text: 'Marketing',
          dimension_scores: { business_familiarity: 0.5 },
        },
        {
          option_id: 'rq3_3',
          text: 'Operations',
          dimension_scores: { business_familiarity: 0.5 },
        },
        {
          option_id: 'rq3_4',
          text: 'Strategy',
          dimension_scores: { business_familiarity: 0.5 },
        },
      ],
      dimension_mappings: {},
    },
    {
      question_id: 'rq4',
      text: 'How many hours per week can you commit to your studies?',
      type: 'single_select',
      required: true,
      order: 4,
      options: [
        {
          option_id: 'rq4_1',
          text: 'Less than 10 hours',
          dimension_scores: { time_modality_fit: 0.5 },
        },
        {
          option_id: 'rq4_2',
          text: '10-15 hours',
          dimension_scores: { time_modality_fit: 1.5 },
        },
        {
          option_id: 'rq4_3',
          text: '15-20 hours',
          dimension_scores: { time_modality_fit: 2.5 },
        },
        {
          option_id: 'rq4_4',
          text: 'More than 20 hours',
          dimension_scores: { time_modality_fit: 3.0 },
        },
      ],
      dimension_mappings: {},
    },
  ],
};

export const MOCK_PREP_GUIDANCE: PrepGuidance[] = [
  {
    guidance_id: 'prep_quantitative',
    program_id: 'mba',
    gap_dimensions: ['quantitative_readiness'],
    title: 'Build Quantitative Skills',
    description: 'Strengthen your quantitative foundation before starting the program.',
    steps: [
      'Complete a statistics or quantitative methods course',
      'Practice with business case studies involving data analysis',
      'Consider a quantitative skills bootcamp',
    ],
    next_action_cta: 'Explore Prep Courses',
  },
  {
    guidance_id: 'prep_writing',
    program_id: 'mba',
    gap_dimensions: ['writing_communication'],
    title: 'Enhance Communication Skills',
    description: 'Develop your business writing and presentation skills.',
    steps: [
      'Take a business writing course',
      'Practice writing business memos and reports',
      'Join a Toastmasters or public speaking group',
    ],
    next_action_cta: 'Find Writing Resources',
  },
  {
    guidance_id: 'prep_business',
    program_id: 'mba',
    gap_dimensions: ['business_familiarity'],
    title: 'Build Business Foundation',
    description: 'Familiarize yourself with core business concepts.',
    steps: [
      'Read business case studies',
      'Take introductory business courses',
      'Attend business networking events',
    ],
    next_action_cta: 'Explore Business Resources',
  },
  {
    guidance_id: 'prep_general',
    program_id: 'mba',
    gap_dimensions: [],
    title: 'General Preparation',
    description: 'General preparation steps for success.',
    steps: [
      'Review program requirements',
      'Connect with current students',
      'Attend information sessions',
    ],
  },
];

export function saveMockReadiness(readiness: ProgramMatchReadiness): void {
  readinessStore.set(`${readiness.lead_id}_${readiness.program_id}`, readiness);
}

export function getMockReadiness(leadId: string, programId: string): ProgramMatchReadiness | null {
  return readinessStore.get(`${leadId}_${programId}`) || null;
}

