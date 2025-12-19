import type { 
  DataProvider, 
  DataContext,
  AdmissionsLeadershipTrendData,
  AdmissionsLeadershipBottleneckData,
  AdmissionsLeadershipFunnelData,
  AdmissionsLeadershipData,
  AdmissionsLeadershipInsights,
  AdmissionsOperatorTodaysFocusData,
  AdmissionsOperatorGamePlanData,
  AdmissionsOperatorMomentumData,
  AdmissionsOperatorFlaggedRiskData,
  AdmissionsOperatorGoalTrackerData,
  AdmissionsOperatorAssistantData,
  AdmissionsOperatorRecentWinData,
  AdmissionsOperatorRecentActivityData,
  AdmissionsTeamGamePlanData,
  PipelineTeamForecastData,
  PipelineLeadershipForecastData,
  PipelineLeadershipPortfolioHealthData,
  PipelineLeadershipTeamForecastSnapshotData,
  PipelineLeadershipStatusSummaryData,
  PipelineLeadershipKeyRiskOrOpportunity,
  PipelineLeadershipIntervention,
  PipelineLeadershipInsightsData,
  ProgramMatchHubSummary,
  ProgramMatchChecklistItem,
  ProgramMatchLibrariesSummary,
  ProgramMatchProgramsSummary,
  ProgramMatchCandidatesSummary,
  ProgramMatchAnalyticsSummary,
  ProgramMatchDraftConfig,
  ProgramMatchGateConfig,
  VoiceToneProfile,
  ProgramMatchTrait,
  ProgramMatchSkill,
  ProgramMatchProgram,
  ProgramMatchICPBuckets,
  ProgramMatchProgramICP,
  ProgramMatchTemplateSummary,
  ProgramMatchTemplatePackage,
  ProgramMatchTemplateApplyPlan,
  ProgramMatchTemplateApplyResult,
  ProgramMatchAnswerPayload,
  ProgramMatchScoreResult,
  ProgramMatchExplanation,
  ProgramMatchExplanationsResult,
  ProgramMatchPublishSnapshot,
  ProgramMatchPreviewLink,
  ProgramMatchDeployConfig,
  ProgramMatchRFI,
  ProgramMatchOutcome,
  ProgramMatchProgramOutcomes,
  ProgramMatchQuizQuestion,
  ProgramMatchQuizOption,
  ProgramMatchQuizDraft,
  ProgramMatchQuiz,
  ProgramMatchQuizPublishedVersion,
  ProgramMatchQuizAIDraftRequest,
  ProgramMatchWidgetConfig,
  ProgramMatchCandidatesListResponse,
  ProgramMatchAnalytics,
} from "@/lib/data/provider";
import { loadCommunicationConfig } from "@/lib/communication/store";

import { getMockAgentOpsItems, getMockAgentOpsItemsForWorkspace } from "@/lib/agent-ops/mock";
import { MOCK_CONTACTS } from "@/lib/contacts/mock-contacts";
import { MOCK_SEGMENTS } from "@/lib/segments/mock-segments";
import { MOCK_SEGMENTS as MOCK_SEGMENT_DEFINITIONS, getSegmentsByWorkspace } from "@/components/shared/ai-platform/segments/mock-data";
import { getMockGuardrailPolicies } from "@/lib/guardrails/mockPolicies";
import { MOCK_DO_NOT_ENGAGE } from "@/lib/do-not-engage/mockDoNotEngage";
import type { QueueItem } from "@/lib/data/provider";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory storage for Program Match draft config
let programMatchDraftConfig: ProgramMatchDraftConfig = {
  id: 'pm_draft_1',
  status: 'draft',
  voiceToneProfileId: null,
  outcomesEnabled: false,
  gate: {
    enabled: true,
    requiredFields: {
      email: true,
      firstName: true,
      lastName: true,
      phone: false,
    },
    consent: {
      emailOptIn: false,
      smsOptIn: false,
    },
    copy: {
      headline: 'Before we start',
      helperText: 'Share a few details so we can send program information if you\'d like.',
    },
  },
  updatedAt: new Date().toISOString(),
};

// In-memory storage for Program Match libraries and programs
const programMatchTraits: ProgramMatchTrait[] = [];
const programMatchSkills: ProgramMatchSkill[] = [];
const programMatchPrograms: ProgramMatchProgram[] = [];
const programMatchICPByProgramId = new Map<string, ProgramMatchProgramICP>();
const programMatchOutcomes: ProgramMatchOutcome[] = [];
const programMatchProgramOutcomesById = new Map<string, ProgramMatchProgramOutcomes>();
const programMatchRFIs: ProgramMatchRFI[] = [];

// Quiz Library storage
const programMatchQuizzes: ProgramMatchQuiz[] = [];
const programMatchQuizDraftByQuizId = new Map<string, ProgramMatchQuizDraft>();
const programMatchQuizPublishedByQuizId = new Map<string, ProgramMatchQuizPublishedVersion[]>();

// Seed data flag
let programMatchSeeded = false;

// Seed data constants
const SEED_TRAITS: ProgramMatchTrait[] = [
  { id: "trait_curiosity", name: "Curiosity", category: "Mindset", description: "Enjoys exploring new ideas and asking questions.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_grit", name: "Grit", category: "Mindset", description: "Sticks with challenges and follows through.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_growth_mindset", name: "Growth mindset", category: "Mindset", description: "Believes skills can be developed with effort and feedback.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_structure", name: "Preference for structure", category: "Learning style", description: "Likes clear expectations, steps, and milestones.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_flexibility", name: "Flexibility", category: "Learning style", description: "Comfortable adapting plans and exploring options.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_collaboration", name: "Collaboration", category: "Working style", description: "Enjoys teamwork and learning with others.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_independence", name: "Independence", category: "Working style", description: "Prefers owning work and moving at a self-directed pace.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_leadership", name: "Leadership", category: "Working style", description: "Enjoys guiding others and taking responsibility.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_empathy", name: "Empathy", category: "Working style", description: "Values understanding others' needs and perspectives.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_detail_oriented", name: "Detail-oriented", category: "Working style", description: "Cares about accuracy and noticing edge cases.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_big_picture", name: "Big-picture thinking", category: "Working style", description: "Likes connecting dots and seeing the larger system.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_practical", name: "Practical problem solving", category: "Approach", description: "Prefers applied learning and real-world examples.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_analytical", name: "Analytical thinking", category: "Approach", description: "Enjoys patterns, logic, and structured reasoning.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_creative", name: "Creative thinking", category: "Approach", description: "Enjoys ideation and generating new possibilities.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_impact", name: "Impact-driven", category: "Motivation", description: "Motivated by meaningful outcomes and helping others.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_advancement", name: "Career advancement", category: "Motivation", description: "Motivated by growth, promotions, and momentum.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_stability", name: "Stability-focused", category: "Motivation", description: "Values predictability and long-term security.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "trait_time_sensitive", name: "Time-sensitive", category: "Constraints", description: "Needs an efficient path that fits a busy schedule.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SEED_SKILLS: ProgramMatchSkill[] = [
  { id: "skill_writing", name: "Writing and communication", category: "Communication", description: "Comfortable expressing ideas clearly in writing.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_presenting", name: "Presenting", category: "Communication", description: "Comfortable sharing ideas with others.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_quant", name: "Quantitative reasoning", category: "Analytical", description: "Comfortable with numbers and basic analysis.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_research", name: "Research", category: "Analytical", description: "Able to find, evaluate, and synthesize information.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_data_literacy", name: "Data literacy", category: "Analytical", description: "Comfortable reading charts, dashboards, and metrics.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_programming", name: "Programming basics", category: "Technical", description: "Some exposure to coding or scripting concepts.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_project_mgmt", name: "Project management", category: "Leadership", description: "Planning, organizing, and delivering work.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_stakeholders", name: "Stakeholder management", category: "Leadership", description: "Aligning with others and navigating tradeoffs.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_teamwork", name: "Teamwork", category: "Collaboration", description: "Working effectively with others.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_time_mgmt", name: "Time management", category: "Self-management", description: "Managing schedule and priorities effectively.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_self_direction", name: "Self-direction", category: "Self-management", description: "Making progress independently with minimal oversight.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "skill_feedback", name: "Feedback and iteration", category: "Self-management", description: "Using feedback to improve over time.", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SEED_PROGRAMS: ProgramMatchProgram[] = [
  { id: "prog_mba", name: "MBA - Business Administration", status: "active", updatedAt: new Date().toISOString() },
  { id: "prog_msds", name: "MS - Data Science", status: "active", updatedAt: new Date().toISOString() },
  { id: "prog_med", name: "MEd - Education Leadership", status: "active", updatedAt: new Date().toISOString() },
];

const SEED_ICP_BY_PROGRAM = new Map<string, ProgramMatchProgramICP>([
  ["prog_mba", {
    programId: "prog_mba",
    buckets: {
      critical: {
        traitIds: ["trait_leadership","trait_big_picture","trait_advancement","trait_collaboration","trait_practical"],
        skillIds: ["skill_stakeholders","skill_project_mgmt","skill_presenting"]
      },
      veryImportant: {
        traitIds: ["trait_structure","trait_detail_oriented","trait_grit"],
        skillIds: ["skill_writing","skill_time_mgmt"]
      },
      important: {
        traitIds: ["trait_flexibility","trait_creative"],
        skillIds: ["skill_teamwork"]
      },
      niceToHave: {
        traitIds: ["trait_curiosity"],
        skillIds: []
      }
    },
    updatedAt: new Date().toISOString(),
  }],
  ["prog_msds", {
    programId: "prog_msds",
    buckets: {
      critical: {
        traitIds: ["trait_analytical","trait_detail_oriented","trait_grit","trait_curiosity","trait_structure"],
        skillIds: ["skill_quant","skill_data_literacy","skill_research","skill_programming"]
      },
      veryImportant: {
        traitIds: ["trait_big_picture","trait_practical"],
        skillIds: ["skill_writing","skill_feedback"]
      },
      important: {
        traitIds: ["trait_independence","trait_growth_mindset"],
        skillIds: ["skill_self_direction","skill_time_mgmt"]
      },
      niceToHave: {
        traitIds: ["trait_flexibility"],
        skillIds: []
      }
    },
    updatedAt: new Date().toISOString(),
  }],
  ["prog_med", {
    programId: "prog_med",
    buckets: {
      critical: {
        traitIds: ["trait_impact","trait_empathy","trait_leadership","trait_collaboration","trait_structure"],
        skillIds: ["skill_writing","skill_stakeholders","skill_project_mgmt"]
      },
      veryImportant: {
        traitIds: ["trait_grit","trait_big_picture"],
        skillIds: ["skill_presenting","skill_teamwork"]
      },
      important: {
        traitIds: ["trait_growth_mindset","trait_practical"],
        skillIds: ["skill_feedback"]
      },
      niceToHave: {
        traitIds: ["trait_flexibility"],
        skillIds: []
      }
    },
    updatedAt: new Date().toISOString(),
  }],
]);

// Seed Quiz Library
const SEED_QUIZES: ProgramMatchQuiz[] = [
  {
    id: "quiz_general_1",
    name: "General Graduate Program Quiz",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastPublishedAt: null,
    activePublishedVersionId: null,
  },
  {
    id: "quiz_business_1",
    name: "Business School Quiz",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastPublishedAt: null,
    activePublishedVersionId: null,
  },
];

const SEED_QUIZ_DRAFT_GENERAL: ProgramMatchQuizDraft = {
  id: "pm_quiz_draft_general_1",
  quizId: "quiz_general_1",
  title: "Find your best-fit graduate program",
  description: "A quick, lightweight quiz to point you toward programs that match your goals and style.",
  targetLength: 8,
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: "q1",
      type: "single_select",
      section: "fit",
      prompt: "When you picture a great learning experience, what feels most you?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q1o1", label: "Clear steps and milestones", traitIds: ["trait_structure"], skillIds: ["skill_time_mgmt"] },
        { id: "q1o2", label: "Hands-on, practical projects", traitIds: ["trait_practical"], skillIds: ["skill_project_mgmt"] },
        { id: "q1o3", label: "Deep thinking and analysis", traitIds: ["trait_analytical"], skillIds: ["skill_quant","skill_data_literacy"] },
        { id: "q1o4", label: "People-focused and collaborative", traitIds: ["trait_empathy","trait_collaboration"], skillIds: ["skill_teamwork"] },
      ],
    },
    {
      id: "q2",
      type: "single_select",
      section: "fit",
      prompt: "What's motivating you most right now?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q2o1", label: "Career momentum and advancement", traitIds: ["trait_advancement"], skillIds: [] },
        { id: "q2o2", label: "Doing meaningful work and impact", traitIds: ["trait_impact"], skillIds: [] },
        { id: "q2o3", label: "More stability and predictability", traitIds: ["trait_stability"], skillIds: [] },
        { id: "q2o4", label: "Exploring what I might love next", traitIds: ["trait_curiosity","trait_flexibility"], skillIds: [] },
      ],
    },
    {
      id: "q3",
      type: "single_select",
      section: "fit",
      prompt: "Pick a vibe: how do you like to work?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q3o1", label: "I like owning my work end-to-end", traitIds: ["trait_independence"], skillIds: ["skill_self_direction"] },
        { id: "q3o2", label: "I like leading and coordinating", traitIds: ["trait_leadership"], skillIds: ["skill_stakeholders","skill_project_mgmt"] },
        { id: "q3o3", label: "I like collaborating and brainstorming", traitIds: ["trait_collaboration","trait_creative"], skillIds: ["skill_teamwork"] },
        { id: "q3o4", label: "I like precision and getting details right", traitIds: ["trait_detail_oriented"], skillIds: ["skill_research"] },
      ],
    },
    {
      id: "q4",
      type: "single_select",
      section: "readiness",
      prompt: "Which feels most comfortable today?",
      helperText: "No wrong answers - this just helps us tailor recommendations.",
      isOptional: true,
      options: [
        { id: "q4o1", label: "Writing and explaining my thinking", traitIds: [], skillIds: ["skill_writing"] },
        { id: "q4o2", label: "Presenting or facilitating discussions", traitIds: [], skillIds: ["skill_presenting"] },
        { id: "q4o3", label: "Working with numbers or analysis", traitIds: [], skillIds: ["skill_quant","skill_data_literacy"] },
        { id: "q4o4", label: "Planning and coordinating a project", traitIds: [], skillIds: ["skill_project_mgmt"] },
      ],
    },
    {
      id: "q5",
      type: "single_select",
      section: "fit",
      prompt: "What's your schedule reality?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q5o1", label: "I'm time-limited and need efficiency", traitIds: ["trait_time_sensitive"], skillIds: ["skill_time_mgmt"] },
        { id: "q5o2", label: "I can make time if it's structured", traitIds: ["trait_structure"], skillIds: [] },
        { id: "q5o3", label: "I can flex my schedule", traitIds: ["trait_flexibility"], skillIds: [] },
        { id: "q5o4", label: "I thrive when I self-direct", traitIds: ["trait_independence"], skillIds: ["skill_self_direction"] },
      ],
    },
    {
      id: "q6",
      type: "single_select",
      section: "fit",
      prompt: "Pick the kind of challenge you enjoy most.",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q6o1", label: "Solving real-world problems", traitIds: ["trait_practical"], skillIds: ["skill_project_mgmt"] },
        { id: "q6o2", label: "Finding patterns in complex info", traitIds: ["trait_analytical"], skillIds: ["skill_research","skill_data_literacy"] },
        { id: "q6o3", label: "Helping people grow and succeed", traitIds: ["trait_empathy","trait_impact"], skillIds: ["skill_stakeholders"] },
        { id: "q6o4", label: "Leading a team through change", traitIds: ["trait_leadership","trait_grit"], skillIds: ["skill_stakeholders","skill_feedback"] },
      ],
    },
    {
      id: "q7",
      type: "single_select",
      section: "readiness",
      prompt: "When you get feedback, you tend to…",
      helperText: null,
      isOptional: true,
      options: [
        { id: "q7o1", label: "Iterate quickly and improve", traitIds: ["trait_growth_mindset"], skillIds: ["skill_feedback"] },
        { id: "q7o2", label: "Ask questions to understand it", traitIds: ["trait_curiosity"], skillIds: [] },
        { id: "q7o3", label: "Prefer clear, specific notes", traitIds: ["trait_structure","trait_detail_oriented"], skillIds: [] },
        { id: "q7o4", label: "Take time, then come back strong", traitIds: ["trait_grit"], skillIds: [] },
      ],
    },
    {
      id: "q8",
      type: "single_select",
      section: "fit",
      prompt: "Which statement feels closest?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "q8o1", label: "I like thinking big-picture and strategy", traitIds: ["trait_big_picture"], skillIds: ["skill_stakeholders"] },
        { id: "q8o2", label: "I like building skills I can use immediately", traitIds: ["trait_practical"], skillIds: ["skill_project_mgmt"] },
        { id: "q8o3", label: "I like digging into data and evidence", traitIds: ["trait_analytical"], skillIds: ["skill_data_literacy","skill_research"] },
        { id: "q8o4", label: "I like leading and helping others succeed", traitIds: ["trait_leadership","trait_empathy"], skillIds: ["skill_presenting"] },
      ],
    },
  ],
};

