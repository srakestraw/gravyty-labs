'use client';

export const dynamic = 'force-static';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { canManageAssistants } from '@/lib/roles';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Persona =
  | 'admissions'
  | 'registrar'
  | 'student-success'
  | 'career-services'
  | 'alumni-engagement'
  | 'advancement';

interface PersonaConfig {
  label: string;
  description: string;
  descriptionBullets: string[];
  snapshotMetrics: { label: string; value: string }[];
  assistants: {
    id: string;
    name: string;
    goal: string;
    status: 'active' | 'paused' | 'draft';
    impact?: string;
  }[];
  recommendedTemplates: {
    id: string;
    name: string;
    description: string;
  }[];
  recentActivity: {
    timestamp: string;
    description: string;
  }[];
  recentWins?: {
    label: string;
    detail?: string;
    assistantName?: string;
  }[];
  dailyFocusSummary?: string;
  gamePlanTasks?: {
    id: string;
    title: string;
    description?: string;
    impactHint?: string;
    type?: 'email' | 'meeting' | 'pipeline' | 'retention' | 'proposal' | 'other';
  }[];
  flaggedRisks?: {
    id: string;
    label: string;
    detail?: string;
    severity?: 'low' | 'medium' | 'high';
  }[];
  gamification?: {
    streakDays?: number;
    weeklyGoal?: number;
    weeklyCompleted?: number;
    momentumScore?: number;
  };
  coachMessage?: string;
}

