import { GuardrailPolicy, GuardrailRule, GuardrailAssignmentRule } from './types';

function createRule(partial: Partial<GuardrailRule>): GuardrailRule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: 'custom',
    description: '',
    pattern: '',
    action: 'block',
    enabled: true,
    ...partial,
  };
}

export function getMockGuardrailPolicies(): GuardrailPolicy[] {
  const now = new Date().toISOString();

  const advancementPolicy: GuardrailPolicy = {
    id: 'policy-advancement',
    name: 'Advancement Guardrails',
    description: 'Stricter privacy and solicitation rules for donors and alumni engagement.',
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    rules: [
      createRule({
        category: 'safety',
        description: 'Do not expose full donor financial history or sensitive giving notes in responses.',
        action: 'block',
      }),
      createRule({
        category: 'safety',
        description: 'Avoid promising tax, legal, or financial outcomes. Direct users to institutional resources instead.',
        action: 'rewrite',
      }),
      createRule({
        category: 'compliance',
        description: 'Limit proactive outreach language to stewardship and relationship building. No aggressive or high pressure solicitations.',
        action: 'rewrite',
      }),
      createRule({
        category: 'custom',
        description: 'Log any conversation that references large or unusual gifts for human review.',
        action: 'log',
      }),
    ],
  };

  const admissionsPolicy: GuardrailPolicy = {
    id: 'policy-admissions',
    name: 'Admissions Guardrails',
    description: 'Applicant friendly guidance with strong protections for minors and sensitive admissions data.',
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    rules: [
      createRule({
        category: 'safety',
        description: 'Do not share individual applicant decisions, GPA, test scores, or private notes. Speak only in general, policy safe terms.',
        action: 'block',
      }),
      createRule({
        category: 'safety',
        description: 'If a student expresses distress, self harm, or crisis, escalate using institutional crisis resources. Do not diagnose or treat.',
        action: 'escalate',
      }),
      createRule({
        category: 'compliance',
        description: 'Encourage exploration and next steps, but do not pressure students to enroll, commit, or disclose financial or immigration status.',
        action: 'rewrite',
      }),
      createRule({
        category: 'compliance',
        description: 'Avoid implying guarantees about admission, scholarships, financial aid, or visa outcomes.',
        action: 'rewrite',
      }),
    ],
  };

  const studentSuccessPolicy: GuardrailPolicy = {
    id: 'policy-student-success',
    name: 'Student Success Guardrails',
    description: 'Coaching oriented support with strong academic integrity and mental health boundaries.',
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    rules: [
      createRule({
        category: 'compliance',
        description: 'Do not complete graded assignments or exams for students. Focus on teaching concepts and study strategies.',
        action: 'rewrite',
      }),
      createRule({
        category: 'safety',
        description: 'If a student expresses mental health concerns or self harm, respond with empathy and route to campus support resources.',
        action: 'escalate',
      }),
      createRule({
        category: 'safety',
        description: 'Do not reveal other students grades, schedules, or personal information.',
        action: 'block',
      }),
      createRule({
        category: 'compliance',
        description: 'Encourage constructive behaviors like attending office hours, using tutoring centers, and meeting with advisors.',
        action: 'rewrite',
      }),
    ],
  };

  const janeSmithPolicy: GuardrailPolicy = {
    id: 'policy-jane-smith',
    name: 'Jane Smith Guardrails',
    description: 'User specific guardrails tailored for Jane Smith, with extra constraints around donor privacy and commitments.',
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    rules: [
      createRule({
        category: 'safety',
        description: 'Do not reference internal donor notes or planned giving details in responses for Jane Smith. Keep answers at a high level.',
        action: 'block',
      }),
      createRule({
        category: 'compliance',
        description: 'Avoid language that commits the institution to specific benefits, recognition, or naming opportunities without human review.',
        action: 'rewrite',
      }),
      createRule({
        category: 'custom',
        description: 'Log any conversation where Jane Smith discusses large gifts, complex pledges, or gift agreements for advancement leadership review.',
        action: 'log',
      }),
    ],
  };

  return [
    advancementPolicy,
    admissionsPolicy,
    studentSuccessPolicy,
    janeSmithPolicy,
  ];
}

export function getMockGuardrailAssignmentRules(): GuardrailAssignmentRule[] {
  // Example assignments to show in the Assignments tab.
  // Using IDs that match the mock apps/users in the codebase
  // Note: app-1 = Admissions AI Assistant, app-2 = Student Success Coach, app-3 = Athletics Bot
  // We'll assign policies to apps by reusing these IDs but with appropriate labels
  return [
    {
      id: 'assign-app-advancement',
      policyId: 'policy-advancement',
      scope: 'app',
      targetId: 'app-advancement', // Custom ID for Advancement app
      targetLabel: 'Advancement AI Assistant',
      channelScope: 'all',
      order: 0,
    },
    {
      id: 'assign-app-admissions',
      policyId: 'policy-admissions',
      scope: 'app',
      targetId: 'app-1', // Admissions AI Assistant
      targetLabel: 'Admissions AI Assistant',
      channelScope: 'all',
      order: 0,
    },
    {
      id: 'assign-app-student-success',
      policyId: 'policy-student-success',
      scope: 'app',
      targetId: 'app-2', // Student Success Coach
      targetLabel: 'Student Success Coach',
      channelScope: 'all',
      order: 0,
    },
    {
      id: 'assign-user-jane-smith',
      policyId: 'policy-jane-smith',
      scope: 'user',
      targetId: 'user-1', // Jane Smith (now first in mock users list)
      targetLabel: 'Jane Smith',
      channelScope: 'all',
      order: 0,
    },
  ];
}