const SEED_QUIZ_DRAFT_BUSINESS: ProgramMatchQuizDraft = {
  id: "pm_quiz_draft_business_1",
  quizId: "quiz_business_1",
  title: "Find your best-fit business program",
  description: "A focused quiz for business-minded professionals exploring MBA and related programs.",
  targetLength: 8,
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: "bq1",
      type: "single_select",
      section: "fit",
      prompt: "What drives your interest in business education?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "bq1o1", label: "Career advancement and leadership roles", traitIds: ["trait_advancement", "trait_leadership"], skillIds: ["skill_stakeholders"] },
        { id: "bq1o2", label: "Building strategic thinking skills", traitIds: ["trait_big_picture"], skillIds: ["skill_project_mgmt"] },
        { id: "bq1o3", label: "Networking and collaboration", traitIds: ["trait_collaboration"], skillIds: ["skill_teamwork"] },
        { id: "bq1o4", label: "Practical, real-world application", traitIds: ["trait_practical"], skillIds: ["skill_project_mgmt"] },
      ],
    },
    {
      id: "bq2",
      type: "single_select",
      section: "fit",
      prompt: "How do you prefer to learn business concepts?",
      helperText: null,
      isOptional: false,
      options: [
        { id: "bq2o1", label: "Case studies and real scenarios", traitIds: ["trait_practical"], skillIds: ["skill_research"] },
        { id: "bq2o2", label: "Data-driven analysis", traitIds: ["trait_analytical"], skillIds: ["skill_quant", "skill_data_literacy"] },
        { id: "bq2o3", label: "Group discussions and debates", traitIds: ["trait_collaboration"], skillIds: ["skill_presenting"] },
        { id: "bq2o4", label: "Structured frameworks and models", traitIds: ["trait_structure"], skillIds: [] },
      ],
    },
    ...SEED_QUIZ_DRAFT_GENERAL.questions.slice(2), // Reuse remaining questions
  ],
};

// Seeding helper function
function seedProgramMatchIfNeeded() {
  if (programMatchSeeded) return;
  
  // Seed traits
  SEED_TRAITS.forEach(trait => {
    if (!programMatchTraits.find(t => t.id === trait.id)) {
      programMatchTraits.push(trait);
    }
  });

  // Seed skills
  SEED_SKILLS.forEach(skill => {
    if (!programMatchSkills.find(s => s.id === skill.id)) {
      programMatchSkills.push(skill);
    }
  });

  // Seed programs
  SEED_PROGRAMS.forEach(program => {
    if (!programMatchPrograms.find(p => p.id === program.id)) {
      programMatchPrograms.push(program);
    }
  });

  // Seed ICPs
  SEED_ICP_BY_PROGRAM.forEach((icp, programId) => {
    if (!programMatchICPByProgramId.has(programId)) {
      programMatchICPByProgramId.set(programId, icp);
    }
  });

  // Seed quizzes
  SEED_QUIZES.forEach(quiz => {
    if (!programMatchQuizzes.find(q => q.id === quiz.id)) {
      programMatchQuizzes.push(quiz);
    }
  });

  // Seed quiz drafts
  if (!programMatchQuizDraftByQuizId.has("quiz_general_1")) {
    programMatchQuizDraftByQuizId.set("quiz_general_1", SEED_QUIZ_DRAFT_GENERAL);
  }
  if (!programMatchQuizDraftByQuizId.has("quiz_business_1")) {
    programMatchQuizDraftByQuizId.set("quiz_business_1", SEED_QUIZ_DRAFT_BUSINESS);
  }

  // Try to set voice tone profile if available
  // Note: This would need to check if listVoiceToneProfiles exists and has profiles
  // For now, we'll leave it null as the seed data doesn't depend on it

  programMatchSeeded = true;
}