// Mock data for each persona
const personaConfigs: Record<Persona, PersonaConfig> = {
  admissions: {
    label: 'Admissions',
    description: 'This space shows how assistants are helping you:',
    descriptionBullets: [
      'Reduce stalled applicants',
      'Clear missing documents',
      'Prevent melt in the admit → deposit window',
    ],
    snapshotMetrics: [
      { label: 'Active applicants', value: '1,284' },
      { label: 'Stalled (no activity in the last 7 days)', value: '212' },
      { label: 'With missing documents', value: '96' },
      { label: 'At melt risk (admitted but low engagement)', value: '48' },
      { label: 'New inquiries in the last 24 hours', value: '72' },
    ],
    assistants: [
      {
        id: '1',
        name: 'Application Progress Assistant',
        goal: 'Reduce stalled applicants',
        status: 'active',
        impact: '38% fewer stalled applications (last 7 days)',
      },
      {
        id: '2',
        name: 'Missing Documents Assistant',
        goal: 'Increase transcript & recommendation completion',
        status: 'draft',
      },
      {
        id: '3',
        name: 'Melt Prevention Assistant',
        goal: 'Reduce melt between admit and deposit',
        status: 'paused',
        impact: '17% fewer no-shows (last run period)',
      },
    ],
    recommendedTemplates: [
      {
        id: 'transcript-helper',
        name: 'Transcript Helper Assistant',
        description: 'Monitor transcript status and send guided reminders.',
      },
      {
        id: 'recommendation-letter',
        name: 'Recommendation Letter Assistant',
        description: 'Track recommender activity and remind students before deadlines.',
      },
      {
        id: 'high-intent-prospect',
        name: 'High-Intent Prospect Assistant',
        description: 'Identify prospects most likely to apply based on engagement signals.',
      },
    ],
    recentActivity: [
      {
        timestamp: '10:42 AM',
        description: 'Application Progress Assistant flagged 8 new stalled applicants',
      },
      {
        timestamp: '9:15 AM',
        description: 'Missing Documents Assistant identified 23 missing transcripts',
      },
      {
        timestamp: '8:02 AM',
        description: 'Melt Prevention Assistant escalated 3 admits for advisor follow-up',
      },
      {
        timestamp: 'Yesterday 4:21 PM',
        description: '17 stalled applicants moved forward after reminders',
      },
    ],
    dailyFocusSummary:
      'Reduce stalled applicants, clear missing documents, and prevent melt for high-intent admits.',
    gamification: {
      streakDays: 3,
      weeklyGoal: 25,
      weeklyCompleted: 9,
      momentumScore: 76,
    },
    gamePlanTasks: [
      {
        id: 'stalled-applicants',
        title: 'Reach out to 15 applicants who stalled this week',
        description: 'No portal activity for 7+ days, many are missing only 1–2 items.',
        impactHint: 'Unblocking them can meaningfully boost completion before deadlines.',
        type: 'pipeline',
      },
      {
        id: 'missing-documents',
        title: 'Clear missing documents for 20 applicants',
        description: 'Transcripts and recommendation letters are the most common blockers.',
        impactHint: 'Completing these moves applications closer to review-ready status.',
        type: 'other',
      },
      {
        id: 'melt-risk',
        title: 'Support 10 admits at melt risk',
        description: 'Admitted but low engagement in the last 10 days.',
        impactHint: 'Reduces the risk of losing high-intent admits before deposit.',
        type: 'retention',
      },
      {
        id: 'deadline-incomplete',
        title: 'Follow up on 5 incomplete applications close to deadline',
        description: 'Deadlines in the next 5 days, 70–90% complete.',
        impactHint: 'Boosts completion rate just before key cutoffs.',
        type: 'pipeline',
      },
      {
        id: 'prep-meetings',
        title: 'Prepare for 2 info sessions / advising meetings today',
        description: 'One virtual info session and one 1:1 counseling session for a STEM prospect.',
        impactHint: 'Better prep leads to higher conversion from interest to application.',
        type: 'meeting',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-melt',
        label: '42 admits at melt risk',
        detail: 'Admitted students with little or no activity in the last 10 days.',
        severity: 'high',
      },
      {
        id: 'risk-deadlines',
        label: '63 applicants stalled with deadlines in the next 7 days',
        detail: 'No recent portal activity and critical items still missing.',
        severity: 'high',
      },
      {
        id: 'risk-international',
        label: '25 international applicants missing visa or financial docs',
        detail: 'Risk of missing enrollment or arrival timelines.',
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: '27 stalled applicants moved forward this week',
        detail: 'Application Progress Assistant helped identify and nudge them.',
        assistantName: 'Application Progress Assistant',
      },
      {
        label: '41 applicants completed their missing document checklists',
        detail: 'Missing Documents Assistant drove targeted reminders.',
        assistantName: 'Missing Documents Assistant',
      },
      {
        label: '18 admits at risk re-engaged after outreach',
        detail: 'Melt Prevention Assistant recommended the right touchpoints.',
        assistantName: 'Melt Prevention Assistant',
      },
    ],
    coachMessage:
      "Today is a high-leverage day. If you focus on stalled applicants with only one or two items missing, you'll see a meaningful boost in completion rates before deadlines hit.",
  },
  registrar: {
    label: 'Registrar',
    description: 'Focus on registration health, data integrity, compliance, and keeping students on track for graduation.',
    descriptionBullets: [
      'Help students with course selection',
      'Resolve schedule conflicts',
      'Send registration reminders',
      'Maintain data integrity',
      'Ensure graduation readiness',
    ],
    snapshotMetrics: [
      { label: 'Active students this term', value: '12,430' },
      { label: 'Students blocked from registration', value: '14' },
      { label: 'Open data integrity alerts', value: '8' },
      { label: 'Students at-risk for graduation delay', value: '17' },
    ],
    assistants: [
      {
        id: '5',
        name: 'Registration Blocker Assistant',
        goal: 'Detect and resolve students blocked from registration',
        status: 'active',
        impact: '32% reduction in registration blockers this week',
      },
      {
        id: '6',
        name: 'Graduation Path Assistant',
        goal: 'Identify students at risk of delayed graduation',
        status: 'active',
        impact: '23 students moved back on track this week',
      },
      {
        id: '7',
        name: 'Data Integrity Assistant',
        goal: 'Monitor and resolve data integrity issues',
        status: 'active',
        impact: '15 issues auto-resolved last week',
      },
    ],
    recommendedTemplates: [
      {
        id: 'registration-blocker-assistant',
        name: 'Registration Blocker Assistant',
        description: 'Automatically detect and summarize students blocked from registration, with recommended fixes and outreach.',
      },
      {
        id: 'data-integrity-assistant',
        name: 'Data Integrity Assistant',
        description: 'Monitor student records and course data for duplicates, missing fields, and policy violations.',
      },
      {
        id: 'graduation-path-assistant',
        name: 'Graduation Path Assistant',
        description: 'Identify students at risk of delayed graduation and coordinate next steps with advisors.',
      },
      {
        id: 'schedule-health-assistant',
        name: 'Schedule Health Assistant',
        description: 'Flag over- and under-enrolled sections and room capacity issues before registration rush.',
      },
    ],
    recentActivity: [
      {
        timestamp: '11:20 AM',
        description: 'Registration Blocker Assistant resolved 5 student holds',
      },
      {
        timestamp: '9:45 AM',
        description: 'Data Integrity Assistant flagged 3 duplicate transfer credits',
      },
      {
        timestamp: '8:30 AM',
        description: 'Graduation Path Assistant identified 4 students missing requirements',
      },
    ],
    dailyFocusSummary:
      'Unblock students, resolve data integrity issues, and mitigate compliance and scheduling risks.',
    gamification: {
      streakDays: 4,
      weeklyGoal: 7,
      weeklyCompleted: 3,
      momentumScore: 81,
    },
    gamePlanTasks: [
      {
        id: 'registration-blockers',
        title: 'Review students blocked from registration (14 students)',
        description:
          'Students unable to register due to holds, missing prerequisites, or system issues.',
        impactHint:
          'Clearing these blockers improves time-to-enroll and reduces frustration at the start of term.',
        type: 'pipeline',
      },
      {
        id: 'data-integrity',
        title: 'Resolve 8 data integrity issues flagged overnight',
        description:
          'Duplicate transfer credits, missing instructors, and overdue grade postings.',
        impactHint:
          'Accurate records reduce audit risk and prevent downstream student issues.',
        type: 'other',
      },
      {
        id: 'course-availability',
        title: 'Address over/under-enrolled courses before registration opens',
        description:
          '2 courses over capacity, 3 at risk of cancellation due to low enrollment, 1 room capacity mismatch.',
        impactHint:
          'Balancing sections improves student choice and avoids last-minute schedule churn.',
        type: 'other',
      },
      {
        id: 'graduation-readiness',
        title: 'Check graduation readiness for students flagged as at-risk',
        description:
          '17 students missing documentation or key requirements for upcoming graduation.',
        impactHint:
          'Catching these early avoids last-minute crises for students and faculty.',
        type: 'retention',
      },
      {
        id: 'upcoming-cycle-prep',
        title: 'Prepare for the next registration window (opens in 5 days)',
        description:
          'Verify registration rules, holds logic, and priority groups are configured correctly.',
        impactHint:
          'Solid preparation reduces support volume and system exceptions when registration opens.',
        type: 'other',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-graduation',
        label: '17 students at risk of delayed graduation',
        detail: 'Missing documentation or unmet degree requirements for the upcoming term.',
        severity: 'high',
      },
      {
        id: 'risk-registration-blockers',
        label: '14 students currently blocked from registration',
        detail: 'Mix of advising holds, missing prerequisites, and financial holds.',
        severity: 'high',
      },
      {
        id: 'risk-data-integrity',
        label: '8 open data integrity issues',
        detail: 'Duplicate transfer credit entries, missing instructors, and late grade submissions.',
        severity: 'medium',
      },
      {
        id: 'risk-course-balance',
        label: 'Course imbalance in next term schedule',
        detail: 'Over-enrolled and under-enrolled sections may lead to cancellation or waitlist issues.',
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: 'Registration blockers reduced by 32% this week',
        detail:
          'Registration Blocker Assistant helped surface and resolve student holds before the window opened.',
        assistantName: 'Registration Blocker Assistant',
      },
      {
        label: '23 students moved back on track for graduation',
        detail:
          'Graduation Path Assistant identified missing requirements and nudged advisors and students.',
        assistantName: 'Graduation Path Assistant',
      },
      {
        label: '15 data integrity issues auto-resolved last week',
        detail:
          'Data Integrity Assistant de-duplicated records and notified departments about missing information.',
        assistantName: 'Data Integrity Assistant',
      },
    ],
    coachMessage:
      'Today is a critical day for registration health. Clearing blockers and resolving data issues now will prevent cascading problems when the next registration window opens. Your momentum is strong—keep it going.',
  },
  'student-success': {
    label: 'Student Success',
    description: 'Focus on helping students persist, stay on track academically, and stay engaged through proactive outreach.',
    descriptionBullets: [
      'Detect at-risk students early',
      'Provide timely interventions',
      'Track academic progress',
      'Coordinate with advisors and instructors',
      'Improve course performance and retention',
    ],
    snapshotMetrics: [
      { label: 'Active students monitored', value: '6,240' },
      { label: 'Students flagged high-risk', value: '38' },
      { label: 'Moderate-risk students', value: '126' },
      { label: 'At-risk students contacted this week', value: '52' },
      { label: 'Upcoming student meetings today', value: '5' },
    ],
    assistants: [
      {
        id: '2',
        name: 'Early Alert Assistant',
        goal: 'Consolidate alerts to identify students at risk and prioritize outreach',
        status: 'active',
        impact: '22 high-risk students moved to stable status this month',
      },
      {
        id: '8',
        name: 'Course Performance Assistant',
        goal: 'Monitor performance in key courses and flag students needing support',
        status: 'active',
        impact: 'DFW rate reduced by 8% in 2 gateway courses',
      },
      {
        id: '9',
        name: 'Success Outreach Assistant',
        goal: 'Coordinate outreach to at-risk students and reduce no-contact rates',
        status: 'active',
        impact: '52 students contacted this week with 78% response rate',
      },
    ],
    recommendedTemplates: [
      {
        id: 'early-alert-assistant',
        name: 'Early Alert Assistant',
        description: 'Consolidate LMS, attendance, and advisor alerts to identify students at risk and prioritize outreach.',
      },
      {
        id: 'course-performance-assistant',
        name: 'Course Performance Assistant',
        description: 'Monitor performance and engagement in key courses to highlight trends and flag students needing support.',
      },
      {
        id: 'success-outreach-assistant',
        name: 'Success Outreach Assistant',
        description: 'Coordinate and log outreach to at-risk students, propose next-best actions, and reduce no-contact rates.',
      },
      {
        id: 'student-success-coach-assistant',
        name: 'Student Success Coach Assistant',
        description: 'Generate prep briefs, action plans, and follow-up suggestions for upcoming student meetings.',
      },
    ],
    recentActivity: [
      {
        timestamp: '9:30 AM',
        description: 'Early Alert Assistant identified 12 new high-risk students',
      },
      {
        timestamp: '8:15 AM',
        description: 'Course Performance Assistant flagged 3 gateway courses with rising DFW trends',
      },
      {
        timestamp: 'Yesterday 4:45 PM',
        description: 'Success Outreach Assistant scheduled 8 follow-up meetings with at-risk students',
      },
    ],
    dailyFocusSummary:
      'Prioritize at-risk students, act on early alerts, and follow up with students who are slipping in engagement or performance.',
    gamification: {
      streakDays: 5,
      weeklyGoal: 30,
      weeklyCompleted: 18,
      momentumScore: 82,
    },
    gamePlanTasks: [
      {
        id: 'high-risk-students',
        title: 'Reach out to 10 high-risk students flagged in the last 24 hours',
        description:
          'Students with multiple alerts: low LMS activity, missing assignments, or sharp GPA drops.',
        impactHint:
          'Timely outreach can prevent withdrawals and keep them on track for the term.',
        type: 'retention',
      },
      {
        id: 'moderate-risk-followup',
        title: 'Follow up with 15 moderate-risk students with no response in 7+ days',
        description:
          'Students who received outreach but have not replied or scheduled a meeting.',
        impactHint:
          'Second-touch and personalized nudges increase engagement and meeting conversion.',
        type: 'email',
      },
      {
        id: 'course-performance',
        title: 'Review 3 gateway courses with high DFW rates',
        description:
          'Identify students who are trending toward D/F/withdrawal and coordinate with instructors.',
        impactHint:
          'Improving outcomes in gateway courses has an outsized impact on persistence and retention.',
        type: 'pipeline',
      },
      {
        id: 'appointment-prep',
        title: "Prepare for today's 5 student meetings",
        description:
          'AI-generated prep briefs summarizing risk signals, goals, and recommended talking points.',
        impactHint:
          'Focused meetings lead to better plans and higher follow-through from students.',
        type: 'meeting',
      },
      {
        id: 'engagement-drop',
        title: 'Check on students with sudden engagement drops this week',
        description:
          'Students who stopped attending class or logging into LMS after being consistently active.',
        impactHint:
          'Catching sudden disengagement early can prevent spirals that lead to stop-out.',
        type: 'retention',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-high-risk-cohort',
        label: '38 students flagged as high-risk this week',
        detail:
          'Multiple indicators: low LMS activity, missing major assignments, advisor alerts, or GPA declines.',
        severity: 'high',
      },
      {
        id: 'risk-gateway-courses',
        label: '3 gateway courses with rising DFW trends',
        detail:
          'Intro-level courses driving a disproportionate share of at-risk alerts.',
        severity: 'high',
      },
      {
        id: 'risk-no-contact',
        label: '24 at-risk students with no successful contact in 14+ days',
        detail:
          'Previous outreach attempts were not answered; may require alternative channels or escalation.',
        severity: 'medium',
      },
      {
        id: 'risk-first-year-cohort',
        label: 'First-year persistence warning for current cohort',
        detail:
          'Engagement and alert patterns suggest elevated risk of first-year attrition.',
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: '22 high-risk students moved to stable status this month',
        detail:
          'Early Alert Assistant and Success Outreach Assistant coordinated targeted nudges and meeting scheduling.',
        assistantName: 'Early Alert Assistant',
      },
      {
        label: 'DFW rate reduced by 8% in 2 gateway courses',
        detail:
          'Course Performance Assistant highlighted at-risk students early and prompted interventions.',
        assistantName: 'Course Performance Assistant',
      },
      {
        label: 'First-year persistence up 5% for flagged cohort',
        detail:
          'Student Success Coach Assistant helped drive multi-channel outreach and follow-ups.',
        assistantName: 'Student Success Coach Assistant',
      },
    ],
    coachMessage:
      'Your consistent outreach is making a real difference. Today, focus on those high-risk students—early intervention now can change their entire trajectory. Keep the momentum going.',
  },
  'career-services': {
    label: 'Career Services',
    description: 'Focus on helping students explore careers, secure internships and jobs, and build strong employer relationships.',
    descriptionBullets: [
      'Career counseling support',
      'Job matching assistance',
      'Resume review automation',
      'Employer relationship management',
      'Career event coordination',
    ],
    snapshotMetrics: [
      { label: 'Active students in career system', value: '4,520' },
      { label: 'Students flagged low engagement', value: '142' },
      { label: 'Upcoming grads with no applications', value: '48' },
      { label: 'Student appointments today', value: '6' },
      { label: 'Active employers this term', value: '128' },
    ],
    assistants: [
      {
        id: '10',
        name: 'Career Engagement Assistant',
        goal: 'Detect students with low or no career activity and recommend targeted actions',
        status: 'active',
        impact: '34 low-engagement students re-engaged this month',
      },
      {
        id: '11',
        name: 'Opportunity Matching Assistant',
        goal: 'Match students to relevant jobs and internships based on profile and interests',
        status: 'active',
        impact: 'Internship offers increased by 12% in key majors',
      },
      {
        id: '12',
        name: 'Employer Outreach Assistant',
        goal: 'Monitor employer activity and suggest outreach to sustain relationships',
        status: 'active',
        impact: '9 quiet employers reactivated with new postings',
      },
    ],
    recommendedTemplates: [
      {
        id: 'career-engagement-assistant',
        name: 'Career Engagement Assistant',
        description: 'Detect students with low or no career activity and recommend targeted nudges or actions.',
      },
      {
        id: 'opportunity-matching-assistant',
        name: 'Opportunity Matching Assistant',
        description: 'Match students to relevant jobs and internships based on profile, interests, and history.',
      },
      {
        id: 'employer-outreach-assistant',
        name: 'Employer Outreach Assistant',
        description: 'Monitor employer activity, highlight quiet partners, and suggest outreach to sustain relationships.',
      },
      {
        id: 'appointment-coach-assistant',
        name: 'Appointment Coach Assistant',
        description: 'Generate prep briefs and follow-up plans for upcoming career advising meetings.',
      },
    ],
    recentActivity: [
      {
        timestamp: '10:15 AM',
        description: 'Career Engagement Assistant identified 8 students with no activity this term',
      },
      {
        timestamp: '9:00 AM',
        description: 'Opportunity Matching Assistant matched 12 students to new job postings',
      },
      {
        timestamp: 'Yesterday 3:30 PM',
        description: 'Employer Outreach Assistant flagged 3 employers going quiet',
      },
    ],
    dailyFocusSummary:
      'Prioritize high-potential students, follow up on employer activity, and move opportunities closer to offers.',
    gamification: {
      streakDays: 4,
      weeklyGoal: 40,
      weeklyCompleted: 22,
      momentumScore: 79,
    },
    gamePlanTasks: [
      {
        id: 'priority-students',
        title: 'Follow up with 12 priority students with upcoming deadlines',
        description:
          'Students with applications due in the next 7 days or upcoming interviews.',
        impactHint:
          'Timely prep and nudges increase completion and offer rates for these students.',
        type: 'pipeline',
      },
      {
        id: 'no-activity-students',
        title: 'Check in on 15 students with no career activity this term',
        description:
          'No appointments, event attendance, or applications logged in the last 30 days.',
        impactHint:
          'Early engagement helps keep students from falling behind on internships and job searches.',
        type: 'retention',
      },
      {
        id: 'today-appointments',
        title: "Prepare for today's 6 student appointments",
        description:
          'AI-generated prep briefs: goals, major, past experiences, and recommended talking points.',
        impactHint:
          'Better-prepared meetings lead to clearer plans and stronger outcomes.',
        type: 'meeting',
      },
      {
        id: 'employer-followup',
        title: 'Follow up with 5 engaged employers with recent student interest',
        description:
          'Employers with recent job postings, event participation, or high student views.',
        impactHint:
          'Strengthening employer relationships expands opportunities and pipelines.',
        type: 'email',
      },
      {
        id: 'event-promotion',
        title: 'Promote upcoming career events to low-engagement segments',
        description:
          "Students who have not attended any events but match the target audience for next week's fair or workshop.",
        impactHint:
          'Targeted promotion boosts event attendance and broadens student exposure to opportunities.',
        type: 'other',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-low-engagement',
        label: '142 students flagged as low career engagement',
        detail:
          'No appointments, events, or applications recorded over the last 60 days.',
        severity: 'high',
      },
      {
        id: 'risk-upcoming-grads',
        label: '48 upcoming graduates with no applications on record',
        detail:
          'Graduating this term, but no active job or internship applications in the system.',
        severity: 'high',
      },
      {
        id: 'risk-under-served-majors',
        label: '3 majors with low internship placement rates',
        detail:
          'Students in these programs show lower application and offer activity.',
        severity: 'medium',
      },
      {
        id: 'risk-employer-churn',
        label: '6 previously active employers are going quiet',
        detail:
          'Drop in postings or event participation compared to last term.',
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: '34 low-engagement students re-engaged this month',
        detail:
          'Career Engagement Assistant targeted students with tailored nudges and event invites.',
        assistantName: 'Career Engagement Assistant',
      },
      {
        label: 'Internship offers increased by 12% in key majors',
        detail:
          'Opportunity Matching Assistant recommended roles aligned with skills and interests.',
        assistantName: 'Opportunity Matching Assistant',
      },
      {
        label: '9 quiet employers reactivated with new postings',
        detail:
          'Employer Outreach Assistant suggested timely check-ins and highlighted student demand.',
        assistantName: 'Employer Outreach Assistant',
      },
    ],
    coachMessage:
      'Your focus on engagement and employer relationships is paying off. Today, prioritize those students with upcoming deadlines—they need your support most right now. Keep building momentum.',
  },
  'alumni-engagement': {
    label: 'Alumni Engagement',
    description: 'Focus on building lifelong relationships through events, mentoring, volunteering, and meaningful touchpoints.',
    descriptionBullets: [
      'Re-connect with dormant alumni',
      'Promote events and opportunities',
      'Personalize communications',
      'Foster mentoring relationships',
      'Coordinate volunteer opportunities',
    ],
    snapshotMetrics: [
      { label: 'Engaged alumni this year', value: '4,180' },
      { label: 'Active mentoring pairs', value: '136' },
      { label: 'Active volunteers this term', value: '94' },
      { label: 'Upcoming events (30 days)', value: '7' },
      { label: 'Flagged at-risk alumni', value: '362' },
    ],
    assistants: [
      {
        id: '13',
        name: 'Mentoring Engagement Assistant',
        goal: 'Monitor mentoring pairs for inactivity and suggest check-ins',
        status: 'active',
        impact: 'Mentoring activity increased by 18% this quarter',
      },
      {
        id: '14',
        name: 'Event Promotion Assistant',
        goal: 'Identify alumni segments and send targeted nudges to increase RSVPs',
        status: 'active',
        impact: 'Two regional events exceeded RSVP targets by 22%',
      },
      {
        id: '15',
        name: 'Volunteer Matching Assistant',
        goal: 'Match interested alumni to open volunteer roles',
        status: 'active',
        impact: '47 lapsed alumni re-engaged via volunteer invitations',
      },
    ],
    recommendedTemplates: [
      {
        id: 'event-promotion-assistant',
        name: 'Event Promotion Assistant',
        description: 'Identify the right alumni segments and send targeted nudges to increase RSVPs and attendance.',
      },
      {
        id: 'mentoring-engagement-assistant',
        name: 'Mentoring Engagement Assistant',
        description: 'Monitor mentoring pairs for inactivity, suggest check-ins, and surface pairs needing support.',
      },
      {
        id: 'volunteer-matching-assistant',
        name: 'Volunteer Matching Assistant',
        description: 'Match interested alumni to open volunteer roles and recommend personalized invitations.',
      },
      {
        id: 'alumni-reactivation-assistant',
        name: 'Alumni Reactivation Assistant',
        description: 'Detect lapsed alumni and generate campaigns to bring them back through events, mentoring, or volunteering.',
      },
    ],
    recentActivity: [
      {
        timestamp: '10:30 AM',
        description: 'Event Promotion Assistant identified 45 alumni for upcoming regional event',
      },
      {
        timestamp: '9:15 AM',
        description: 'Mentoring Engagement Assistant flagged 8 inactive mentoring pairs',
      },
      {
        timestamp: 'Yesterday 2:00 PM',
        description: 'Volunteer Matching Assistant matched 12 alumni to new volunteer opportunities',
      },
    ],
    dailyFocusSummary:
      'Drive event participation, keep mentors and volunteers active, and re-engage alumni who are drifting away.',
    gamification: {
      streakDays: 3,
      weeklyGoal: 35,
      weeklyCompleted: 19,
      momentumScore: 77,
    },
    gamePlanTasks: [
      {
        id: 'upcoming-events',
        title: 'Boost attendance for 2 upcoming events next week',
        description:
          'Target segments with low RSVP rates and high affinity (e.g., class years, regions, or interest groups).',
        impactHint:
          'Filling key events builds momentum and generates stories for future outreach.',
        type: 'pipeline',
      },
      {
        id: 'mentoring-matches',
        title: 'Review 10 mentor-mentee pairs needing attention',
        description:
          'Pairs with no activity in the last 30 days or unresolved requests for meetings.',
        impactHint:
          'Keeping mentoring relationships active increases satisfaction and long-term engagement.',
        type: 'meeting',
      },
      {
        id: 'volunteer-opportunities',
        title: 'Invite 20 high-affinity alumni to new volunteer roles',
        description:
          'Alumni who attended recent events or have indicated interest in giving back.',
        impactHint:
          'Personalized invitations convert interest into action and deepen ties to the institution.',
        type: 'email',
      },
      {
        id: 'lapsed-engagement',
        title: 'Reconnect with 15 previously active alumni who have gone quiet',
        description:
          'Alumni who used to attend events or volunteer but have had no recorded engagement in 12+ months.',
        impactHint:
          'Reactivating warm alumni is easier and more cost-effective than acquiring new participants.',
        type: 'retention',
      },
      {
        id: 'post-event-followup',
        title: "Send follow-ups for last week's key event",
        description:
          'Attendees, no-shows, and top-engaged participants each get different suggested messages.',
        impactHint:
          'Timely follow-up strengthens relationships and surfaces mentors, volunteers, and donors.',
        type: 'email',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-lapsed-alumni',
        label: '362 alumni at risk of disengaging',
        detail:
          'Previously active alumni with no events, mentoring, or volunteering activity in the last 12 months.',
        severity: 'high',
      },
      {
        id: 'risk-low-event-rsvp',
        label: '2 flagship events with low RSVP rates',
        detail:
          'Key events are below target registration for the next 2 weeks.',
        severity: 'high',
      },
      {
        id: 'risk-mentoring-dropoff',
        label: '24 mentoring pairs with no activity in 30+ days',
        detail:
          'No recent messages, meetings, or check-ins recorded.',
        severity: 'medium',
      },
      {
        id: 'risk-volunteer-coverage',
        label: 'Shortfall in volunteers for upcoming programs',
        detail:
          "Volunteer needs are not fully covered for next month's initiatives.",
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: 'Mentoring activity increased by 18% this quarter',
        detail:
          'Mentoring Engagement Assistant helped surface inactive pairs and drive targeted nudges.',
        assistantName: 'Mentoring Engagement Assistant',
      },
      {
        label: 'Two regional events exceeded RSVP targets by 22%',
        detail:
          'Event Promotion Assistant optimized outreach segments and message timing.',
        assistantName: 'Event Promotion Assistant',
      },
      {
        label: '47 lapsed alumni re-engaged via volunteer invitations',
        detail:
          'Volunteer Matching Assistant recommended roles aligned with interests and past activity.',
        assistantName: 'Volunteer Matching Assistant',
      },
    ],
    coachMessage:
      "Your focus on events, mentoring, and volunteering is building stronger connections. Today, prioritize those upcoming events—they're your best opportunity to bring alumni back into the fold. Keep the momentum going.",
  },
  advancement: {
    label: 'Advancement',
    description: 'Improve donor retention and identify giving opportunities',
    descriptionBullets: [
      'Maintain donor relationships',
      'Identify giving opportunities',
      'Recover lapsed donors',
    ],
    snapshotMetrics: [
      { label: 'Active donors', value: '5,678' },
      { label: 'LYBUNT recovery', value: '89' },
    ],
    assistants: [
      {
        id: '3',
        name: 'Advancement Assistant',
        goal: 'Improve donor retention and identify giving opportunities',
        status: 'active',
      },
    ],
    recommendedTemplates: [
      {
        id: 'donor-retention',
        name: 'Donor Retention Assistant',
        description: 'Maintain relationships with existing donors',
      },
    ],
    recentActivity: [
      {
        timestamp: '8:00 AM',
        description: 'Advancement Assistant identified 5 LYBUNT recovery opportunities',
      },
    ],
    dailyFocusSummary:
      'Move high-value prospects forward, clear donor replies, and prepare for key meetings.',
    gamification: {
      streakDays: 4,
      weeklyGoal: 8,
      weeklyCompleted: 3,
      momentumScore: 78,
    },
    gamePlanTasks: [
      {
        id: 'emails',
        title: 'Follow up on 3 important donor emails',
        description: 'AI flagged replies older than 48 hours from key donors and partners.',
        impactHint: 'Improves relationship momentum and response time.',
        type: 'email',
      },
      {
        id: 'meetings',
        title: 'Prepare for 2 donor meetings today',
        description: 'AI created prep briefs for Valerie H. and Richard S.',
        impactHint: 'Increases odds of advancing major gift conversations.',
        type: 'meeting',
      },
      {
        id: 'stalled-mg',
        title: 'Advance a $50,000 prospect stalled for 14 days',
        description: 'High-value major gift with recent engagement but no recent contact.',
        impactHint: 'Advancing this can materially impact your quarterly goals.',
        type: 'pipeline',
      },
      {
        id: 'lybunt',
        title: 'Re-engage 3 LYBUNT donors showing renewed intent',
        description: 'Recent newsletter opens and campaign page visits.',
        impactHint: 'Supports retention and LYBUNT recovery goals.',
        type: 'retention',
      },
      {
        id: 'proposals',
        title: 'Finalize 2 proposals due within 7 days',
        description: 'AI flagged deadlines and missing pieces.',
        impactHint: 'Keeps you on track for near-term closes.',
        type: 'proposal',
      },
    ],
    flaggedRisks: [
      {
        id: 'risk-major-donor',
        label: '1 major donor is trending disengaged',
        detail: 'Engagement score has dropped over the last 30 days.',
        severity: 'high',
      },
      {
        id: 'risk-proposal',
        label: '1 key proposal has low decision-maker engagement',
        detail: 'The primary contact has not opened the latest proposal version.',
        severity: 'medium',
      },
    ],
    recentWins: [
      {
        label: '3 LYBUNT donors renewed this week',
        detail: 'Outreach prompted by the LYBUNT Recovery Assistant.',
        assistantName: 'LYBUNT Recovery Assistant',
      },
      {
        label: '$50,000 prospect advanced to solicitation',
        detail: 'Pipeline Assistant prompted timely follow-up.',
        assistantName: 'Major Gift Pipeline Assistant',
      },
      {
        label: '18 new donors completed onboarding',
        detail: 'Nurture Assistant executed the welcome series.',
        assistantName: 'New Donor Nurture Assistant',
      },
    ],
    coachMessage:
      'Your meeting prep today is crucial. Advancing key proposals will help bring you back on pace for your quarterly targets and keep your momentum streak going.',
  },
};

