import type { SegmentDefinition, SegmentTemplate } from './types';

export const MOCK_SEGMENTS: SegmentDefinition[] = [
  {
    id: 'seg-high-intent-prospects',
    title: 'High Intent Prospects',
    description: 'Prospects showing strong engagement signals and high likelihood to enroll',
    tags: ['admissions', 'prospects', 'high-priority'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'admissions' },
  },
  {
    id: 'seg-missing-transcript',
    title: 'Missing Transcript',
    description: 'Students with incomplete transcript submissions',
    tags: ['admissions', 'registrar', 'documents'],
    scope: { suiteId: 'student-lifecycle' },
  },
  {
    id: 'seg-incomplete-app-7d',
    title: 'Incomplete Application (7+ days)',
    description: 'Applications that have been incomplete for 7 or more days',
    tags: ['admissions', 'applications', 'at-risk'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'admissions' },
  },
  {
    id: 'seg-melt-risk',
    title: 'Melt Risk',
    description: 'Enrolled students showing signs of potential enrollment melt',
    tags: ['admissions', 'enrollment', 'at-risk'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'admissions' },
  },
  {
    id: 'seg-at-risk-no-lms-10d',
    title: 'At Risk - No LMS Activity (10+ days)',
    description: 'Students with no learning management system activity for 10+ days',
    tags: ['student-success', 'engagement', 'at-risk'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'student-success' },
  },
  {
    id: 'seg-lybunt',
    title: 'LYBUNT (Last Year But Unfortunately Not This)',
    description: 'Donors who gave last year but have not given this year',
    tags: ['advancement', 'fundraising', 'donors'],
    scope: { suiteId: 'advancement' },
  },
  {
    id: 'seg-registration-errors',
    title: 'Registration Errors',
    description: 'Students with registration issues or errors',
    tags: ['registrar', 'registration', 'errors'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'registrar' },
  },
  {
    id: 'seg-financial-aid-pending',
    title: 'Financial Aid Pending',
    description: 'Students with pending financial aid applications',
    tags: ['financial-aid', 'applications', 'pending'],
    scope: { suiteId: 'student-lifecycle', workspaceId: 'financial-aid' },
  },
];

export const MOCK_SEGMENT_TEMPLATES: SegmentTemplate[] = [
  {
    id: 'template-high-engagement',
    title: 'High Engagement Prospects',
    prompt: 'Find prospects with high engagement scores and recent activity',
    tags: ['admissions', 'prospects'],
  },
  {
    id: 'template-at-risk',
    title: 'At Risk Students',
    prompt: 'Identify students showing signs of academic or enrollment risk',
    tags: ['student-success', 'at-risk'],
  },
  {
    id: 'template-donor-retention',
    title: 'Donor Retention',
    prompt: 'Find donors who may be at risk of lapsing',
    tags: ['advancement', 'donors'],
  },
  {
    id: 'template-document-completion',
    title: 'Document Completion',
    prompt: 'Students with missing or incomplete required documents',
    tags: ['admissions', 'registrar', 'documents'],
  },
];

export function getSegmentById(id: string): SegmentDefinition | undefined {
  return MOCK_SEGMENTS.find((seg) => seg.id === id);
}

export function getSegmentsByWorkspace(workspaceId?: string, suiteId?: string): SegmentDefinition[] {
  return MOCK_SEGMENTS.filter((seg) => {
    if (workspaceId && seg.scope?.workspaceId) {
      return seg.scope.workspaceId === workspaceId;
    }
    if (suiteId && seg.scope?.suiteId) {
      return seg.scope.suiteId === suiteId;
    }
    // If no scope restrictions, include it
    return !seg.scope || (!seg.scope.workspaceId && !seg.scope.suiteId);
  });
}

export function getTemplateById(id: string): SegmentTemplate | undefined {
  return MOCK_SEGMENT_TEMPLATES.find((tpl) => tpl.id === id);
}