export const mockProvider: DataProvider = {
  async listQueueItems(ctx: DataContext) {
    seedProgramMatchIfNeeded();
    seedProgramMatchIfNeeded();
    await delay(150);
    let items: QueueItem[];

    // Filter by workspace if provided
    if (ctx.workspace) {
      items = getMockAgentOpsItemsForWorkspace(ctx.workspace);
    } else {
      items = getMockAgentOpsItems();
    }

    // Filter by app if provided (queue items have role which maps to app context)
    if (ctx.app) {
      // Map app IDs to roles for filtering
      const appRoleMap: Record<string, string> = {
        'student-lifecycle': 'Admissions', // default for student-lifecycle
        'advancement': 'Advancement',
      };
      const targetRole = appRoleMap[ctx.app];
      if (targetRole) {
        items = items.filter((item) => item.role === targetRole || (item.role as string) === 'All');
      }
    }

    // Filter by user if provided (items have assignedTo field)
    if (ctx.userId) {
      items = items.filter((item) => !item.assignedTo || item.assignedTo === ctx.userId);
    }

    // Filter by mode if provided (leadership mode might show different items)
    // For now, mode filtering is handled by the UI layer, but we can add logic here if needed
    // if (ctx.mode === 'leadership') {
    //   items = items.filter((item) => item.severity === 'Critical' || item.severity === 'High');
    // }

    return items;
  },

  async listContacts(_ctx: DataContext) {
    await delay(150);
    return MOCK_CONTACTS;
  },

  async getContact(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
  },

  async listSegments(_ctx: DataContext) {
    await delay(150);
    return MOCK_SEGMENTS;
  },

  async getSegment(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENTS.find((s) => s.id === id) ?? null;
  },

  async listSegmentDefinitions(ctx: DataContext) {
    await delay(150);
    // Filter segments by workspace/app context if provided
    if (ctx.workspace || ctx.app) {
      return getSegmentsByWorkspace(ctx.workspace, ctx.app);
    }
    return MOCK_SEGMENT_DEFINITIONS;
  },

  async getSegmentDefinition(_ctx: DataContext, id: string) {
    await delay(100);
    return MOCK_SEGMENT_DEFINITIONS.find((s) => s.id === id) ?? null;
  },

  async listGuardrailPolicies(_ctx: DataContext) {
    await delay(100);
    return getMockGuardrailPolicies();
  },

  async listDoNotEngage(_ctx: DataContext) {
    await delay(100);
    return MOCK_DO_NOT_ENGAGE;
  },

  // Admissions Leadership Charts
  async getAdmissionsLeadershipTrend(ctx: DataContext): Promise<AdmissionsLeadershipTrendData | null> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    // Return placeholder-safe data
    const dates: string[] = [];
    const deposits: number[] = [];
    const today = new Date();
    
    // Generate last 14 days of data
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      // Simulate deposit trend (slight upward trend)
      deposits.push(28 + Math.floor(Math.random() * 8) + (13 - i) * 0.5);
    }

    return { dates, deposits };
  },

  async getAdmissionsLeadershipBottlenecks(ctx: DataContext): Promise<AdmissionsLeadershipBottleneckData[]> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return [];
    }

    // Return placeholder-safe data
    return [
      {
        stage: 'Missing Transcript',
        currentDays: 9.4,
        targetDays: 5,
      },
      {
        stage: 'Application Review',
        currentDays: 12.2,
        targetDays: 7,
      },
      {
        stage: 'Admit → Deposit',
        currentDays: 18.5,
        targetDays: 10,
      },
    ];
  },

  async getAdmissionsLeadershipFunnel(ctx: DataContext): Promise<AdmissionsLeadershipFunnelData | null> {
    await delay(150);
    
    // Only return data for admissions workspace in leadership mode
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    // Return placeholder-safe data
    return {
      stages: [
        {
          label: 'Applications',
          count: 2184,
        },
        {
          label: 'Under Review',
          count: 1520,
          conversionRate: 69.6,
        },
        {
          label: 'Admitted',
          count: 1012,
          conversionRate: 46.3,
        },
        {
          label: 'Deposited',
          count: 436,
          conversionRate: 20.0,
        },
      ],
    };
  },

  // Admissions Leadership Command Center
  async getAdmissionsLeadershipData(ctx: DataContext): Promise<AdmissionsLeadershipData | null> {
    await delay(150);
    
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      alignmentSummary: "Today's team focus aligns with reducing transcript friction and review delays.",
      statusSummary: "Based on current pipeline velocity and conversion rates, Admissions is forecasted to land approximately 30 deposits below target unless mid-funnel bottlenecks are addressed. While application volume is down versus plan, this is an upstream demand signal rather than an admissions execution issue. The primary controllable risk remains review delays and transcript friction.",
      keyRisksAndOpportunities: [
        {
          id: 'review-delays',
          title: 'Mid-Funnel Review Delays Increasing',
          description: 'Application review throughput declined 22% this week, with Business School programs experiencing capacity constraints.',
          forecastImpact: 'Review delays are contributing to a projected 12-deposit shortfall.',
          severity: 'high',
        },
        {
          id: 'transcript-friction',
          title: 'Transcript Requirements Stalling High-Intent Applicants',
          description: 'Average time in transcript collection stage is 9.4 days, nearly double the 5-day target, with 120 applicants currently stalled.',
          forecastImpact: 'Transcript friction is contributing to a projected 15-deposit shortfall, particularly among high-intent applicants who convert at 2× the average rate.',
          severity: 'high',
        },
        {
          id: 'engineering-success',
          title: 'Engineering Programs Outperforming Plan',
          description: 'Engineering programs are demonstrating effective conversion strategies that could be applied to underperforming programs.',
          forecastImpact: 'Applying similar tactics to MBA and Nursing programs could recover an estimated 8–10 deposits.',
          severity: 'opportunity',
        },
      ],
      upstreamDemandSignals: [
        'Application volume is down 4% versus plan (upstream demand signal, not an admissions execution issue).',
        'Inquiry-to-application conversion remains steady, indicating consistent marketing effectiveness.',
      ],
      whatChanged: [
        'Application review backlog increased 37% week over week, extending forecasted time-to-decision.',
        'Deposit conversion declined following the March 1 reminder, contributing to the projected shortfall.',
        'High-intent applicants converted at twice the average rate, highlighting the value of reducing friction for this segment.',
        'Transcript collection stage dwell time increased from 7.2 to 9.4 days, directly impacting forecasted deposit timing.',
      ],
      recommendedInterventions: [
        {
          id: 'reduce-transcript-friction',
          title: 'Reduce transcript friction for high-intent applicants',
          description: 'to recover an estimated 25–30 deposits and improve forecasted outcome.',
          impactText: '25–30 deposits',
          ownerLabel: 'Admissions Ops',
          cta: { label: 'Adjust transcript rules' },
        },
        {
          id: 'reassign-reviewers',
          title: 'Reassign 2 reviewers to MBA pipeline',
          description: 'to address capacity constraints and recover an estimated 10–12 deposits, improving forecasted outcome.',
          impactText: '10–12 deposits',
          ownerLabel: 'Admissions Leadership',
          cta: { label: 'Reallocate reviewers' },
        },
        {
          id: 'deposit-reminder',
          title: 'Launch targeted deposit reminder campaign',
          description: 'for admits who have been admitted for more than 10 days without depositing, with an estimated impact of 15–20 additional deposits to improve forecasted outcome.',
          impactText: '15–20 deposits',
          ownerLabel: 'Marketing/CRM',
          cta: { label: 'Launch deposit reminder' },
        },
      ],
      interventionToTeamNote: "These interventions will generate updated team priorities in Today's Game Plan over the next 7–10 days.",
      whatToWatchNext: [
        'Deposit response to next outreach within 48 hours (validates forecast trajectory)',
        'Review backlog trend after capacity reallocation (indicates whether forecast is improving)',
        'Yield movement by program (signals whether forecasted shortfall is narrowing or widening)',
      ],
    };
  },

  async getAdmissionsLeadershipInsights(ctx: DataContext): Promise<AdmissionsLeadershipInsights | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      outcomeCoverage: [
        {
          id: 'stalled-addressed',
          label: 'Stalled applicants addressed',
          value: '68%',
          subtext: '142 of 208 stalled applicants',
        },
        {
          id: 'admits-touched',
          label: 'Admits touched before deposit deadline',
          value: '84%',
          subtext: '378 of 450 admits',
        },
      ],
      flowHealth: [
        {
          id: 'avg-review-days',
          label: 'Avg days in review',
          value: '12.2 days',
          subtext: 'Target: 7 days',
        },
        {
          id: 'dwell-time-change',
          label: 'Week-over-week dwell time change',
          value: '+2.1 days',
          subtext: 'Increased from 10.1 to 12.2',
        },
      ],
      interventionImpact: [
        {
          id: 'impact-since-intervention',
          label: 'Impact since last intervention',
          value: '23 applicants moved forward',
          subtext: 'After transcript rule adjustment',
        },
        {
          id: 'forecast-change',
          label: 'Forecast change since action',
          value: '+8 deposits',
          subtext: 'Projected improvement',
        },
      ],
    };
  },

  // Admissions Operator Command Center
  async getAdmissionsOperatorTodaysFocus(ctx: DataContext): Promise<AdmissionsOperatorTodaysFocusData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      text: 'Reduce stalled applicants, clear missing documents, and prevent melt for high-intent admits.',
    };
  },

  async getAdmissionsOperatorGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null> {
    await delay(150);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    // Simulate some tasks as completed for demo purposes
    const now = new Date();
    const recentlyCompleted = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    
    return {
      total: 3,
      completed: 1, // One task completed (change to 3 to see completion summary)
      todaysProgressSummary: {
        movedForwardCount: 12,
        narrative: "You've moved 12 applicants forward today.",
      },
      // PHASE 4: Completion summary (shown when completed === total)
      completionSummary: "Today's Game Plan complete. You reduced stall risk across 27 applications.",
      // Coach message: narrative encouragement
      coachMessage: "Your consistent outreach is making a real difference. Today, focus on those high-risk students—early intervention now can change their entire trajectory.",
      items: [
        {
          id: 'stalled-applicants',
          title: 'Reach out to 15 applicants who stalled this week',
          description: 'No portal activity for 7+ days, many are missing only 1–2 items.',
          impactHint: 'Unblocking them can meaningfully boost completion before deadlines.',
          status: 'completed',
          completedAt: recentlyCompleted.toISOString(),
          lastOutcomeSummary: '→ 4 applications moved closer to review',
          goalImpacts: [
            { goalId: 'apps-completed', deltaLabel: 'Completed applications', deltaValue: 4 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=stalled' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
        {
          id: 'missing-documents',
          title: 'Clear missing documents for 20 applicants',
          description: 'Transcripts and recommendation letters are the most common blockers.',
          impactHint: 'Completing these moves applications closer to review-ready status.',
          status: 'open',
          goalImpacts: [
            { goalId: 'apps-completed', deltaLabel: 'Completed applications', deltaValue: 6 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=missing-docs' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
        {
          id: 'melt-risk',
          title: 'Support 10 admits at melt risk',
          description: 'Admitted but low engagement—reach out before they commit elsewhere.',
          impactHint: 'Early intervention can recover 2–3 deposits that would otherwise be lost.',
          status: 'open',
          goalImpacts: [
            { goalId: 'deposits', deltaLabel: 'Deposits', deltaValue: 2 },
          ],
          ctas: [
            { label: 'Open', href: '/student-lifecycle/admissions/agent-ops/queue?filter=melt-risk' },
            { label: 'Let AI suggest next step', href: '/student-lifecycle/admissions/ai-assistants/assistant' },
          ],
        },
      ],
    };
  },

  async getAdmissionsOperatorMomentum(ctx: DataContext): Promise<AdmissionsOperatorMomentumData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      streakDays: 3,
      weeklyChallenge: {
        completed: 9,
        total: 25,
        label: 'Weekly challenge',
      },
      score: 76,
    };
  },

  async getAdmissionsOperatorFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'high-stall-rate',
        title: 'Stall rate increased 15% this week',
        description: 'More applicants going 7+ days without activity than last week.',
        severity: 'high',
      },
      {
        id: 'transcript-delays',
        title: 'Transcript collection delays',
        description: 'Average time in transcript stage is 9.4 days (target: 5).',
        severity: 'medium',
      },
    ];
  },

  async getAdmissionsOperatorGoalTracker(ctx: DataContext): Promise<AdmissionsOperatorGoalTrackerData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return null;
    }

    return {
      title: 'Goal Tracker',
      timeframeLabel: 'This admissions cycle',
      subtitle: "Track how you're progressing against key application goals.",
      metrics: [
        {
          id: 'apps-started',
          label: 'Applications started',
          current: 320,
          target: 400,
          unit: 'apps',
          trend: 'up',
        },
        {
          id: 'apps-completed',
          label: 'Completed applications',
          current: 240,
          target: 300,
          unit: 'apps',
          trend: 'up',
        },
        {
          id: 'admits',
          label: 'Admits',
          current: 180,
          target: 220,
          unit: 'admits',
          trend: 'flat',
        },
        {
          id: 'deposits',
          label: 'Deposits',
          current: 90,
          target: 120,
          unit: 'deposits',
          trend: 'up',
        },
      ],
    };
  },

  async getAdmissionsOperatorAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: '1',
        name: 'Application Progress Assistant',
        status: 'active',
        description: 'Reduce stalled applicants',
        impact: '38% fewer stalled applications (last 7 days)',
      },
      {
        id: '2',
        name: 'Missing Documents Assistant',
        status: 'draft',
        description: 'Increase transcript & recommendation completion',
      },
      {
        id: '3',
        name: 'Melt Prevention Assistant',
        status: 'paused',
        description: 'Reduce melt between admit and deposit',
        impact: '17% fewer no-shows (last run period)',
      },
    ];
  },

  async getAdmissionsOperatorRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'win-1',
        text: '38% fewer stalled applications',
        detail: 'Application Progress Assistant helped move 47 applicants forward this week.',
        assistantName: 'Application Progress Assistant',
      },
      {
        id: 'win-2',
        text: '23 missing transcripts identified',
        detail: 'Missing Documents Assistant flagged applicants needing follow-up.',
        assistantName: 'Missing Documents Assistant',
      },
    ];
  },

  async getAdmissionsOperatorRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'activity-1',
        timestamp: '10:42 AM',
        text: 'Application Progress Assistant flagged 8 new stalled applicants',
      },
      {
        id: 'activity-2',
        timestamp: '9:15 AM',
        text: 'Missing Documents Assistant identified 23 missing transcripts',
      },
      {
        id: 'activity-3',
        timestamp: '8:02 AM',
        text: 'Melt Prevention Assistant escalated 3 admits for advisor follow-up',
      },
      {
        id: 'activity-4',
        timestamp: 'Yesterday 4:21 PM',
        text: '17 stalled applicants moved forward after reminders',
      },
    ];
  },

  // Pipeline Team Command Center
  async getPipelineTeamTodaysFocus(ctx: DataContext): Promise<AdmissionsOperatorTodaysFocusData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    return {
      text: "Re-engage stalled opportunities, lock next steps for top prospects, and protect near-term closes.",
    };
  },

  async getPipelineTeamGamePlan(ctx: DataContext): Promise<AdmissionsOperatorGamePlanData | null> {
    await delay(150);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    // Simulate some tasks as completed for demo purposes
    const now = new Date();
    const recentlyCompleted = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    
    return {
      total: 4,
      completed: 1,
      todaysProgressSummary: {
        movedForwardCount: 9,
        narrative: "You've moved 9 opportunities forward today.",
      },
      coachMessage: "Your best leverage today is closing the loop. A clear next step for each top prospect keeps relationships warm and your forecast honest.",
      items: [
        {
          id: 're-engage-stalled',
          title: 'Reach out to 12 donors with overdue next steps',
          description: 'No activity in 21+ days across qualified prospects.',
          impactHint: 'Reduces forecast risk by restoring momentum.',
          status: 'completed',
          completedAt: recentlyCompleted.toISOString(),
          lastOutcomeSummary: '→ 4 opportunities re-engaged',
          goalImpacts: [
            { goalId: 'meaningful-touches', deltaLabel: 'Meaningful touches', deltaValue: 4 },
          ],
          ctas: [
            { label: 'Open', href: '/advancement/pipeline/agent-ops/queue?filter=stalled' },
            { label: 'Let AI suggest next step', href: '/advancement/pipeline/assistant' },
          ],
        },
        {
          id: 'prep-briefs',
          title: 'Prep briefs for 3 upcoming donor meetings',
          description: 'Meetings scheduled in the next 48 hours.',
          impactHint: 'Improves meeting quality and ask readiness.',
          status: 'open',
          goalImpacts: [
            { goalId: 'meetings-held', deltaLabel: 'Meetings held', deltaValue: 3 },
          ],
          ctas: [
            { label: 'Open', href: '/advancement/pipeline/agent-ops/queue?filter=meetings' },
            { label: 'Let AI suggest next step', href: '/advancement/pipeline/assistant' },
          ],
        },
        {
          id: 'advance-proposals',
          title: 'Advance 2 proposals stuck in review',
          description: 'Late-stage proposals with close dates inside 30 days.',
          impactHint: 'Protects near-term closes and forecast confidence.',
          status: 'open',
          goalImpacts: [
            { goalId: 'proposals-advanced', deltaLabel: 'Proposals advanced', deltaValue: 2 },
          ],
          ctas: [
            { label: 'Open', href: '/advancement/pipeline/agent-ops/queue?filter=proposals' },
            { label: 'Let AI suggest next step', href: '/advancement/pipeline/assistant' },
          ],
        },
        {
          id: 'stewardship-followups',
          title: 'Trigger stewardship follow-ups for 5 recent gifts',
          description: 'Gifts received, no thank-you sequence logged.',
          impactHint: 'Builds trust and increases repeat giving.',
          status: 'open',
          goalImpacts: [
            { goalId: 'stewardship-completed', deltaLabel: 'Stewardship completed', deltaValue: 5 },
          ],
          ctas: [
            { label: 'Open', href: '/advancement/pipeline/agent-ops/queue?filter=stewardship' },
            { label: 'Let AI suggest next step', href: '/advancement/pipeline/assistant' },
          ],
        },
      ],
    };
  },

  async getPipelineTeamMomentum(ctx: DataContext): Promise<AdmissionsOperatorMomentumData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    return {
      streakDays: 3,
      weeklyChallenge: {
        completed: 9,
        total: 25,
        label: 'opportunities moved forward',
      },
      score: 74,
      games: [
        {
          key: 'next-steps-scheduled',
          title: 'Next Steps Scheduled',
          subtitle: 'Keeping relationships moving forward',
          icon: 'calendar-check',
          todayCount: 3,
          weekCurrent: 13,
          weekTarget: 15,
          hint: 'Scheduling clear next steps prevents opportunities from stalling.',
          streakDays: 4,
          streakLabel: 'Keeping relationships moving forward',
          score: 78,
          scoreBasisLabel: 'Based on next steps scheduled today',
          weeklyChallenge: {
            completed: 13,
            total: 15,
            label: 'next steps scheduled',
          },
          status: 'on-track', // 13/15 = 86.7% >= 85%
        },
        {
          key: 'stewardship-on-time',
          title: 'Stewardship On-Time',
          subtitle: 'Building trust through timely follow-up',
          icon: 'heart',
          todayCount: 2,
          weekCurrent: 6,
          weekTarget: 10,
          hint: 'Thank-you notes within 48 hours increase repeat giving by 23%.',
          streakDays: 6,
          streakLabel: 'Keeping promises to donors',
          score: 72,
          scoreBasisLabel: 'Based on stewardship completed on time today',
          weeklyChallenge: {
            completed: 6,
            total: 10,
            label: 'on-time stewardship touches',
          },
          status: 'slightly-behind',
        },
        {
          key: 'opportunities-advanced',
          title: 'Opportunities Advanced',
          subtitle: 'Moving prospects through the pipeline',
          icon: 'arrow-trend-up',
          todayCount: 1,
          weekCurrent: 4,
          weekTarget: 8,
          hint: 'Each stage advancement brings you closer to closing.',
          streakDays: 2,
          streakLabel: 'Moving opportunities forward',
          score: 69,
          scoreBasisLabel: 'Based on opportunities advanced today',
          weeklyChallenge: {
            completed: 4,
            total: 8,
            label: 'opportunities advanced',
          },
          status: 'at-risk', // 4/8 = 50% < 60%
        },
        {
          key: 'strategic-meetings-completed',
          title: 'Strategic Meetings Completed',
          subtitle: 'Engaging with top prospects',
          icon: 'handshake',
          todayCount: 1,
          weekCurrent: 3,
          weekTarget: 5,
          hint: 'Face-to-face meetings have the highest conversion rate.',
          streakDays: 3,
          streakLabel: 'Engaging with top prospects',
          score: 74,
          scoreBasisLabel: 'Based on strategic meetings completed today',
          weeklyChallenge: {
            completed: 3,
            total: 5,
            label: 'strategic meetings completed',
          },
          status: 'slightly-behind', // 3/5 = 60% (at threshold)
        },
        {
          key: 'lybunt-recovery-touches',
          title: 'LYBUNT Recovery Touches',
          subtitle: 'Re-engaging lapsed donors',
          icon: 'rotate-left',
          todayCount: 2,
          weekCurrent: 5,
          weekTarget: 12,
          hint: 'Early re-engagement recovers 40% more donors than waiting.',
          streakDays: 5,
          streakLabel: 'Re-engaging lapsed donors',
          score: 71,
          scoreBasisLabel: 'Based on LYBUNT recovery touches today',
          weeklyChallenge: {
            completed: 5,
            total: 12,
            label: 'LYBUNT recovery touches',
          },
          status: 'at-risk',
        },
      ],
    };
  },

  async getPipelineTeamFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'stalled-opportunities',
        title: 'Stalled late-stage opportunities increased 12% this week',
        severity: 'high',
      },
      {
        id: 'missing-next-steps',
        title: '7 top prospects have no next step scheduled',
        severity: 'medium',
      },
      {
        id: 'stewardship-lag',
        title: 'Stewardship lag: 14 gifts missing thank-you within 48 hours',
        severity: 'medium',
      },
    ];
  },

  async getPipelineTeamGoalTracker(ctx: DataContext, timeframe: 'week' | 'month' | 'quarter' | 'fiscalYear' = 'month'): Promise<AdmissionsOperatorGoalTrackerData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    const goalsByTimeframe: Record<'week' | 'month' | 'quarter' | 'fiscalYear', AdmissionsOperatorGoalTrackerData> = {
      week: {
        title: 'Goal Tracker',
        timeframeLabel: 'This week',
        subtitle: 'Track your donor pipeline and recovery progress.',
        metrics: [
          {
            id: 'strategic-donor-meetings',
            label: 'Strategic Donor Meetings',
            current: 2,
            target: 4,
            unit: 'meetings',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'key-proposals-advanced',
            label: 'Key Proposals Advanced',
            current: 2,
            target: 3,
            unit: 'proposals',
            trend: 'up',
            status: 'on-track',
          },
          {
            id: 'lybunt-recovery',
            label: 'LYBUNT Recovery',
            current: 6,
            target: 10,
            unit: 'donors',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'stewardship-on-time',
            label: 'Stewardship On-Time',
            current: 8,
            target: 10,
            unit: 'gifts',
            trend: 'up',
            status: 'at-risk',
          },
        ],
      },
      month: {
        title: 'Goal Tracker',
        timeframeLabel: 'This month',
        subtitle: 'Track your donor pipeline and recovery progress.',
        metrics: [
          {
            id: 'strategic-donor-meetings',
            label: 'Strategic Donor Meetings',
            current: 6,
            target: 15,
            unit: 'meetings',
            trend: 'up',
            status: 'at-risk',
          },
          {
            id: 'key-proposals-advanced',
            label: 'Key Proposals Advanced',
            current: 18,
            target: 25,
            unit: 'proposals',
            trend: 'up',
            status: 'on-track',
          },
          {
            id: 'lybunt-recovery',
            label: 'LYBUNT Recovery',
            current: 89,
            target: 150,
            unit: 'donors',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'quarterly-giving-goal',
            label: 'Quarterly Giving Goal',
            current: 1.2,
            target: 2.0,
            unit: '$M',
            trend: 'up',
            status: 'on-track',
          },
        ],
      },
      quarter: {
        title: 'Goal Tracker',
        timeframeLabel: 'This quarter',
        subtitle: 'Track your donor pipeline and recovery progress.',
        metrics: [
          {
            id: 'quarterly-giving-goal',
            label: 'Quarterly Giving Goal',
            current: 1.2,
            target: 2.0,
            unit: '$M',
            trend: 'up',
            status: 'on-track',
          },
          {
            id: 'lybunt-recovery',
            label: 'LYBUNT Recovery',
            current: 89,
            target: 150,
            unit: 'donors',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'key-proposals-advanced',
            label: 'Key Proposals Advanced',
            current: 18,
            target: 25,
            unit: 'proposals',
            trend: 'up',
            status: 'on-track',
          },
          {
            id: 'strategic-donor-meetings',
            label: 'Strategic Donor Meetings',
            current: 6,
            target: 15,
            unit: 'meetings',
            trend: 'up',
            status: 'at-risk',
          },
        ],
      },
      fiscalYear: {
        title: 'Goal Tracker',
        timeframeLabel: 'This fiscal year',
        subtitle: 'Track your donor pipeline and recovery progress.',
        metrics: [
          {
            id: 'fiscal-year-giving-goal',
            label: 'Fiscal Year Giving Goal',
            current: 6.8,
            target: 12.0,
            unit: '$M',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'lybunt-recovery',
            label: 'LYBUNT Recovery',
            current: 240,
            target: 450,
            unit: 'donors',
            trend: 'up',
            status: 'slightly-behind',
          },
          {
            id: 'key-proposals-advanced',
            label: 'Key Proposals Advanced',
            current: 62,
            target: 90,
            unit: 'proposals',
            trend: 'up',
            status: 'on-track',
          },
          {
            id: 'strategic-donor-meetings',
            label: 'Strategic Donor Meetings',
            current: 28,
            target: 60,
            unit: 'meetings',
            trend: 'up',
            status: 'at-risk',
          },
        ],
      },
    };

    return goalsByTimeframe[timeframe];
  },

  async getPipelineTeamForecast(ctx: DataContext): Promise<PipelineTeamForecastData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    // Calculate 21 days from now for time context
    const now = new Date();
    const quarterEndDate = new Date(now);
    quarterEndDate.setDate(now.getDate() + 21);

    return {
      title: 'Your Forecast',
      subtitle: 'Projected gifts from your portfolio',
      committedAmount: 420000,
      mostLikelyAmount: 610000,
      atRiskAmount: 280000,
      currency: 'USD',
      confidence: 'medium',
      primaryRiskDriver: 'Most risk is coming from late-stage proposals missing a next step.',
      timeContextLabel: 'Quarter ends',
      timeContextDateISO: quarterEndDate.toISOString(),
    };
  },

  async getPipelineTeamAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'next-step-assistant',
        name: 'Next Step Assistant',
        status: 'active',
        description: 'Flags missing next steps and recommends actions.',
      },
      {
        id: 'meeting-brief-assistant',
        name: 'Meeting Brief Assistant',
        status: 'draft',
        description: 'Preps briefs and talking points for meetings.',
      },
      {
        id: 'stewardship-assistant',
        name: 'Stewardship Assistant',
        status: 'paused',
        description: 'Drafts thank-you notes and schedules follow-ups.',
      },
    ];
  },

  async getPipelineTeamRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'win-1',
        text: '38% fewer stalled opportunities',
        detail: 'Next Step Assistant surfaced dormant opportunities and suggested actions.',
        assistantName: 'Next Step Assistant',
      },
      {
        id: 'win-2',
        text: '3 proposals advanced to review',
        detail: 'Moves Management Assistant converted notes into structured updates.',
        assistantName: 'Moves Management Assistant',
      },
      {
        id: 'win-3',
        text: 'Stewardship completed for 9 donors',
        detail: 'Stewardship Assistant drafted thank-you notes and queued follow-ups.',
        assistantName: 'Stewardship Assistant',
      },
    ];
  },

  async getPipelineTeamRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return [];
    }

    return [
      {
        id: 'activity-1',
        timestamp: '10:42 AM',
        text: 'Next Step Assistant flagged 6 opportunities missing next steps',
      },
      {
        id: 'activity-2',
        timestamp: '9:15 AM',
        text: 'Meeting Brief Assistant prepared 2 donor briefs',
      },
      {
        id: 'activity-3',
        timestamp: '8:02 AM',
        text: 'Stewardship Assistant queued 5 thank-you drafts',
      },
      {
        id: 'activity-4',
        timestamp: 'Yesterday 4:21 PM',
        text: 'Moves Management Assistant updated 3 stages from your notes',
      },
    ];
  },

  async getPipelineTeamPortfolioHealth(ctx: DataContext): Promise<PipelineLeadershipPortfolioHealthData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || normalizedMode !== 'team') {
      return null;
    }

    return {
      title: 'Portfolio Health',
      subtitle: 'Quick signals to keep relationships moving',
      metrics: [
        {
          id: 'next-step-coverage',
          label: 'Next-step coverage',
          value: '78%',
          status: 'slightly-behind',
        },
        {
          id: 'late-stage-stalled',
          label: 'Late-stage stalled > 21d',
          value: '12',
          status: 'at-risk',
        },
        {
          id: 'no-touch-30d',
          label: 'No touch in 30d',
          value: '9',
          status: 'slightly-behind',
        },
        {
          id: 'stewardship-on-time',
          label: 'Stewardship on-time',
          value: '86%',
          status: 'on-track',
        },
      ],
    };
  },

  // Pipeline Leadership Command Center
  async getPipelineLeadershipPortfolioHealth(ctx: DataContext): Promise<PipelineLeadershipPortfolioHealthData | null> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      title: 'Portfolio Health',
      subtitle: 'Key performance indicators for your team',
      metrics: [
        {
          id: 'next-step-coverage',
          label: 'Next-step coverage',
          value: '78%',
          status: 'slightly-behind',
        },
        {
          id: 'late-stage-stalled',
          label: 'Late-stage stalled > 21d',
          value: '12',
          status: 'at-risk',
        },
        {
          id: 'stewardship-sla',
          label: 'Stewardship SLA on-time',
          value: '86%',
          status: 'on-track',
        },
        {
          id: 'lybunt-recovery-pace',
          label: 'LYBUNT recovery pace',
          value: '54%',
          status: 'slightly-behind',
        },
      ],
    };
  },

  async getPipelineLeadershipForecast(ctx: DataContext): Promise<PipelineLeadershipForecastData | null> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return null;
    }

    const quarterGoal = 2000000; // $2.0M
    const committedAmount = 720000; // $720K
    const mostLikelyAmount = 930000; // $930K
    const atRiskAmount = 610000; // $610K
    const forecastTotal = committedAmount + mostLikelyAmount; // $1.65M
    const gap = forecastTotal - quarterGoal; // -$350K

    // Calculate quarter end date (end of current quarter)
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    quarterEnd.setHours(23, 59, 59, 999);

    return {
      quarterGoal,
      forecastTotal,
      gap,
      confidence: 'medium',
      committedAmount,
      mostLikelyAmount,
      atRiskAmount,
      currency: 'USD',
      primaryRiskDriver: 'Most variance is concentrated in 6 late-stage proposals without next steps.',
      timeContextLabel: 'Quarter ends',
      timeContextDateISO: quarterEnd.toISOString(),
    };
  },

  async getPipelineLeadershipFlaggedRisks(ctx: DataContext): Promise<AdmissionsOperatorFlaggedRiskData[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'risk-1',
        title: '6 late-stage proposals without next steps',
        description: 'These proposals represent $610K in at-risk forecast. Without intervention, they may slip to next quarter.',
        severity: 'high',
      },
      {
        id: 'risk-2',
        title: 'Next-step coverage below target',
        description: 'Team-wide next-step coverage is 78%, below the 85% target. This increases forecast risk.',
        severity: 'medium',
      },
      {
        id: 'risk-3',
        title: 'LYBUNT recovery pace slowing',
        description: 'Recovery pace is 54%, down from 62% last quarter. This may impact annual goals.',
        severity: 'medium',
      },
    ];
  },

  async getPipelineLeadershipRecentWins(ctx: DataContext): Promise<AdmissionsOperatorRecentWinData[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'win-1',
        text: 'Team closed $180K in committed forecast this week',
        detail: '3 proposals moved to committed status',
        assistantName: 'Forecast Quality Agent',
      },
      {
        id: 'win-2',
        text: 'Next-step coverage improved 8% week-over-week',
        detail: 'From 70% to 78%',
        assistantName: 'Portfolio Coverage Agent',
      },
      {
        id: 'win-3',
        text: 'Cleared blockers on 2 high-value proposals',
        detail: '$150K total ask value',
        assistantName: 'Proposal Risk Agent',
      },
    ];
  },

  async getPipelineLeadershipAssistants(ctx: DataContext): Promise<AdmissionsOperatorAssistantData[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'portfolio-coverage-agent',
        name: 'Portfolio Coverage Agent',
        status: 'active',
        description: 'Monitors next-step coverage across the team and flags gaps.',
        impact: 'Improved coverage by 8% this week',
      },
      {
        id: 'forecast-quality-agent',
        name: 'Forecast Quality Agent',
        status: 'draft',
        description: 'Analyzes forecast variance and identifies risk drivers.',
        impact: 'Identified 6 proposals at risk',
      },
      {
        id: 'proposal-risk-agent',
        name: 'Proposal Risk Agent',
        status: 'paused',
        description: 'Surfaces stalled proposals and suggests interventions.',
        impact: 'Cleared blockers on 2 proposals',
      },
    ];
  },

  async getPipelineLeadershipRecentActivity(ctx: DataContext): Promise<AdmissionsOperatorRecentActivityData[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'activity-1',
        timestamp: '11:15 AM',
        text: 'Forecast Quality Agent identified 6 late-stage proposals at risk',
      },
      {
        id: 'activity-2',
        timestamp: '9:42 AM',
        text: 'Portfolio Coverage Agent flagged 12 opportunities missing next steps',
      },
      {
        id: 'activity-3',
        timestamp: '8:30 AM',
        text: 'Proposal Risk Agent surfaced 3 blocked proposals requiring intervention',
      },
      {
        id: 'activity-4',
        timestamp: 'Yesterday 5:00 PM',
        text: 'Team closed $180K in committed forecast',
      },
    ];
  },

  async getPipelineLeadershipTeamForecastSnapshot(ctx: DataContext): Promise<PipelineLeadershipTeamForecastSnapshotData | null> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return null;
    }

    // Calculate dates relative to now
    const now = new Date();
    const date10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const date7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const date15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const date18Days = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000);
    const date22Days = new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000);
    const date25Days = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);

    const rows = [
      {
        id: 'ava-martinez',
        name: 'Ava Martinez',
        status: 'at-risk' as const,
        committedAmount: 90000,
        mostLikelyAmount: 110000,
        atRiskAmount: 220000,
        primaryRiskDriver: 'Late-stage proposals missing next steps',
        nextCloseDateISO: date10Days.toISOString(),
      },
      {
        id: 'jordan-lee',
        name: 'Jordan Lee',
        status: 'slightly-behind' as const,
        committedAmount: 140000,
        mostLikelyAmount: 210000,
        atRiskAmount: 160000,
        primaryRiskDriver: 'Proposal approvals stalled',
        nextCloseDateISO: date18Days.toISOString(),
      },
      {
        id: 'sam-patel',
        name: 'Sam Patel',
        status: 'on-track' as const,
        committedAmount: 210000,
        mostLikelyAmount: 240000,
        atRiskAmount: 90000,
        primaryRiskDriver: 'Meeting pacing slightly behind',
        nextCloseDateISO: date25Days.toISOString(),
      },
      {
        id: 'morgan-chen',
        name: 'Morgan Chen',
        status: 'at-risk' as const,
        committedAmount: 60000,
        mostLikelyAmount: 95000,
        atRiskAmount: 180000,
        primaryRiskDriver: 'Portfolio coverage gaps in top prospects',
        nextCloseDateISO: date7Days.toISOString(),
      },
      {
        id: 'riley-johnson',
        name: 'Riley Johnson',
        status: 'on-track' as const,
        committedAmount: 175000,
        mostLikelyAmount: 195000,
        atRiskAmount: 80000,
        primaryRiskDriver: 'Stewardship SLA backlog emerging',
        nextCloseDateISO: date22Days.toISOString(),
      },
      {
        id: 'taylor-brooks',
        name: 'Taylor Brooks',
        status: 'slightly-behind' as const,
        committedAmount: 120000,
        mostLikelyAmount: 160000,
        atRiskAmount: 140000,
        primaryRiskDriver: 'LYBUNT recovery pacing behind',
        nextCloseDateISO: date15Days.toISOString(),
      },
    ];

    // Sort: at-risk first, then slightly-behind, then on-track
    // Within status, sort by largest at-risk amount, then by name
    const statusOrder: Record<'at-risk' | 'slightly-behind' | 'on-track', number> = {
      'at-risk': 0,
      'slightly-behind': 1,
      'on-track': 2,
    };

    const sortedRows = [...rows].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      // Within same status, sort by at-risk amount (descending), then by name
      const atRiskDiff = b.atRiskAmount - a.atRiskAmount;
      if (atRiskDiff !== 0) return atRiskDiff;
      return a.name.localeCompare(b.name);
    });

    return {
      title: 'Team Forecast Snapshot',
      subtitle: 'Where support is needed this quarter',
      timeframeLabel: 'This quarter',
      rows: sortedRows,
    };
  },

  // Pipeline Leadership Intelligence Methods
  async getPipelineLeadershipStatusSummary(ctx: DataContext): Promise<PipelineLeadershipStatusSummaryData | null> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      statusSummary: "Based on current portfolio coverage and late-stage progression, the team is forecasted to land ~$350K below quarter goal unless next-step gaps and proposal blockers are addressed. The primary controllable risk is missing next steps on 6 late-stage proposals and coverage below target for top prospects.",
    };
  },

  async getPipelineLeadershipKeyRisksAndOpportunities(ctx: DataContext): Promise<PipelineLeadershipKeyRiskOrOpportunity[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'risk-1',
        title: 'Late-stage proposals without next steps',
        description: '6 proposals over $50K have been in late-stage for more than 21 days without scheduled next steps, representing $610K in at-risk forecast.',
        severity: 'high',
        forecastImpactLabel: '-$610K at risk',
        type: 'risk',
      },
      {
        id: 'risk-2',
        title: 'Coverage below target in top prospects',
        description: 'Next-step coverage for top 50 prospects is 78%, below the 85% target. This increases forecast variance risk.',
        severity: 'medium',
        forecastImpactLabel: '-$180K forecast risk',
        type: 'risk',
      },
      {
        id: 'opportunity-1',
        title: 'Stewardship SLA improvements sustaining repeat giving',
        description: 'Stewardship on-time rate improved to 86% this week. Maintaining this pace could improve LYBUNT recovery by 8-12%.',
        severity: 'medium',
        forecastImpactLabel: '+$120K potential recovery',
        type: 'opportunity',
      },
    ];
  },

  async getPipelineLeadershipWhatChanged(ctx: DataContext): Promise<string[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      'Next-step coverage improved from 70% to 78% week-over-week',
      'At-risk amount increased by $90K due to 2 slipped close dates',
      'Committed increased by $180K from 3 proposals moving to committed status',
      'Stewardship on-time improved to 86% (up from 82%)',
      'LYBUNT recovery pace declined from 58% to 54%',
      'Late-stage stalled count increased from 8 to 12 opportunities',
    ];
  },

  async getPipelineLeadershipRecommendedInterventions(ctx: DataContext): Promise<PipelineLeadershipIntervention[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      {
        id: 'intervention-1',
        title: 'Review late-stage risks',
        rationale: 'Addressing 6 late-stage proposals without next steps could recover $350K in forecast variance.',
        estimatedImpact: 'Recover $350K',
        primaryOwner: 'Team Leads',
        ctas: [
          { label: 'Review late-stage risks', actionKey: 'review-late-stage' },
        ],
      },
      {
        id: 'intervention-2',
        title: 'Fix coverage gaps',
        rationale: 'Improving next-step coverage for top 50 prospects from 78% to 85% reduces forecast risk by 18%.',
        estimatedImpact: 'Reduce risk by $180K',
        primaryOwner: 'Portfolio Managers',
        ctas: [
          { label: 'Fix coverage gaps', actionKey: 'fix-coverage' },
        ],
      },
      {
        id: 'intervention-3',
        title: 'Clear proposal blockers',
        rationale: 'Removing blockers on 3 high-value proposals over $100K could add $300K to committed forecast.',
        estimatedImpact: 'Add $300K to committed',
        primaryOwner: 'Proposal Team',
        ctas: [
          { label: 'Clear proposal blockers', actionKey: 'clear-blockers' },
        ],
      },
      {
        id: 'intervention-4',
        title: 'Launch stewardship rescue',
        rationale: 'Accelerating stewardship touches for LYBUNT prospects could improve recovery pace by 8-12%.',
        estimatedImpact: 'Improve recovery by $120K',
        primaryOwner: 'Stewardship Team',
        ctas: [
          { label: 'Launch stewardship rescue', actionKey: 'stewardship-rescue' },
        ],
      },
    ];
  },

  async getPipelineLeadershipWhatToWatchNext(ctx: DataContext): Promise<string[]> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return [];
    }

    return [
      'Next-step creation rate for top prospects over next 48 hours',
      'Late-stage stage-aging trend after intervention',
      'Stewardship SLA backlog trend',
      'LYBUNT recovery touches pacing',
      'Proposal blocker resolution rate',
    ];
  },

  async getPipelineLeadershipInsightsAndTracking(ctx: DataContext): Promise<PipelineLeadershipInsightsData | null> {
    await delay(100);
    
    if (ctx.workspace !== 'advancement' || ctx.app !== 'advancement' || ctx.mode !== 'leadership') {
      return null;
    }

    return {
      outcomeCoverage: [
        {
          id: 'top-prospects-next-steps',
          label: 'Top prospects with next steps',
          value: '78%',
          subtext: 'Target: 85%',
        },
      ],
      flowHealth: [
        {
          id: 'avg-late-stage-age',
          label: 'Avg late-stage age',
          value: '19.4d',
          subtext: 'Target: 14d (+5.4d)',
        },
      ],
      interventionImpact: [
        {
          id: 'committed-moved',
          label: 'Moved to committed this week',
          value: '$180K',
          subtext: '3 proposals',
        },
        {
          id: 'at-risk-reduced',
          label: 'At-risk variance reduced',
          value: '-$90K',
          subtext: 'From intervention',
        },
      ],
    };
  },

  // Admissions Team Game Plan (for Queue integration)
  async getAdmissionsTeamGamePlan(ctx: DataContext): Promise<AdmissionsTeamGamePlanData | null> {
    await delay(100);
    
    // Normalize mode for backwards compatibility (accept 'operator' or 'team')
    const normalizedMode = ctx.mode === 'operator' || ctx.mode === 'team' ? 'team' : ctx.mode;
    if (ctx.workspace !== 'admissions' || (normalizedMode !== 'team' && ctx.mode !== 'leadership')) {
      return null;
    }

    // Get the game plan from the operator game plan and extract objectives
    const gamePlan = await this.getAdmissionsOperatorGamePlan(ctx);
    if (!gamePlan) {
      return null;
    }

    return {
      completedCount: gamePlan.completed,
      totalCount: gamePlan.total,
      objectives: gamePlan.items.map((item) => ({
        id: item.id,
        title: item.title,
        shortTitle: item.title,
        description: item.description,
        impactText: item.impactHint,
      })),
    };
  },

  async getAdmissionsQueueGamePlanCounts(ctx: DataContext): Promise<Record<string, number>> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return {};
    }

    // Get all queue items for the context
    const items = await this.listQueueItems(ctx);
    
    // Map items to objectives based on tags
    const objectiveIds = ['stalled-applicants', 'missing-documents', 'melt-risk'];
    const counts: Record<string, number> = {};
    
    for (const objectiveId of objectiveIds) {
      counts[objectiveId] = items.filter((item) => 
        itemMatchesObjective(item, objectiveId)
      ).length;
    }

    return counts;
  },

  async getAdmissionsQueueItemsByObjective(ctx: DataContext, objectiveId: string, limit?: number): Promise<QueueItem[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Get all queue items for the context
    const items = await this.listQueueItems(ctx);
    
    // Filter items that match the objective
    let matchingItems = items.filter((item) => itemMatchesObjective(item, objectiveId));
    
    // Apply limit if provided
    if (limit !== undefined && limit > 0) {
      matchingItems = matchingItems.slice(0, limit);
    }

    return matchingItems;
  },

  // Program Match
  async getProgramMatchDraftConfig(ctx: DataContext): Promise<ProgramMatchDraftConfig | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return { ...programMatchDraftConfig };
  },

  async updateProgramMatchDraftConfig(ctx: DataContext, input: { voiceToneProfileId?: string | null; outcomesEnabled?: boolean; gate?: Partial<ProgramMatchGateConfig> }): Promise<ProgramMatchDraftConfig | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    // Handle voiceToneProfileId update (including null)
    const updates: Partial<ProgramMatchDraftConfig> = {};
    if (input.voiceToneProfileId !== undefined) {
      updates.voiceToneProfileId = input.voiceToneProfileId;
    }
    if (input.outcomesEnabled !== undefined) {
      updates.outcomesEnabled = input.outcomesEnabled;
    }

    programMatchDraftConfig = {
      ...programMatchDraftConfig,
      ...updates,
      ...(input.gate && {
        gate: {
          ...programMatchDraftConfig.gate,
          ...input.gate,
          ...(input.gate.requiredFields && {
            requiredFields: {
              ...programMatchDraftConfig.gate.requiredFields,
              ...input.gate.requiredFields,
            },
          }),
          ...(input.gate.consent && {
            consent: {
              ...programMatchDraftConfig.gate.consent,
              ...input.gate.consent,
            },
          }),
          ...(input.gate.copy && {
            copy: {
              ...programMatchDraftConfig.gate.copy,
              ...input.gate.copy,
            },
          }),
        },
      }),
      updatedAt: new Date().toISOString(),
    };

    return { ...programMatchDraftConfig };
  },

  async listVoiceToneProfiles(ctx: DataContext): Promise<VoiceToneProfile[]> {
    await delay(100);
    
    try {
      const config = await loadCommunicationConfig();
      return (config.voiceProfiles || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        description: profile.description,
      }));
    } catch (error) {
      console.error('Failed to load voice tone profiles:', error);
      return [];
    }
  },

  async getProgramMatchChecklist(ctx: DataContext): Promise<ProgramMatchChecklistItem[]> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Compute checklist state from provider state
    const voiceToneComplete = programMatchDraftConfig.voiceToneProfileId != null;
    const gateComplete = programMatchDraftConfig.gate.enabled &&
      programMatchDraftConfig.gate.requiredFields.email === true &&
      programMatchDraftConfig.gate.copy.headline.trim().length > 0 &&
      programMatchDraftConfig.gate.copy.helperText.trim().length > 0;

    // Get libraries summary to check Traits/Skills completion
    // Use the same source of truth as the summary method
    const activeTraits = programMatchTraits.filter(t => t.isActive);
    const activeSkills = programMatchSkills.filter(s => s.isActive);
    const traitsCount = activeTraits.length;
    const skillsCount = activeSkills.length;
    
    // Thresholds: Traits >= 10, Skills >= 8
    const traitsComplete = traitsCount >= 10;
    const skillsComplete = skillsCount >= 8;

    // Sanity check: log counts in dev (lightweight)
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProgramMatch] Checklist computation:', {
        traitsCount,
        skillsCount,
        traitsComplete,
        skillsComplete,
        seededTraits: programMatchTraits.length,
        seededSkills: programMatchSkills.length,
      });
    }

    return [
      {
        id: 'checklist-1',
        label: 'Voice and Tone selected',
        state: voiceToneComplete ? 'complete' : 'not_started',
        sectionId: 'voice-tone',
      },
      {
        id: 'checklist-2',
        label: 'Lead capture gate configured',
        state: gateComplete ? 'complete' : 'not_started',
        sectionId: 'lead-capture',
      },
      {
        id: 'checklist-3',
        label: 'Traits library set up',
        state: traitsComplete ? 'complete' : 'not_started',
        sectionId: 'libraries',
      },
      {
        id: 'checklist-4',
        label: 'Skills library set up',
        state: skillsComplete ? 'complete' : 'not_started',
        sectionId: 'libraries',
      },
      {
        id: 'checklist-5',
        label: 'Programs added',
        state: 'not_started',
        sectionId: 'program-icp',
      },
      {
        id: 'checklist-6',
        label: 'ICP defined for active programs',
        state: 'not_started',
        sectionId: 'program-icp',
      },
      {
        id: 'checklist-7',
        label: 'Quiz created',
        state: 'not_started',
        sectionId: 'quiz',
      },
      {
        id: 'checklist-8',
        label: 'Preview reviewed',
        state: 'not_started',
        sectionId: 'preview-deploy',
      },
      {
        id: 'checklist-9',
        label: 'Published',
        state: 'not_started',
        sectionId: 'preview-deploy',
      },
      {
        id: 'checklist-10',
        label: 'Deployed and verified',
        state: 'not_started',
        sectionId: 'preview-deploy',
      },
    ];
  },

  async getProgramMatchHubSummary(ctx: DataContext): Promise<ProgramMatchHubSummary | null> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    // Only return data for admissions workspace
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    // Compute progress from checklist completion
    const checklist = await this.getProgramMatchChecklist(ctx);
    const completedCount = checklist.filter(item => item.state === 'complete').length;
    const progressPercent = Math.round((completedCount / 10) * 100);

    return {
      status: 'draft',
      lastUpdated: programMatchDraftConfig.updatedAt,
      progressPercent,
    };
  },

  async getProgramMatchLibrariesSummary(ctx: DataContext): Promise<ProgramMatchLibrariesSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const activeTraits = programMatchTraits.filter(t => t.isActive);
    const activeSkills = programMatchSkills.filter(s => s.isActive);

    return {
      traitsCount: activeTraits.length,
      skillsCount: activeSkills.length,
      outcomesEnabled: false,
    };
  },

  async getProgramMatchProgramsSummary(ctx: DataContext): Promise<ProgramMatchProgramsSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const activePrograms = programMatchPrograms.filter(p => p.status === 'active');
    const draftPrograms = programMatchPrograms.filter(p => p.status === 'draft');

    return {
      activeProgramsCount: activePrograms.length,
      draftProgramsCount: draftPrograms.length,
      programs: programMatchPrograms.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status === 'active' ? 'active' as const : 'draft' as const,
      })),
    };
  },

  async getProgramMatchCandidatesSummary(ctx: DataContext): Promise<ProgramMatchCandidatesSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'email', label: 'Email' },
        { id: 'matchedProgram', label: 'Matched Program' },
        { id: 'score', label: 'Match Score' },
        { id: 'completedAt', label: 'Completed At' },
      ],
      rows: [],
    };
  },

  async getProgramMatchAnalyticsSummary(ctx: DataContext): Promise<ProgramMatchAnalyticsSummary | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    return {
      tiles: [
        {
          id: 'total-completions',
          label: 'Total Completions',
          value: 0,
        },
        {
          id: 'unique-visitors',
          label: 'Unique Visitors',
          value: 0,
        },
        {
          id: 'completion-rate',
          label: 'Completion Rate',
          value: '0%',
        },
        {
          id: 'avg-match-score',
          label: 'Avg Match Score',
          value: '0.0',
        },
      ],
    };
  },

  // Program Match Traits
  async listProgramMatchTraits(ctx: DataContext): Promise<ProgramMatchTrait[]> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    return [...programMatchTraits];
  },

  async createProgramMatchTrait(ctx: DataContext, input: { name: string; category: string; description: string }): Promise<ProgramMatchTrait> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const trait: ProgramMatchTrait = {
      id: `trait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      category: input.category,
      description: input.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    programMatchTraits.push(trait);
    return { ...trait };
  },

  async updateProgramMatchTrait(ctx: DataContext, id: string, input: Partial<{ name: string; category: string; description: string; isActive: boolean }>): Promise<ProgramMatchTrait> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const index = programMatchTraits.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Trait with id ${id} not found`);
    }

    const updated: ProgramMatchTrait = {
      ...programMatchTraits[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    programMatchTraits[index] = updated;
    return { ...updated };
  },

  // Program Match Skills
  async listProgramMatchSkills(ctx: DataContext): Promise<ProgramMatchSkill[]> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    return [...programMatchSkills];
  },

  async createProgramMatchSkill(ctx: DataContext, input: { name: string; category: string; description: string }): Promise<ProgramMatchSkill> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const skill: ProgramMatchSkill = {
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      category: input.category,
      description: input.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    programMatchSkills.push(skill);
    return { ...skill };
  },

  async updateProgramMatchSkill(ctx: DataContext, id: string, input: Partial<{ name: string; category: string; description: string; isActive: boolean }>): Promise<ProgramMatchSkill> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const index = programMatchSkills.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Skill with id ${id} not found`);
    }

    const updated: ProgramMatchSkill = {
      ...programMatchSkills[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    programMatchSkills[index] = updated;
    return { ...updated };
  },

  // Program Match Programs
  async listProgramMatchPrograms(ctx: DataContext): Promise<ProgramMatchProgram[]> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    return [...programMatchPrograms];
  },

  async createProgramMatchProgram(ctx: DataContext, input: { name: string }): Promise<ProgramMatchProgram> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const program: ProgramMatchProgram = {
      id: `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      status: 'draft',
      updatedAt: now,
    };

    programMatchPrograms.push(program);
    return { ...program };
  },

  async updateProgramMatchProgram(ctx: DataContext, id: string, input: Partial<{ name: string; status: 'draft' | 'active' | 'inactive' }>): Promise<ProgramMatchProgram> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const index = programMatchPrograms.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Program with id ${id} not found`);
    }

    const updated: ProgramMatchProgram = {
      ...programMatchPrograms[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    programMatchPrograms[index] = updated;
    return { ...updated };
  },

  // Program Match ICP
  async getProgramMatchProgramICP(ctx: DataContext, programId: string): Promise<ProgramMatchProgramICP | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const existing = programMatchICPByProgramId.get(programId);
    if (existing) {
      return { ...existing };
    }

    // Initialize empty buckets if none exists
    const now = new Date().toISOString();
    const emptyICP: ProgramMatchProgramICP = {
      programId,
      buckets: {
        critical: { traitIds: [], skillIds: [] },
        veryImportant: { traitIds: [], skillIds: [] },
        important: { traitIds: [], skillIds: [] },
        niceToHave: { traitIds: [], skillIds: [] },
      },
      updatedAt: now,
    };

    programMatchICPByProgramId.set(programId, emptyICP);
    return { ...emptyICP };
  },

  async updateProgramMatchProgramICP(ctx: DataContext, programId: string, buckets: ProgramMatchICPBuckets): Promise<ProgramMatchProgramICP> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const updated: ProgramMatchProgramICP = {
      programId,
      buckets,
      updatedAt: new Date().toISOString(),
    };

    programMatchICPByProgramId.set(programId, updated);
    return { ...updated };
  },

  // Program Match Outcomes
  async listProgramMatchOutcomes(ctx: DataContext, input?: { type?: 'priority' | 'field' | 'role' }): Promise<ProgramMatchOutcome[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    let outcomes = [...programMatchOutcomes];

    if (input?.type) {
      outcomes = outcomes.filter((o: ProgramMatchOutcome) => o.type === input.type);
    }

    return outcomes;
  },

  async createProgramMatchOutcome(ctx: DataContext, input: { type: 'priority' | 'field' | 'role'; name: string; category?: string | null; description: string }): Promise<ProgramMatchOutcome> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const outcome: ProgramMatchOutcome = {
      id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: input.type,
      name: input.name,
      category: input.category || null,
      description: input.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    programMatchOutcomes.push(outcome);
    return { ...outcome };
  },

  async updateProgramMatchOutcome(ctx: DataContext, id: string, input: Partial<{ name: string; category: string | null; description: string; isActive: boolean }>): Promise<ProgramMatchOutcome> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const outcome = programMatchOutcomes.find((o: ProgramMatchOutcome) => o.id === id);
    if (!outcome) {
      throw new Error(`Outcome with id ${id} not found`);
    }

    Object.assign(outcome, input, { updatedAt: new Date().toISOString() });
    return { ...outcome };
  },

  async getProgramMatchProgramOutcomes(ctx: DataContext, programId: string): Promise<ProgramMatchProgramOutcomes | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const existing = programMatchProgramOutcomesById.get(programId);
    if (existing) {
      return { ...existing };
    }

    // Initialize empty if none exists
    const now = new Date().toISOString();
    const empty: ProgramMatchProgramOutcomes = {
      programId,
      priorities: { strong: [], moderate: [] },
      fields: { strong: [], moderate: [] },
      roles: { strong: [], moderate: [] },
      updatedAt: now,
    };

    programMatchProgramOutcomesById.set(programId, empty);
    return { ...empty };
  },

  async updateProgramMatchProgramOutcomes(ctx: DataContext, programId: string, payload: Omit<ProgramMatchProgramOutcomes, 'programId' | 'updatedAt'>): Promise<ProgramMatchProgramOutcomes> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const updated: ProgramMatchProgramOutcomes = {
      programId,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    programMatchProgramOutcomesById.set(programId, updated);
    return { ...updated };
  },

  // Program Match Quiz Library
  async listProgramMatchQuizzes(ctx: DataContext): Promise<ProgramMatchQuiz[]> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    return [...programMatchQuizzes];
  },

  async createProgramMatchQuiz(ctx: DataContext, input: { name: string }): Promise<ProgramMatchQuiz> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const quiz: ProgramMatchQuiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      lastPublishedAt: null,
      activePublishedVersionId: null,
    };

    programMatchQuizzes.push(quiz);

    // Create empty draft
    const draft: ProgramMatchQuizDraft = {
      id: `quiz_draft_${quiz.id}`,
      quizId: quiz.id,
      title: input.name,
      description: '',
      targetLength: 8,
      updatedAt: now,
      questions: [],
    };
    programMatchQuizDraftByQuizId.set(quiz.id, draft);

    return { ...quiz };
  },

  async updateProgramMatchQuiz(ctx: DataContext, input: { id: string; name?: string; status?: 'archived' }): Promise<ProgramMatchQuiz> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const quiz = programMatchQuizzes.find((q: ProgramMatchQuiz) => q.id === input.id);
    if (!quiz) {
      throw new Error(`Quiz with id ${input.id} not found`);
    }

    if (input.name !== undefined) {
      quiz.name = input.name;
    }
    if (input.status !== undefined) {
      quiz.status = input.status;
    }
    quiz.updatedAt = new Date().toISOString();

    return { ...quiz };
  },

  async getProgramMatchQuizDraftByQuizId(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizDraft | null> {
    seedProgramMatchIfNeeded();
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const draft = programMatchQuizDraftByQuizId.get(quizId);
    if (!draft) {
      // Initialize empty draft if none exists
      const now = new Date().toISOString();
      const emptyDraft: ProgramMatchQuizDraft = {
        id: `quiz_draft_${quizId}`,
        quizId,
        title: '',
        description: '',
        targetLength: 8,
        updatedAt: now,
        questions: [],
      };
      programMatchQuizDraftByQuizId.set(quizId, emptyDraft);
      return { ...emptyDraft };
    }

    return { ...draft };
  },

  async updateProgramMatchQuizDraftByQuizId(ctx: DataContext, quizId: string, input: Partial<Omit<ProgramMatchQuizDraft, 'id' | 'quizId' | 'updatedAt'>> & { questions?: ProgramMatchQuizQuestion[] }): Promise<ProgramMatchQuizDraft> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const draft = programMatchQuizDraftByQuizId.get(quizId);
    if (!draft) {
      throw new Error(`Quiz draft for quizId ${quizId} not found`);
    }

    Object.assign(draft, input, { updatedAt: new Date().toISOString() });
    return { ...draft };
  },

  async listProgramMatchQuizPublishedVersions(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizPublishedVersion[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    const versions = programMatchQuizPublishedByQuizId.get(quizId) || [];
    return [...versions].sort((a, b) => b.version - a.version);
  },

  async publishProgramMatchQuizDraft(ctx: DataContext, quizId: string): Promise<ProgramMatchQuizPublishedVersion> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const draft = programMatchQuizDraftByQuizId.get(quizId);
    if (!draft) {
      throw new Error(`Quiz draft for quizId ${quizId} not found`);
    }

    if (draft.questions.length < 8) {
      throw new Error('Quiz must have at least 8 questions before publishing');
    }

    const existingVersions = programMatchQuizPublishedByQuizId.get(quizId) || [];
    const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version)) + 1 : 1;

    const now = new Date().toISOString();
    const publishedVersion: ProgramMatchQuizPublishedVersion = {
      id: `quiz_version_${quizId}_v${nextVersion}`,
      quizId,
      version: nextVersion,
      publishedAt: now,
      publishedBy: null,
      title: draft.title,
      description: draft.description,
      targetLength: draft.targetLength,
      questions: draft.questions.map(q => ({ ...q })), // Deep copy
    };

    existingVersions.push(publishedVersion);
    programMatchQuizPublishedByQuizId.set(quizId, existingVersions);

    // Update quiz status
    const quiz = programMatchQuizzes.find((q: ProgramMatchQuiz) => q.id === quizId);
    if (quiz) {
      quiz.status = 'published';
      quiz.lastPublishedAt = now;
      quiz.activePublishedVersionId = publishedVersion.id;
      quiz.updatedAt = now;
    }

    return { ...publishedVersion };
  },

  async getProgramMatchQuizPublishedVersion(ctx: DataContext, id: string): Promise<ProgramMatchQuizPublishedVersion | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    for (const versions of programMatchQuizPublishedByQuizId.values()) {
      const version = versions.find((v: ProgramMatchQuizPublishedVersion) => v.id === id);
      if (version) {
        return { ...version };
      }
    }

    return null;
  },

  async generateProgramMatchQuizDraftWithAI(ctx: DataContext, req: ProgramMatchQuizAIDraftRequest & { quizId: string }): Promise<ProgramMatchQuizDraft> {
    await delay(300);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Get current draft
    const currentDraft = await this.getProgramMatchQuizDraftByQuizId(ctx, req.quizId);
    
    // Generate deterministic sample quiz (in real implementation, this would call OpenAI)
    const sampleQuestions: ProgramMatchQuizQuestion[] = [
      {
        id: `ai_q1_${Date.now()}`,
        type: 'single_select',
        section: 'fit',
        prompt: 'What matters most to you in a graduate program?',
        helperText: null,
        isOptional: false,
        options: [
          { id: `ai_q1o1_${Date.now()}`, label: 'Career advancement', traitIds: ['trait_advancement'], skillIds: [] },
          { id: `ai_q1o2_${Date.now()}`, label: 'Personal growth', traitIds: ['trait_growth_mindset'], skillIds: [] },
          { id: `ai_q1o3_${Date.now()}`, label: 'Making an impact', traitIds: ['trait_impact'], skillIds: [] },
          { id: `ai_q1o4_${Date.now()}`, label: 'Building expertise', traitIds: ['trait_curiosity'], skillIds: [] },
        ],
      },
      // Add more sample questions to reach targetLength
      ...Array.from({ length: Math.min(req.targetLength - 1, 7) }, (_, i) => ({
        id: `ai_q${i + 2}_${Date.now()}`,
        type: 'single_select' as const,
        section: (i % 2 === 0 ? 'fit' : 'readiness') as 'fit' | 'readiness',
        prompt: `Sample question ${i + 2}`,
        helperText: null,
        isOptional: i >= 6,
        options: [
          { id: `ai_q${i + 2}o1_${Date.now()}`, label: 'Option A', traitIds: [], skillIds: [] },
          { id: `ai_q${i + 2}o2_${Date.now()}`, label: 'Option B', traitIds: [], skillIds: [] },
          { id: `ai_q${i + 2}o3_${Date.now()}`, label: 'Option C', traitIds: [], skillIds: [] },
        ],
      })),
    ];

    const updatedDraft: ProgramMatchQuizDraft = {
      ...currentDraft!,
      title: currentDraft?.title || 'AI-Generated Quiz',
      description: currentDraft?.description || 'A quiz generated with AI assistance',
      targetLength: req.targetLength,
      questions: sampleQuestions,
      updatedAt: new Date().toISOString(),
    };

    programMatchQuizDraftByQuizId.set(req.quizId, updatedDraft);
    return { ...updatedDraft };
  },

  // Program Match Publish & Versioning
  async listProgramMatchPublishedSnapshots(ctx: DataContext): Promise<ProgramMatchPublishSnapshot[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Return empty for now - snapshots would be stored in a separate array
    return [];
  },

  async publishProgramMatchDraft(ctx: DataContext): Promise<ProgramMatchPublishSnapshot> {
    await delay(200);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Validate prerequisites
    const activeTraits = programMatchTraits.filter(t => t.isActive);
    const activeSkills = programMatchSkills.filter(s => s.isActive);
    const activePrograms = programMatchPrograms.filter(p => p.status === 'active');

    if (!programMatchDraftConfig.voiceToneProfileId) {
      throw new Error('Voice and Tone profile must be selected');
    }
    if (activeTraits.length < 15) {
      throw new Error('At least 15 active traits required');
    }
    if (activeSkills.length < 10) {
      throw new Error('At least 10 active skills required');
    }
    if (activePrograms.length < 3) {
      throw new Error('At least 3 active programs required');
    }

    // Create snapshot (without quiz - quizzes are separate now)
    const now = new Date().toISOString();
    const snapshot: ProgramMatchPublishSnapshot = {
      id: `snapshot_${Date.now()}`,
      version: 1,
      status: 'published',
      publishedAt: now,
      publishedBy: null,
      draftConfig: { ...programMatchDraftConfig },
      traits: [...activeTraits],
      skills: [...activeSkills],
      outcomes: programMatchOutcomes.filter(o => o.isActive),
      programs: [...programMatchPrograms],
      programICPs: Array.from(programMatchICPByProgramId.values()),
      programOutcomes: Array.from(programMatchProgramOutcomesById.values()),
    };

    // Store snapshot (in a real implementation, this would be persisted)
    return { ...snapshot };
  },

  async getProgramMatchPublishedSnapshot(ctx: DataContext, id: string): Promise<ProgramMatchPublishSnapshot | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    // Return null for now - would look up from storage
    return null;
  },

  // Program Match Preview Links
  async createProgramMatchPreviewLink(ctx: DataContext, input: { mode: 'draft' | 'published'; targetId: string; expiresInDays: number }): Promise<ProgramMatchPreviewLink> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + input.expiresInDays * 24 * 60 * 60 * 1000);

    const link: ProgramMatchPreviewLink = {
      id: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mode: input.mode,
      targetId: input.targetId,
      urlPath: `/admissions/program-match/preview/`,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      createdAt: now.toISOString(),
    };

    return { ...link };
  },

  async revokeProgramMatchPreviewLink(ctx: DataContext, id: string): Promise<void> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // In real implementation, would mark link as inactive
  },

  async listProgramMatchPreviewLinks(ctx: DataContext, input?: { mode?: 'draft' | 'published' }): Promise<ProgramMatchPreviewLink[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Return empty for now
    return [];
  },

  // Program Match Deploy
  async getProgramMatchDeployConfig(ctx: DataContext, publishedSnapshotId: string, embedType: 'js' | 'iframe', quizVersionId: string): Promise<ProgramMatchDeployConfig> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Generate snippet with quizVersionId
    let snippet = '';
    if (embedType === 'js') {
      snippet = `<div id="program-match-widget-${publishedSnapshotId}"></div>