const personas: Persona[] = [
  'admissions',
  'registrar',
  'student-success',
  'career-services',
  'alumni-engagement',
  'advancement',
];

const personaLabels: Record<Persona, string> = {
  admissions: 'Admissions',
  registrar: 'Registrar',
  'student-success': 'Student Success',
  'career-services': 'Career Services',
  'alumni-engagement': 'Alumni Engagement',
  advancement: 'Advancement',
};

export default function AssistantsHomePage() {
  const { user } = useAuth();
  const canManage = canManageAssistants(user?.email || user?.uid);
  const [selectedPersona, setSelectedPersona] = useState<Persona>('admissions');
  const [showWins, setShowWins] = useState(true);
  const [showAssistants, setShowAssistants] = useState(true);

  const persona = personaConfigs[selectedPersona];
  const personaLabel = personaLabels[selectedPersona];
  const isCoachView = persona.gamification !== undefined;

  // Mock user name - in real app, this would come from auth context
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Alex';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Persona Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I'm working as…
        </label>
        <div className="flex flex-wrap gap-2">
          {personas.map((personaId) => {
            const isSelected = selectedPersona === personaId;
            return (
              <button
                key={personaId}
                onClick={() => setSelectedPersona(personaId)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {personaLabels[personaId]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero / Greeting */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {personaLabel && (
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                {personaLabel} Workspace
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {userName}.
            </h2>
            <p className="text-gray-600 mb-3">
              You're viewing the {personaLabel ? `${personaLabel} ` : 'current '}workspace in the AI Command Center.
            </p>
            <div className="space-y-1">
              <p className="text-sm text-gray-700 font-medium">{persona.description}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                {persona.descriptionBullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional rendering: AI Coach layout for personas with gamification, standard layout for others */}
      {isCoachView ? (
        /* 2-Column AI Coach Layout */
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Gamification */}
            {persona.gamification && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-gray-500">Your Momentum</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Streak</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {persona.gamification.streakDays} days
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-medium text-purple-600">
                        {persona.gamification.momentumScore}/100
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Weekly challenge</span>
                        <span className="font-medium text-gray-900">
                          {persona.gamification.weeklyCompleted}/{persona.gamification.weeklyGoal}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{
                            width: `${Math.min(
                              100,
                              ((persona.gamification.weeklyCompleted || 0) /
                                (persona.gamification.weeklyGoal || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Focus Summary */}
            {persona.dailyFocusSummary && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Today's focus: </span>
                  {persona.dailyFocusSummary}
                </p>
              </div>
            )}

            {/* Today's Game Plan */}
            {persona.gamePlanTasks && persona.gamePlanTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Today's Game Plan</h2>
                  <span className="text-xs text-gray-500">
                    0 / {persona.gamePlanTasks.length} completed
                  </span>
                </div>
                <div className="space-y-2">
                  {persona.gamePlanTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
                          ○
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <p className="text-xs text-gray-600">{task.description}</p>
                          )}
                          {task.impactHint && (
                            <p className="text-xs text-gray-500">
                              Impact: {task.impactHint}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline">
                              Open
                            </Button>
                            <Button size="sm" variant="ghost">
                              Let AI suggest next step
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Insight */}
            {persona.coachMessage && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Coach Says</h3>
                <p className="text-sm text-gray-600">{persona.coachMessage}</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Flagged Risks */}
            {persona.flaggedRisks && persona.flaggedRisks.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-900">Flagged Risks</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="space-y-3">
                    {persona.flaggedRisks.map((risk) => (
                      <div key={risk.id} className="flex items-start gap-2 text-xs">
                        <span
                          className={cn(
                            'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                            risk.severity === 'high'
                              ? 'bg-red-500'
                              : risk.severity === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{risk.label}</div>
                          {risk.detail && (
                            <div className="text-gray-600 mt-0.5">{risk.detail}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scoreboard */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900">Your Scoreboard</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="space-y-3 text-xs">
                  {persona.snapshotMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-600">{metric.label}</span>
                      <span className="font-medium text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Wins (Collapsible) */}
            {persona.recentWins && persona.recentWins.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">Recent Wins</h2>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setShowWins((prev) => !prev)}
                  >
                    {showWins ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showWins && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="space-y-3 text-xs">
                      {persona.recentWins.map((win, index) => (
                        <div key={index}>
                          <div className="font-medium text-gray-900">{win.label}</div>
                          {win.detail && (
                            <div className="text-gray-600 mt-0.5">{win.detail}</div>
                          )}
                          {win.assistantName && (
                            <div className="text-gray-500 mt-0.5">
                              Powered by: {win.assistantName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assistants Working for You (Collapsible) */}
            {persona.assistants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">Assistants Working for You</h2>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setShowAssistants((prev) => !prev)}
                  >
                    {showAssistants ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showAssistants && (
                  <div className="space-y-2">
                    {persona.assistants.map((assistant) => (
                      <div
                        key={assistant.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{assistant.name}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{assistant.goal}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
                              assistant.status
                            )}`}
                          >
                            {assistant.status}
                          </span>
                        </div>
                        <Link
                          href={`/ai-assistants/${assistant.id}`}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Layout for Other Personas */
        <>
          {/* Snapshot Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {persona.snapshotMetrics.map((metric, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Wins */}
          {persona.recentWins && persona.recentWins.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Wins</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Highlights of what you and your assistants have accomplished recently.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {persona.recentWins.map((win, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{win.label}</h4>
                    {win.detail && (
                      <p className="text-sm text-gray-600 mb-3">{win.detail}</p>
                    )}
                    {win.assistantName && (
                      <p className="text-xs text-gray-500">
                        Powered by:{' '}
                        <span className="font-medium text-gray-700">{win.assistantName}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persona Assistants */}
          {persona.assistants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your {personaLabel} Assistants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {persona.assistants.map((assistant) => (
                  <div
                    key={assistant.id}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{assistant.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{assistant.goal}</p>
                        {assistant.impact && (
                          <p className="text-xs text-green-700 font-medium">{assistant.impact}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(
                          assistant.status
                        )}`}
                      >
                        {assistant.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Link
                        href={`/ai-assistants/${assistant.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        View
                      </Link>
                      {canManage && (
                        <>
                          <Link
                            href={`/ai-assistants/${assistant.id}`}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          {assistant.status === 'active' && (
                            <button
                              onClick={() => {
                                alert('Pause functionality will be implemented in a future update');
                              }}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              Pause
                            </button>
                          )}
                          {assistant.status === 'paused' && (
                            <button
                              onClick={() => {
                                alert('Resume functionality will be implemented in a future update');
                              }}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              Resume
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recommended Templates */}
      <section aria-labelledby="assistant-templates-heading">
        <div className="mb-4">
          <h3 id="assistant-templates-heading" className="text-lg font-semibold text-gray-900">
            Assistant Templates for {personaLabel}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Start with a ready-made template to quickly create a new AI Assistant for your{' '}
            {personaLabel.toLowerCase()} workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {persona.recommendedTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                Assistant Template
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              {canManage && (
                <Link href={`/ai-assistants/new?template=${template.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Create Assistant
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      {persona.recentActivity.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link
              href="/ai-assistants/logs"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              View Full Activity Log
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" className="h-3 w-3" />
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {persona.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