<script>
  (function() {
    const container = document.getElementById('program-match-widget-${publishedSnapshotId}');
    if (!container) return;
    const iframe = document.createElement('iframe');
    iframe.src = window.location.origin + '/widgets/program-match/${publishedSnapshotId}?quizVersionId=${quizVersionId}';
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    container.appendChild(iframe);
  })();
</script>`;
    } else {
      snippet = `<iframe src="/widgets/program-match/${publishedSnapshotId}?quizVersionId=${quizVersionId}" width="100%" height="600" frameborder="0" style="border: none;"></iframe>`;
    }

    return {
      id: `deploy_${Date.now()}`,
      publishedSnapshotId,
      quizVersionId,
      embedType,
      snippet,
      verifiedAt: null,
    };
  },

  async markProgramMatchDeployVerified(ctx: DataContext, publishedSnapshotId: string): Promise<ProgramMatchDeployConfig> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Return a config with verifiedAt set
    return {
      id: `deploy_${publishedSnapshotId}`,
      publishedSnapshotId,
      quizVersionId: '', // Would be set from stored config
      embedType: 'js',
      snippet: '',
      verifiedAt: new Date().toISOString(),
    };
  },

  // Program Match Templates
  async listProgramMatchTemplates(ctx: DataContext): Promise<ProgramMatchTemplateSummary[]> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return [];
    }

    // Return template summaries (for now, just one template)
    return [
      {
        id: 'template_graduate_starter',
        name: 'Graduate Starter Pack',
        description: 'A comprehensive starter pack for graduate programs with essential traits, skills, and sample programs.',
        tags: ['graduate', 'general', 'starter'],
        audience: 'graduate',
        includes: {
          traits: 20,
          skills: 10,
          outcomes: 12,
          programs: 3,
          icps: 3,
          quiz: true,
        },
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async getProgramMatchTemplatePackage(ctx: DataContext, id: string): Promise<ProgramMatchTemplatePackage | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    // For MVP, return a single template package inline
    // In production, this would load from a template catalog
    if (id === 'template_graduate_starter') {
      return {
        id: 'template_graduate_starter',
        name: 'Graduate Starter Pack',
        version: '1.0.0',
        traits: [
          { name: 'Analytical Thinking', category: 'Cognitive', description: 'Ability to break down complex problems and analyze data' },
          { name: 'Research Orientation', category: 'Academic', description: 'Interest in conducting original research' },
          { name: 'Time Management', category: 'Professional', description: 'Ability to prioritize and manage multiple deadlines' },
          { name: 'Written Communication', category: 'Communication', description: 'Strong writing skills for academic and professional contexts' },
          { name: 'Critical Analysis', category: 'Cognitive', description: 'Ability to evaluate arguments and evidence critically' },
          { name: 'Independent Learning', category: 'Academic', description: 'Self-directed learning and study habits' },
          { name: 'Collaboration', category: 'Interpersonal', description: 'Works effectively in team settings' },
          { name: 'Adaptability', category: 'Professional', description: 'Flexible and responsive to changing circumstances' },
          { name: 'Intellectual Curiosity', category: 'Academic', description: 'Genuine interest in learning and exploring new ideas' },
          { name: 'Problem Solving', category: 'Cognitive', description: 'Systematic approach to identifying and solving problems' },
          { name: 'Presentation Skills', category: 'Communication', description: 'Clear and effective verbal communication' },
          { name: 'Ethical Reasoning', category: 'Values', description: 'Strong ethical framework and moral reasoning' },
          { name: 'Cultural Awareness', category: 'Interpersonal', description: 'Understanding and appreciation of diverse perspectives' },
          { name: 'Leadership Potential', category: 'Professional', description: 'Demonstrates initiative and ability to lead' },
          { name: 'Resilience', category: 'Personal', description: 'Ability to bounce back from setbacks' },
          { name: 'Goal Orientation', category: 'Professional', description: 'Clear sense of direction and purpose' },
          { name: 'Quantitative Skills', category: 'Academic', description: 'Comfort with numbers and statistical analysis' },
          { name: 'Qualitative Analysis', category: 'Academic', description: 'Ability to interpret non-numeric data and themes' },
          { name: 'Professional Network', category: 'Professional', description: 'Established connections in relevant field' },
          { name: 'Work Experience', category: 'Professional', description: 'Relevant professional experience' },
        ],
        skills: [
          { name: 'Data Analysis', category: 'Technical', description: 'Proficiency with data analysis tools and methods' },
          { name: 'Research Methods', category: 'Academic', description: 'Familiarity with research design and methodology' },
          { name: 'Statistical Software', category: 'Technical', description: 'Experience with SPSS, R, or similar tools' },
          { name: 'Literature Review', category: 'Academic', description: 'Ability to synthesize existing research' },
          { name: 'Grant Writing', category: 'Professional', description: 'Experience writing funding proposals' },
          { name: 'Project Management', category: 'Professional', description: 'Ability to plan and execute complex projects' },
          { name: 'Public Speaking', category: 'Communication', description: 'Comfort presenting to groups' },
          { name: 'Academic Writing', category: 'Academic', description: 'Experience with scholarly writing conventions' },
          { name: 'Qualitative Coding', category: 'Technical', description: 'Experience coding qualitative data' },
          { name: 'Survey Design', category: 'Research', description: 'Ability to design effective surveys' },
        ],
        outcomes: [
          { type: 'priority', name: 'Career Advancement', category: 'Career', description: 'Seeking to advance in current career path' },
          { type: 'priority', name: 'Career Change', category: 'Career', description: 'Transitioning to a new field or industry' },
          { type: 'priority', name: 'Research Career', category: 'Career', description: 'Pursuing a career in research or academia' },
          { type: 'priority', name: 'Leadership Role', category: 'Career', description: 'Aspiring to leadership positions' },
          { type: 'field', name: 'Business & Management', category: 'Field', description: 'Interest in business and management fields' },
          { type: 'field', name: 'Education', category: 'Field', description: 'Focus on education and teaching' },
          { type: 'field', name: 'Healthcare', category: 'Field', description: 'Interest in healthcare professions' },
          { type: 'field', name: 'Technology', category: 'Field', description: 'Focus on technology and innovation' },
          { type: 'field', name: 'Social Sciences', category: 'Field', description: 'Interest in social science research' },
          { type: 'role', name: 'Researcher', category: 'Role', description: 'Research-focused career path' },
          { type: 'role', name: 'Practitioner', category: 'Role', description: 'Applied, practice-oriented career' },
          { type: 'role', name: 'Educator', category: 'Role', description: 'Teaching and education career' },
        ],
        programs: [
          {
            name: 'Master of Arts in Research',
            status: 'active',
            icp: {
              traits: {
                critical: ['Analytical Thinking', 'Research Orientation', 'Intellectual Curiosity'],
                veryImportant: ['Written Communication', 'Independent Learning', 'Critical Analysis'],
                important: ['Time Management', 'Problem Solving', 'Presentation Skills'],
                niceToHave: ['Collaboration', 'Cultural Awareness'],
              },
              skills: {
                critical: ['Research Methods', 'Literature Review'],
                veryImportant: ['Academic Writing', 'Data Analysis'],
                important: ['Statistical Software', 'Qualitative Coding'],
                niceToHave: ['Grant Writing', 'Survey Design'],
              },
            },
            outcomes: {
              priorities: { strong: ['Research Career'], moderate: ['Career Advancement'] },
              fields: { strong: ['Social Sciences'], moderate: ['Education'] },
              roles: { strong: ['Researcher'], moderate: ['Educator'] },
            },
          },
          {
            name: 'Master of Professional Studies',
            status: 'active',
            icp: {
              traits: {
                critical: ['Goal Orientation', 'Work Experience', 'Professional Network'],
                veryImportant: ['Time Management', 'Adaptability', 'Leadership Potential'],
                important: ['Collaboration', 'Written Communication', 'Problem Solving'],
                niceToHave: ['Cultural Awareness', 'Resilience'],
              },
              skills: {
                critical: ['Project Management'],
                veryImportant: ['Public Speaking', 'Academic Writing'],
                important: ['Data Analysis', 'Research Methods'],
                niceToHave: ['Grant Writing'],
              },
            },
            outcomes: {
              priorities: { strong: ['Career Advancement'], moderate: ['Career Change'] },
              fields: { strong: ['Business & Management'], moderate: ['Technology'] },
              roles: { strong: ['Practitioner'], moderate: ['Leadership Role'] },
            },
          },
          {
            name: 'Master of Applied Studies',
            status: 'draft',
            icp: {
              traits: {
                critical: ['Problem Solving', 'Adaptability'],
                veryImportant: ['Collaboration', 'Time Management'],
                important: ['Written Communication', 'Presentation Skills'],
                niceToHave: ['Cultural Awareness'],
              },
              skills: {
                critical: ['Project Management'],
                veryImportant: ['Public Speaking'],
                important: ['Data Analysis'],
                niceToHave: ['Grant Writing'],
              },
            },
          },
        ],
        quizDraft: {
          title: 'Graduate Program Match',
          description: 'Find the graduate program that aligns with your goals and interests',
          targetLength: 8,
          questions: [
            {
              section: 'fit',
              type: 'single_select',
              prompt: 'What is your primary motivation for pursuing graduate studies?',
              helperText: 'Select the option that best describes your main goal',
              isOptional: false,
              options: [
                { label: 'Advance in my current career', traits: ['Goal Orientation', 'Work Experience'] },
                { label: 'Change careers to a new field', traits: ['Adaptability'], outcomes: ['Career Change'] },
                { label: 'Pursue research and academic work', traits: ['Research Orientation', 'Intellectual Curiosity'], outcomes: ['Research Career'] },
                { label: 'Develop new skills and knowledge', traits: ['Independent Learning', 'Intellectual Curiosity'] },
              ],
            },
            {
              section: 'readiness',
              type: 'single_select',
              prompt: 'How would you describe your research experience?',
              isOptional: false,
              options: [
                { label: 'Extensive research background', traits: ['Research Orientation'], skills: ['Research Methods', 'Literature Review'] },
                { label: 'Some research experience', traits: ['Analytical Thinking'], skills: ['Data Analysis'] },
                { label: 'Limited research experience', traits: ['Intellectual Curiosity'] },
                { label: 'No research experience', traits: ['Independent Learning'] },
              ],
            },
            {
              section: 'readiness',
              type: 'multi_select',
              prompt: 'Which skills do you already have?',
              helperText: 'Select all that apply',
              isOptional: false,
              options: [
                { label: 'Data analysis', skills: ['Data Analysis', 'Statistical Software'] },
                { label: 'Research methods', skills: ['Research Methods', 'Qualitative Coding'] },
                { label: 'Academic writing', skills: ['Academic Writing', 'Literature Review'] },
                { label: 'Project management', skills: ['Project Management'] },
              ],
            },
            {
              section: 'fit',
              type: 'single_select',
              prompt: 'What is your preferred learning style?',
              isOptional: false,
              options: [
                { label: 'Independent, self-directed learning', traits: ['Independent Learning', 'Time Management'] },
                { label: 'Collaborative group work', traits: ['Collaboration'] },
                { label: 'Structured, guided instruction', traits: ['Adaptability'] },
                { label: 'Mix of independent and collaborative', traits: ['Collaboration', 'Independent Learning'] },
              ],
            },
            {
              section: 'readiness',
              type: 'single_select',
              prompt: 'How do you handle multiple deadlines?',
              isOptional: false,
              options: [
                { label: 'I excel at prioritizing and managing time', traits: ['Time Management', 'Goal Orientation'] },
                { label: 'I manage well with some planning', traits: ['Time Management'] },
                { label: 'I sometimes struggle but get it done', traits: ['Resilience'] },
                { label: 'I need support with time management', traits: ['Adaptability'] },
              ],
            },
            {
              section: 'fit',
              type: 'single_select',
              prompt: 'What type of career are you targeting?',
              isOptional: false,
              options: [
                { label: 'Research or academic career', outcomes: ['Research Career', 'Researcher'] },
                { label: 'Applied practice in my field', outcomes: ['Practitioner', 'Career Advancement'] },
                { label: 'Leadership or management role', outcomes: ['Leadership Role'], traits: ['Leadership Potential'] },
                { label: 'Teaching or education', outcomes: ['Educator', 'Education'] },
              ],
            },
            {
              section: 'readiness',
              type: 'multi_select',
              prompt: 'Which areas would you like to strengthen?',
              helperText: 'Select all that apply',
              isOptional: false,
              options: [
                { label: 'Research skills', traits: ['Research Orientation'], skills: ['Research Methods'] },
                { label: 'Writing skills', traits: ['Written Communication'], skills: ['Academic Writing'] },
                { label: 'Analytical skills', traits: ['Analytical Thinking'], skills: ['Data Analysis'] },
                { label: 'Presentation skills', traits: ['Presentation Skills'], skills: ['Public Speaking'] },
              ],
            },
            {
              section: 'fit',
              type: 'single_select',
              prompt: 'How important is collaboration in your ideal program?',
              isOptional: false,
              options: [
                { label: 'Very important - I thrive in team settings', traits: ['Collaboration'] },
                { label: 'Somewhat important', traits: ['Collaboration', 'Independent Learning'] },
                { label: 'Not very important - I prefer independent work', traits: ['Independent Learning'] },
                { label: 'Neutral', traits: ['Adaptability'] },
              ],
            },
          ],
        },
      };
    }

    return null;
  },

  async planApplyProgramMatchTemplate(ctx: DataContext, input: { templateId: string }): Promise<ProgramMatchTemplateApplyPlan> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const template = await this.getProgramMatchTemplatePackage(ctx, input.templateId);
    if (!template) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    // Helper to normalize names
    const normalizeName = (name: string): string => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    // Get current state
    const currentTraits = await this.listProgramMatchTraits(ctx);
    const currentSkills = await this.listProgramMatchSkills(ctx);
    const currentOutcomes = await this.listProgramMatchOutcomes(ctx);
    const currentPrograms = await this.listProgramMatchPrograms(ctx);
    const draftConfig = await this.getProgramMatchDraftConfig(ctx);

    // Normalize current names for matching
    const currentTraitNames = new Set(currentTraits.map(t => normalizeName(t.name)));
    const currentSkillNames = new Set(currentSkills.map(s => normalizeName(s.name)));
    const currentOutcomeNames = new Set(currentOutcomes.map(o => normalizeName(o.name)));
    const currentProgramNames = new Set(currentPrograms.map(p => normalizeName(p.name)));

    // Count will create vs will skip
    const willCreate = {
      traits: template.traits.filter(t => !currentTraitNames.has(normalizeName(t.name))).length,
      skills: template.skills.filter(s => !currentSkillNames.has(normalizeName(s.name))).length,
      outcomes: template.outcomes ? template.outcomes.filter(o => !currentOutcomeNames.has(normalizeName(o.name))).length : 0,
      programs: template.programs.filter(p => !currentProgramNames.has(normalizeName(p.name))).length,
    };

    const willSkip = {
      traits: template.traits.filter(t => currentTraitNames.has(normalizeName(t.name))).length,
      skills: template.skills.filter(s => currentSkillNames.has(normalizeName(s.name))).length,
      outcomes: template.outcomes ? template.outcomes.filter(o => currentOutcomeNames.has(normalizeName(o.name))).length : 0,
      programs: template.programs.filter(p => currentProgramNames.has(normalizeName(p.name))).length,
    };

    const warnings: string[] = [];

    // Check outcomes feature
    if (template.outcomes && template.outcomes.length > 0 && draftConfig && !draftConfig.outcomesEnabled) {
      warnings.push('Template includes outcomes, but outcomes feature is disabled. Outcomes will be skipped.');
    }

    // Check quiz (templates can include quiz, but we'll apply to first available quiz)
    if (template.quizDraft) {
      const quizzes = await this.listProgramMatchQuizzes(ctx);
      const firstQuiz = quizzes.find(q => q.status === 'draft');
      if (firstQuiz) {
        const quizDraft = await this.getProgramMatchQuizDraftByQuizId(ctx, firstQuiz.id);
        if (quizDraft && quizDraft.questions.length > 0) {
          warnings.push('A quiz already exists. Template quiz will be skipped.');
        }
      }
    }

    return {
      templateId: input.templateId,
      willCreate,
      willSkip,
      warnings,
    };
  },

  async applyProgramMatchTemplate(ctx: DataContext, input: { templateId: string }): Promise<ProgramMatchTemplateApplyResult> {
    await delay(200);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const template = await this.getProgramMatchTemplatePackage(ctx, input.templateId);
    if (!template) {
      throw new Error(`Template with id ${input.templateId} not found`);
    }

    // Helper to normalize names
    const normalizeName = (name: string): string => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    // Get current state
    const currentTraits = await this.listProgramMatchTraits(ctx);
    const currentSkills = await this.listProgramMatchSkills(ctx);
    const currentOutcomes = await this.listProgramMatchOutcomes(ctx);
    const currentPrograms = await this.listProgramMatchPrograms(ctx);
    const draftConfig = await this.getProgramMatchDraftConfig(ctx);

    // Normalize current names for matching
    const currentTraitNames = new Set(currentTraits.map(t => normalizeName(t.name)));
    const currentSkillNames = new Set(currentSkills.map(s => normalizeName(s.name)));
    const currentOutcomeNames = new Set(currentOutcomes.map(o => normalizeName(o.name)));
    const currentProgramNames = new Set(currentPrograms.map(p => normalizeName(p.name)));

    // Create traits
    let traitsCreated = 0;
    const traitNameToId = new Map<string, string>();
    for (const trait of currentTraits) {
      traitNameToId.set(normalizeName(trait.name), trait.id);
    }
    for (const templateTrait of template.traits) {
      const normalized = normalizeName(templateTrait.name);
      if (!currentTraitNames.has(normalized)) {
        const created = await this.createProgramMatchTrait(ctx, {
          name: templateTrait.name,
          category: templateTrait.category,
          description: templateTrait.description,
        });
        traitNameToId.set(normalized, created.id);
        traitsCreated++;
      } else {
        const existing = currentTraits.find(t => normalizeName(t.name) === normalized);
        if (existing) {
          traitNameToId.set(normalized, existing.id);
        }
      }
    }

    // Create skills
    let skillsCreated = 0;
    const skillNameToId = new Map<string, string>();
    for (const skill of currentSkills) {
      skillNameToId.set(normalizeName(skill.name), skill.id);
    }
    for (const templateSkill of template.skills) {
      const normalized = normalizeName(templateSkill.name);
      if (!currentSkillNames.has(normalized)) {
        const created = await this.createProgramMatchSkill(ctx, {
          name: templateSkill.name,
          category: templateSkill.category,
          description: templateSkill.description,
        });
        skillNameToId.set(normalized, created.id);
        skillsCreated++;
      } else {
        const existing = currentSkills.find(s => normalizeName(s.name) === normalized);
        if (existing) {
          skillNameToId.set(normalized, existing.id);
        }
      }
    }

    // Create outcomes (if enabled)
    let outcomesCreated = 0;
    const outcomeNameToId = new Map<string, string>();
    for (const outcome of currentOutcomes) {
      outcomeNameToId.set(normalizeName(outcome.name), outcome.id);
    }
    if (template.outcomes && draftConfig?.outcomesEnabled) {
      for (const templateOutcome of template.outcomes) {
        const normalized = normalizeName(templateOutcome.name);
        if (!currentOutcomeNames.has(normalized)) {
          const created = await this.createProgramMatchOutcome(ctx, {
            type: templateOutcome.type,
            name: templateOutcome.name,
            category: templateOutcome.category || null,
            description: templateOutcome.description,
          });
          outcomeNameToId.set(normalized, created.id);
          outcomesCreated++;
        } else {
          const existing = currentOutcomes.find(o => normalizeName(o.name) === normalized);
          if (existing) {
            outcomeNameToId.set(normalized, existing.id);
          }
        }
      }
    }

    // Create programs and merge ICPs
    let programsCreated = 0;
    const programNameToId = new Map<string, string>();
    for (const program of currentPrograms) {
      programNameToId.set(normalizeName(program.name), program.id);
    }
    for (const templateProgram of template.programs) {
      const normalized = normalizeName(templateProgram.name);
      let programId: string;
      
      if (!currentProgramNames.has(normalized)) {
        const created = await this.createProgramMatchProgram(ctx, {
          name: templateProgram.name,
        });
        if (templateProgram.status === 'active') {
          await this.updateProgramMatchProgram(ctx, created.id, { status: 'active' });
        }
        programId = created.id;
        programNameToId.set(normalized, programId);
        programsCreated++;
      } else {
        const existing = currentPrograms.find(p => normalizeName(p.name) === normalized);
        programId = existing!.id;
      }

      // Get current ICP
      const currentICP = await this.getProgramMatchProgramICP(ctx, programId);
      if (!currentICP) {
        throw new Error(`Failed to get ICP for program ${programId}`);
      }
      
      // Merge template ICP traits
      const mergedTraits = {
        critical: [...(currentICP.buckets.critical.traitIds || []), ...templateProgram.icp.traits.critical.map(name => traitNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        veryImportant: [...(currentICP.buckets.veryImportant.traitIds || []), ...templateProgram.icp.traits.veryImportant.map(name => traitNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        important: [...(currentICP.buckets.important.traitIds || []), ...templateProgram.icp.traits.important.map(name => traitNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        niceToHave: [...(currentICP.buckets.niceToHave.traitIds || []), ...templateProgram.icp.traits.niceToHave.map(name => traitNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
      };

      // Merge template ICP skills
      const mergedSkills = {
        critical: [...(currentICP.buckets.critical.skillIds || []), ...templateProgram.icp.skills.critical.map(name => skillNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        veryImportant: [...(currentICP.buckets.veryImportant.skillIds || []), ...templateProgram.icp.skills.veryImportant.map(name => skillNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        important: [...(currentICP.buckets.important.skillIds || []), ...templateProgram.icp.skills.important.map(name => skillNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
        niceToHave: [...(currentICP.buckets.niceToHave.skillIds || []), ...templateProgram.icp.skills.niceToHave.map(name => skillNameToId.get(normalizeName(name))).filter((id): id is string => !!id)],
      };

      // Remove duplicates
      const dedupe = (arr: string[]) => Array.from(new Set(arr));
      mergedTraits.critical = dedupe(mergedTraits.critical);
      mergedTraits.veryImportant = dedupe(mergedTraits.veryImportant);
      mergedTraits.important = dedupe(mergedTraits.important);
      mergedTraits.niceToHave = dedupe(mergedTraits.niceToHave);
      mergedSkills.critical = dedupe(mergedSkills.critical);
      mergedSkills.veryImportant = dedupe(mergedSkills.veryImportant);
      mergedSkills.important = dedupe(mergedSkills.important);
      mergedSkills.niceToHave = dedupe(mergedSkills.niceToHave);

      // Update ICP
      await this.updateProgramMatchProgramICP(ctx, programId, {
        critical: { traitIds: mergedTraits.critical, skillIds: mergedSkills.critical },
        veryImportant: { traitIds: mergedTraits.veryImportant, skillIds: mergedSkills.veryImportant },
        important: { traitIds: mergedTraits.important, skillIds: mergedSkills.important },
        niceToHave: { traitIds: mergedTraits.niceToHave, skillIds: mergedSkills.niceToHave },
      });

      // Merge program outcomes (if enabled)
      if (templateProgram.outcomes && draftConfig?.outcomesEnabled) {
        const currentProgramOutcomes = await this.getProgramMatchProgramOutcomes(ctx, programId);
        if (currentProgramOutcomes) {
          const mergedOutcomes = {
            priorities: {
              strong: dedupe([...(currentProgramOutcomes.priorities.strong || []), ...(templateProgram.outcomes.priorities?.strong || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
              moderate: dedupe([...(currentProgramOutcomes.priorities.moderate || []), ...(templateProgram.outcomes.priorities?.moderate || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
            },
            fields: {
              strong: dedupe([...(currentProgramOutcomes.fields.strong || []), ...(templateProgram.outcomes.fields?.strong || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
              moderate: dedupe([...(currentProgramOutcomes.fields.moderate || []), ...(templateProgram.outcomes.fields?.moderate || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
            },
            roles: {
              strong: dedupe([...(currentProgramOutcomes.roles.strong || []), ...(templateProgram.outcomes.roles?.strong || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
              moderate: dedupe([...(currentProgramOutcomes.roles.moderate || []), ...(templateProgram.outcomes.roles?.moderate || []).map(name => outcomeNameToId.get(normalizeName(name))).filter((id): id is string => !!id)]),
            },
          };
          await this.updateProgramMatchProgramOutcomes(ctx, programId, mergedOutcomes);
        }
      }
    }

    // Apply quiz draft (only if quiz is empty)
    const warnings: string[] = [];
    if (template.quizDraft) {
      const quizzes = await this.listProgramMatchQuizzes(ctx);
      const targetQuiz = quizzes.find(q => q.status === 'draft') || quizzes[0];
      if (targetQuiz) {
        const quizDraft = await this.getProgramMatchQuizDraftByQuizId(ctx, targetQuiz.id);
        if (quizDraft && quizDraft.questions.length === 0) {
          // Map trait/skill/outcome names to IDs for quiz options
          const mapNamesToIds = (names: string[] | undefined, nameToIdMap: Map<string, string>): string[] => {
            if (!names) return [];
            return names.map(name => nameToIdMap.get(normalizeName(name))).filter((id): id is string => !!id);
          };

          const questions = template.quizDraft.questions.map(q => ({
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: q.type,
            section: q.section,
            prompt: q.prompt,
            helperText: q.helperText || null,
            isOptional: q.isOptional,
            options: q.options.map(opt => ({
              id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              label: opt.label,
              traitIds: mapNamesToIds(opt.traits, traitNameToId),
              skillIds: mapNamesToIds(opt.skills, skillNameToId),
              outcomeIds: draftConfig && draftConfig.outcomesEnabled ? mapNamesToIds(opt.outcomes, outcomeNameToId) : [],
            })),
          }));

          await this.updateProgramMatchQuizDraftByQuizId(ctx, targetQuiz.id, {
            title: template.quizDraft.title,
            description: template.quizDraft.description,
            targetLength: template.quizDraft.targetLength,
            questions,
          });
        } else {
          warnings.push('Quiz already exists with questions. Template quiz was skipped.');
        }
      }
    }

    const skipped = {
      traits: template.traits.length - traitsCreated,
      skills: template.skills.length - skillsCreated,
      outcomes: template.outcomes ? template.outcomes.length - outcomesCreated : 0,
      programs: template.programs.length - programsCreated,
    };

    return {
      appliedAt: new Date().toISOString(),
      created: {
        traits: traitsCreated,
        skills: skillsCreated,
        outcomes: outcomesCreated,
        programs: programsCreated,
      },
      skipped,
      warnings,
    };
  },

  // Program Match Scoring v2 + AI Explanations
  async scoreProgramMatchResponses(ctx: DataContext, input: { publishedSnapshotId: string; answers: ProgramMatchAnswerPayload[] }): Promise<ProgramMatchScoreResult> {
    await delay(150);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Get published snapshots from the list
    const snapshots = await this.listProgramMatchPublishedSnapshots(ctx);
    const snapshot = snapshots.find((s: ProgramMatchPublishSnapshot) => s.id === input.publishedSnapshotId);
    if (!snapshot) {
      throw new Error(`Published snapshot ${input.publishedSnapshotId} not found`);
    }

    // Build maps for quick lookup
    const traitNameToId = new Map<string, string>();
    const skillNameToId = new Map<string, string>();
    const outcomeNameToId = new Map<string, string>();
    snapshot.traits.forEach((t: ProgramMatchTrait) => traitNameToId.set(t.name.toLowerCase().trim(), t.id));
    snapshot.skills.forEach((s: ProgramMatchSkill) => skillNameToId.set(s.name.toLowerCase().trim(), s.id));
    if (snapshot.outcomes) {
      snapshot.outcomes.forEach((o: ProgramMatchOutcome) => outcomeNameToId.set(o.name.toLowerCase().trim(), o.id));
    }

    const programScores: Record<string, number> = {};
    const programEvidence: Record<string, {
      traitHits: Array<{ traitId: string; bucket: 'critical' | 'veryImportant' | 'important' | 'niceToHave'; points: number }>;
      skillHits: Array<{ skillId: string; bucket: 'critical' | 'veryImportant' | 'important' | 'niceToHave'; points: number }>;
      outcomeHits: Array<{ outcomeId: string; strength: 'strong' | 'moderate'; points: number }>;
    }> = {};

    // Initialize scores and evidence
    snapshot.programs.forEach((p: ProgramMatchProgram) => {
      programScores[p.id] = 0;
      programEvidence[p.id] = { traitHits: [], skillHits: [], outcomeHits: [] };
    });

    // Score each answer
    // Note: Scoring requires quiz questions from quizVersionId, but this method doesn't receive it yet
    // TODO: Update scoring method signature to accept quizVersionId parameter
    // For now, return empty scores - scoring will need to be updated to work with quiz library
    input.answers.forEach((answer: ProgramMatchAnswerPayload) => {
      if (answer.skipped) return;
      // Scoring logic removed - needs quizVersionId to load questions from quiz version
    });

    // Sort programs by score with tie-breakers
    const sortedPrograms = Object.entries(programScores)
      .map(([programId, score]: [string, number]) => {
        const evidence = programEvidence[programId];
        const criticalTraitCount = evidence.traitHits.filter((h: { bucket: string }) => h.bucket === 'critical').length;
        const totalTraitCount = evidence.traitHits.length;
        const skillCount = evidence.skillHits.length;
        const program = snapshot.programs.find((p: ProgramMatchProgram) => p.id === programId);
        return {
          programId,
          score,
          criticalTraitCount,
          totalTraitCount,
          skillCount,
          programName: program?.name || '',
        };
      })
      .sort((a, b) => {
        // Primary: score descending
        if (b.score !== a.score) return b.score - a.score;
        // Tie-breaker 1: critical trait hits
        if (b.criticalTraitCount !== a.criticalTraitCount) return b.criticalTraitCount - a.criticalTraitCount;
        // Tie-breaker 2: total trait hits
        if (b.totalTraitCount !== a.totalTraitCount) return b.totalTraitCount - a.totalTraitCount;
        // Tie-breaker 3: skill hits
        if (b.skillCount !== a.skillCount) return b.skillCount - a.skillCount;
        // Tie-breaker 4: stable sort by name
        return a.programName.localeCompare(b.programName);
      });

    const topProgramIds = sortedPrograms.slice(0, 2).map(p => p.programId);
    const runnerUpProgramIds = sortedPrograms.slice(1, 3).map(p => p.programId);
    const topScore = sortedPrograms[0]?.score || 0;
    const runnerUpScore = sortedPrograms[1]?.score || 0;

    // Determine confidence
    let confidenceLabel: 'high' | 'medium' | 'low' = 'low';
    if (topScore >= 18 && (topScore - runnerUpScore) >= 6) {
      confidenceLabel = 'high';
    } else if (topScore > 0) {
      confidenceLabel = 'medium';
    }

    // Build evidence for top 2 programs
    const evidence = topProgramIds.slice(0, 2).map(programId => {
      const ev = programEvidence[programId];
      // Sort by points descending and take top contributors
      const topTraits = ev.traitHits
        .sort((a, b) => b.points - a.points)
        .slice(0, 3);
      const topSkills = ev.skillHits
        .sort((a, b) => b.points - a.points)
        .slice(0, 2);
      const outcomesHits = ev.outcomeHits.length > 0
        ? ev.outcomeHits
            .sort((a, b) => b.points - a.points)
            .slice(0, 2)
        : undefined;

      return {
        programId,
        topTraits,
        topSkills,
        outcomesHits,
      };
    });

    return {
      publishedSnapshotId: input.publishedSnapshotId,
      topProgramIds,
      runnerUpProgramIds,
      programScores: sortedPrograms.map(p => ({ programId: p.programId, score: p.score })),
      confidenceLabel,
      evidence,
    };
  },

  async generateProgramMatchExplanations(ctx: DataContext, input: { publishedSnapshotId: string; toneProfileId: string; scoreResult: ProgramMatchScoreResult; includeOutcomes: boolean }): Promise<ProgramMatchExplanationsResult> {
    await delay(300);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Get snapshot via existing method
    const snapshot = await this.getProgramMatchPublishedSnapshot(ctx, input.publishedSnapshotId);
    if (!snapshot) {
      throw new Error(`Published snapshot ${input.publishedSnapshotId} not found`);
    }

    // Get trait/skill/outcome names for evidence
    const traitIdToName = new Map<string, string>();
    const skillIdToName = new Map<string, string>();
    const outcomeIdToName = new Map<string, string>();
    snapshot.traits.forEach((t: ProgramMatchTrait) => traitIdToName.set(t.id, t.name));
    snapshot.skills.forEach((s: ProgramMatchSkill) => skillIdToName.set(s.id, s.name));
    if (snapshot.outcomes) {
      snapshot.outcomes.forEach((o: ProgramMatchOutcome) => outcomeIdToName.set(o.id, o.name));
    }

    // Generate deterministic explanations (fallback pattern)
    // In a real provider, this would call OpenAI with the evidence
    const explanations: ProgramMatchExplanation[] = input.scoreResult.topProgramIds.slice(0, 2).map((programId: string) => {
      const program = snapshot.programs.find((p: ProgramMatchProgram) => p.id === programId);
      const evidence = input.scoreResult.evidence.find(e => e.programId === programId);
      
      if (!program || !evidence) {
        return {
          programId,
          headline: 'A strong fit based on your priorities',
          bullets: [
            'Your interests align well with this program\'s focus areas',
            'Your learning style matches the program\'s approach',
            'You\'re looking for the kind of experience this program offers',
          ],
          nextStepCtaLabel: 'Request information',
        };
      }

      // Build bullets from evidence
      const traitNames = evidence.topTraits
        .slice(0, 2)
        .map(h => traitIdToName.get(h.traitId))
        .filter((name): name is string => !!name);
      const skillNames = evidence.topSkills
        .slice(0, 1)
        .map(h => skillIdToName.get(h.skillId))
        .filter((name): name is string => !!name);

      const bullets: string[] = [];
      if (traitNames.length > 0) {
        bullets.push(`Your ${traitNames[0]?.toLowerCase()} aligns well with this program's focus`);
      }
      if (traitNames.length > 1) {
        bullets.push(`Your ${traitNames[1]?.toLowerCase()} matches what this program values`);
      }
      if (skillNames.length > 0) {
        bullets.push(`Your experience with ${skillNames[0]?.toLowerCase()} is a great fit`);
      }
      // Fill to 3 bullets
      while (bullets.length < 3) {
        bullets.push('This program could be a great match for your goals');
      }

      return {
        programId,
        headline: `A strong fit for ${program.name}`,
        bullets: bullets.slice(0, 3),
        nextStepCtaLabel: 'Request information',
        nextStepCtaHelper: 'Learn more about this program',
      };
    });

    return {
      publishedSnapshotId: input.publishedSnapshotId,
      toneProfileId: input.toneProfileId,
      explanations,
      generatedAt: new Date().toISOString(),
    };
  },

  async attachProgramMatchExplanationsToRFI(ctx: DataContext, input: { rfiId: string; explanations: ProgramMatchExplanationsResult }): Promise<void> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    // Get RFI via list method (in a real implementation, we'd have a get method)
    const candidates = await this.listProgramMatchCandidates(ctx, {});
    const rfi = candidates.rows.find((r: ProgramMatchRFI) => r.id === input.rfiId);
    if (!rfi) {
      throw new Error(`RFI with id ${input.rfiId} not found`);
    }

    rfi.explanations = input.explanations;
  },

  // Program Match Widget (Phase 8)
  async getProgramMatchWidgetConfig(ctx: DataContext, input: { publishedSnapshotId: string; quizVersionId: string }): Promise<ProgramMatchWidgetConfig | null> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return null;
    }

    const snapshots = await this.listProgramMatchPublishedSnapshots(ctx);
    const snapshot = snapshots.find((s: ProgramMatchPublishSnapshot) => s.id === input.publishedSnapshotId);
    if (!snapshot) {
      return null;
    }

    // Get quiz version
    const quizVersion = await this.getProgramMatchQuizPublishedVersion(ctx, input.quizVersionId);
    if (!quizVersion) {
      return null;
    }

    // Build widget config from snapshot
    const programs = snapshot.programs.map((p: ProgramMatchProgram) => ({
      id: p.id,
      name: p.name,
    }));

    const icpByProgramId: Record<string, ProgramMatchICPBuckets> = {};
    snapshot.programICPs.forEach((icp: ProgramMatchProgramICP) => {
      icpByProgramId[icp.programId] = icp.buckets;
    });

    const programOutcomesByProgramId: Record<string, ProgramMatchProgramOutcomes> = {};
    if (snapshot.programOutcomes) {
      snapshot.programOutcomes.forEach((po: ProgramMatchProgramOutcomes) => {
        programOutcomesByProgramId[po.programId] = po;
      });
    }

    // Get voice/tone profile for gate copy
    const voiceToneProfiles = await this.listVoiceToneProfiles(ctx);
    const voiceToneProfile = voiceToneProfiles.find((p: VoiceToneProfile) => p.id === snapshot.draftConfig.voiceToneProfileId);

    // Convert quiz version to draft format for widget
    const quizDraft: ProgramMatchQuizDraft = {
      id: quizVersion.id,
      quizId: quizVersion.quizId,
      title: quizVersion.title,
      description: quizVersion.description,
      targetLength: quizVersion.targetLength,
      updatedAt: quizVersion.publishedAt,
      questions: quizVersion.questions,
    };

    return {
      publishedSnapshotId: snapshot.id,
      voiceToneProfileId: snapshot.draftConfig.voiceToneProfileId || '',
      gate: {
        requiredFields: { email: true, firstName: true, lastName: true },
        placement: 'before_quiz',
        headline: voiceToneProfile?.name ? `Find your best-fit program with ${voiceToneProfile.name}` : 'Find your best-fit graduate program',
        helperText: 'Answer a few quick questions to see which programs match your goals and style.',
      },
      quiz: quizDraft,
      programs,
      icpByProgramId,
      outcomesEnabled: snapshot.draftConfig.outcomesEnabled || false,
      programOutcomesByProgramId: snapshot.draftConfig.outcomesEnabled ? programOutcomesByProgramId : undefined,
      updatedAt: snapshot.publishedAt,
    };
  },

  // Program Match RFI (Phase 8)
  async createProgramMatchRFI(ctx: DataContext, input: { publishedSnapshotId: string; quizId: string; quizVersionId: string; contact: { email: string; firstName?: string; lastName?: string; phone?: string }; deploymentId?: string; pageTag?: string }): Promise<ProgramMatchRFI> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const now = new Date().toISOString();
    const rfi: ProgramMatchRFI = {
      id: `rfi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      publishedSnapshotId: input.publishedSnapshotId,
      quizId: input.quizId,
      quizVersionId: input.quizVersionId,
      deploymentId: input.deploymentId || null,
      pageTag: input.pageTag || null,
      createdAt: now,
      contact: input.contact,
      status: 'started',
      progress: {
        startedAt: now,
        lastActivityAt: now,
      },
    };

    programMatchRFIs.push(rfi);
    return { ...rfi };
  },

  async updateProgramMatchRFIProgress(ctx: DataContext, input: { rfiId: string; lastQuestionIndex: number }): Promise<ProgramMatchRFI> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const rfi = programMatchRFIs.find((r: ProgramMatchRFI) => r.id === input.rfiId);
    if (!rfi) {
      throw new Error(`RFI with id ${input.rfiId} not found`);
    }

    rfi.progress.lastQuestionIndex = input.lastQuestionIndex;
    rfi.progress.lastActivityAt = new Date().toISOString();

    return { ...rfi };
  },

  async completeProgramMatchRFI(ctx: DataContext, input: { rfiId: string; results: { topProgramIds: string[]; confidenceLabel: 'high' | 'medium' | 'low'; reasons: string[] } }): Promise<ProgramMatchRFI> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      throw new Error('Program Match is only available for admissions workspace');
    }

    const rfi = programMatchRFIs.find((r: ProgramMatchRFI) => r.id === input.rfiId);
    if (!rfi) {
      throw new Error(`RFI with id ${input.rfiId} not found`);
    }

    const now = new Date().toISOString();
    rfi.status = 'completed';
    rfi.progress.completedAt = now;
    rfi.progress.lastActivityAt = now;
    rfi.results = input.results;

    return { ...rfi };
  },

  // Program Match Candidates (Phase 9)
  async listProgramMatchCandidates(ctx: DataContext, input: { publishedSnapshotId?: string; quizId?: string; quizVersionId?: string; status?: 'started' | 'completed' | 'abandoned' | 'all'; q?: string; startedAfter?: string; startedBefore?: string; limit?: number; offset?: number }): Promise<ProgramMatchCandidatesListResponse> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return { total: 0, rows: [] };
    }

    let filtered = [...programMatchRFIs];

    // Filter by publishedSnapshotId
    if (input.publishedSnapshotId) {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.publishedSnapshotId === input.publishedSnapshotId);
    }

    // Filter by quizId
    if (input.quizId) {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.quizId === input.quizId);
    }

    // Filter by quizVersionId
    if (input.quizVersionId) {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.quizVersionId === input.quizVersionId);
    }

    // Filter by status
    if (input.status && input.status !== 'all') {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.status === input.status);
    }

    // Filter by search query (email, firstName, lastName)
    if (input.q) {
      const query = input.q.toLowerCase();
      filtered = filtered.filter((r: ProgramMatchRFI) => {
        const email = r.contact.email?.toLowerCase() || '';
        const firstName = r.contact.firstName?.toLowerCase() || '';
        const lastName = r.contact.lastName?.toLowerCase() || '';
        return email.includes(query) || firstName.includes(query) || lastName.includes(query);
      });
    }

    // Filter by date range
    if (input.startedAfter) {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.progress.startedAt >= input.startedAfter!);
    }
    if (input.startedBefore) {
      filtered = filtered.filter((r: ProgramMatchRFI) => r.progress.startedAt <= input.startedBefore!);
    }

    // Sort by lastActivityAt desc
    filtered.sort((a, b) => {
      const aTime = new Date(a.progress.lastActivityAt).getTime();
      const bTime = new Date(b.progress.lastActivityAt).getTime();
      return bTime - aTime;
    });

    const total = filtered.length;

    // Apply pagination
    const offset = input.offset || 0;
    const limit = input.limit || 100;
    const rows = filtered.slice(offset, offset + limit);

    return { total, rows };
  },

  async markProgramMatchAbandons(ctx: DataContext, input: { olderThanMinutes: number }): Promise<{ marked: number }> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return { marked: 0 };
    }

    const threshold = new Date(Date.now() - input.olderThanMinutes * 60 * 1000);
    let marked = 0;

    programMatchRFIs.forEach((rfi: ProgramMatchRFI) => {
      if (rfi.status === 'started') {
        const lastActivity = new Date(rfi.progress.lastActivityAt);
        if (lastActivity < threshold) {
          rfi.status = 'abandoned';
          rfi.abandonment = {
            abandonedAt: new Date().toISOString(),
            reason: 'timeout',
          };
          marked++;
        }
      }
    });

    return { marked };
  },

  async exportProgramMatchCandidatesCSV(ctx: DataContext, input: { status?: 'completed' | 'abandoned' | 'started' | 'all'; publishedSnapshotId?: string }): Promise<{ filename: string; csv: string }> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return { filename: 'candidates.csv', csv: '' };
    }

    // Use listProgramMatchCandidates to get filtered results
    const result = await this.listProgramMatchCandidates(ctx, {
      status: input.status || 'all',
      publishedSnapshotId: input.publishedSnapshotId,
    });

    // Generate CSV
    const headers = ['Email', 'First Name', 'Last Name', 'Phone', 'Status', 'Started At', 'Completed At', 'Top Programs', 'Confidence'];
    const rows = result.rows.map((rfi: ProgramMatchRFI) => {
      const topPrograms = rfi.results?.topProgramIds.join('; ') || '';
      const confidence = rfi.results?.confidenceLabel || '';
      return [
        rfi.contact.email || '',
        rfi.contact.firstName || '',
        rfi.contact.lastName || '',
        rfi.contact.phone || '',
        rfi.status,
        rfi.progress.startedAt,
        rfi.progress.completedAt || '',
        topPrograms,
        confidence,
      ];
    });

    const csvRows = [headers, ...rows].map((row: (string | undefined)[]) => {
      return row.map((cell: string | undefined) => {
        const value = cell || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csv = csvRows.join('\n');
    const filename = `program-match-candidates-${new Date().toISOString().split('T')[0]}.csv`;

    return { filename, csv };
  },

  async getProgramMatchAnalytics(ctx: DataContext, input: { publishedSnapshotId?: string; rangeDays: 7 | 30 | 90 }): Promise<ProgramMatchAnalytics> {
    await delay(100);
    
    if (ctx.workspace !== 'admissions') {
      return {
        tiles: {
          gateSubmits: 0,
          quizStarts: 0,
          quizCompletes: 0,
          resultsViewed: 0,
          abandonRate: 0,
        },
        funnel: [],
        byDay: [],
      };
    }

    // Filter RFIs by publishedSnapshotId if provided
    let rfis = [...programMatchRFIs];
    if (input.publishedSnapshotId) {
      rfis = rfis.filter((r: ProgramMatchRFI) => r.publishedSnapshotId === input.publishedSnapshotId);
    }

    // Filter by date range
    const rangeStart = new Date(Date.now() - input.rangeDays * 24 * 60 * 60 * 1000);
    rfis = rfis.filter((r: ProgramMatchRFI) => new Date(r.progress.startedAt) >= rangeStart);

    // Compute tiles
    const gateSubmits = rfis.length;
    const quizStarts = rfis.filter((r: ProgramMatchRFI) => (r.progress.lastQuestionIndex ?? -1) >= 0).length;
    const quizCompletes = rfis.filter((r: ProgramMatchRFI) => r.status === 'completed').length;
    const resultsViewed = quizCompletes; // Same as completes for now
    const abandonRate = gateSubmits > 0 ? Math.round((rfis.filter((r: ProgramMatchRFI) => r.status === 'abandoned').length / gateSubmits) * 100) : 0;

    // Compute funnel
    const funnel = [
      { step: 'Gate submits', count: gateSubmits },
      { step: 'Quiz starts', count: quizStarts },
      { step: 'Quiz completes', count: quizCompletes },
      { step: 'Results viewed', count: resultsViewed },
    ];

    // Compute daily trends
    const byDayMap = new Map<string, { gateSubmits: number; quizCompletes: number }>();
    rfis.forEach((rfi: ProgramMatchRFI) => {
      const date = rfi.progress.startedAt.split('T')[0];
      const existing = byDayMap.get(date) || { gateSubmits: 0, quizCompletes: 0 };
      existing.gateSubmits++;
      if (rfi.status === 'completed') {
        existing.quizCompletes++;
      }
      byDayMap.set(date, existing);
    });

    const byDay = Array.from(byDayMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      tiles: {
        gateSubmits,
        quizStarts,
        quizCompletes,
        resultsViewed,
        abandonRate,
      },
      funnel,
      byDay,
    };
  },

};

// Helper function to map queue items to objectives based on tags
function itemMatchesObjective(item: QueueItem, objectiveId: string): boolean {
  const tags = item.tags || [];
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  switch (objectiveId) {
    case 'stalled-applicants':
      // Items tagged stalled, inactive, no-activity, incomplete-application
      return (
        tags.some(tag => 
          ['stalled', 'inactive', 'no-activity', 'incomplete-app', 'incomplete-application'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('stalled') ||
        titleLower.includes('incomplete') ||
        summaryLower.includes('stalled') ||
        summaryLower.includes('no activity')
      );
    
    case 'missing-documents':
      // Items tagged missing-transcript, missing-docs, verification, recommendation-letter
      return (
        tags.some(tag => 
          ['missing-transcript', 'missing-docs', 'verification', 'recommendation-letter', 'transcript', 'missing'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('missing') ||
        titleLower.includes('transcript') ||
        titleLower.includes('document') ||
        summaryLower.includes('missing') ||
        summaryLower.includes('transcript')
      );
    
    case 'melt-risk':
      // Items tagged melt-risk, deposit-window, admitted-no-deposit, high-intent
      return (
        tags.some(tag => 
          ['melt-risk', 'deposit-window', 'admitted-no-deposit', 'high-intent', 'deposit'].includes(tag.toLowerCase())
        ) ||
        titleLower.includes('melt') ||
        titleLower.includes('deposit') ||
        titleLower.includes('admitted') ||
        summaryLower.includes('melt') ||
        summaryLower.includes('deposit')
      );
    
    default:
      return false;
  }
}

