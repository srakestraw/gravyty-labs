import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResultType = 'stalled_summary' | 'likely_to_give' | 'priority_list';

interface StalledSummaryData {
  stalledCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  highProspects?: PriorityProspectRow[];
  mediumProspects?: PriorityProspectRow[];
  lowProspects?: PriorityProspectRow[];
}

interface LikelyToGiveProspect {
  id: string;
  name: string;
  score?: number;
  lastGiftDate?: string;
  givingTier?: string;
}

interface PriorityProspectRow {
  id: string;
  name: string;
  subtitle?: string;
  priority: 'high' | 'medium' | 'low';
  lastActivity: string;
  stallReasons: string[];
  officer: string;
  activeAgents: string[];
  suggestedAgents: string[];
}

interface GenerateMockResponse {
  thinkingSteps: string[];
  resultType: ResultType;
  resultTitle: string;
  resultDescription: string;
  suggestedNextSteps?: string[];
  data: StalledSummaryData | LikelyToGiveProspect[] | PriorityProspectRow[];
}

const SYSTEM_PROMPT = `You are generating mock data for a university advancement pipeline AI assistant.
The user has asked a question about prospects, donors, or pipeline activity.
Your job is to:
1. Generate 5-7 "thinking steps" that feel like internal processing. Make them specific to the user's question.
2. Decide the result type: "stalled_summary", "likely_to_give", or "priority_list"
   - stalled_summary: stalled prospects, who needs a nudge, at-risk lapsing.
   - likely_to_give: who might give soon, giving likelihood.
   - priority_list: today's list, event attendees, any list of people/prospects. Use for event attendance, segment lists, outreach lists, etc.
3. Generate resultTitle and resultDescription that DIRECTLY reflect the user's question. Examples:
   - "People who attended Tuesday's event" -> resultTitle: "People who attended Tuesday's event", resultDescription: "5 prospects attended. Consider follow-up outreach."
   - "Who stalled this week?" -> resultTitle: "Prospects who stalled this week", resultDescription: "24 prospects have had no movement in 7 days."
   - "Build my priority list" -> resultTitle: "Your priority list for today", resultDescription: "Balanced for urgency and opportunity."
4. Generate 3-5 suggestedNextSteps as short action bullets, tailored to the question context.
5. Generate realistic mock data matching the result type.

For stalled_summary: return { stalledCount, highCount, mediumCount, lowCount, highProspects, mediumProspects, lowProspects }. Each prospect: { id, name, subtitle, priority, lastActivity, stallReasons, officer, activeAgents, suggestedAgents }.

For likely_to_give: return an array of 5-10 prospects with { id, name, score (70-95), lastGiftDate, givingTier }.

For priority_list: return an array of 6-12 prospects. For event-related questions, use subtitle for event name or "Attended [event]". Use realistic university donor names.

Return ONLY valid JSON:
{
  "thinkingSteps": ["step 1...", ...],
  "resultType": "stalled_summary" | "likely_to_give" | "priority_list",
  "resultTitle": "Short title reflecting the question",
  "resultDescription": "One sentence description",
  "suggestedNextSteps": ["Step 1", "Step 2", ...],
  "data": { ... } or [ ... ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(createFallbackMock(prompt));
    }

    const userPrompt = `User asked: "${prompt}"

Generate mock data for this advancement pipeline question. Return the JSON object only.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(responseContent) as GenerateMockResponse;

    if (!parsed.thinkingSteps || !Array.isArray(parsed.thinkingSteps)) {
      throw new Error('Invalid response: thinkingSteps required');
    }
    if (!parsed.resultType || !['stalled_summary', 'likely_to_give', 'priority_list'].includes(parsed.resultType)) {
      throw new Error('Invalid response: resultType must be stalled_summary, likely_to_give, or priority_list');
    }
    if (!parsed.data) {
      throw new Error('Invalid response: data required');
    }

    parsed.resultTitle = typeof parsed.resultTitle === 'string' ? parsed.resultTitle : inferResultTitle(prompt, parsed.resultType);
    parsed.resultDescription = typeof parsed.resultDescription === 'string' ? parsed.resultDescription : inferResultDescription(prompt, parsed.resultType);
    parsed.suggestedNextSteps = Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : undefined;

    if (parsed.resultType === 'stalled_summary') {
      const d = parsed.data as StalledSummaryData;
      if (typeof d.stalledCount !== 'number' || typeof d.highCount !== 'number') {
        throw new Error('Invalid stalled_summary data');
      }
      const normalizeProspect = (prefix: string) => (p: Partial<PriorityProspectRow>, i: number) => ({
        id: p?.id || `${prefix}-${i + 1}`,
        name: p?.name || 'Unknown',
        subtitle: p?.subtitle,
        priority: (p?.priority as 'high' | 'medium' | 'low') || 'medium',
        lastActivity: p?.lastActivity || '5 days ago',
        stallReasons: Array.isArray(p?.stallReasons) ? p.stallReasons : [],
        officer: p?.officer || 'Sarah Mitchell',
        activeAgents: Array.isArray(p?.activeAgents) ? p.activeAgents : [],
        suggestedAgents: Array.isArray(p?.suggestedAgents) ? p.suggestedAgents : [],
      });
      parsed.data = {
        stalledCount: d.stalledCount,
        highCount: d.highCount,
        mediumCount: d.mediumCount ?? 0,
        lowCount: d.lowCount ?? 0,
        highProspects: (d.highProspects || []).slice(0, d.highCount).map(normalizeProspect('p-high')),
        mediumProspects: (d.mediumProspects || []).slice(0, d.mediumCount ?? 0).map(normalizeProspect('p-med')),
        lowProspects: (d.lowProspects || []).slice(0, d.lowCount ?? 0).map(normalizeProspect('p-low')),
      };
    }

    if (parsed.resultType === 'likely_to_give') {
      const arr = Array.isArray(parsed.data) ? parsed.data : [];
      parsed.data = arr.slice(0, 10).map((p: LikelyToGiveProspect, i: number) => ({
        id: p.id || `p${i + 1}`,
        name: p.name || 'Unknown',
        score: typeof p.score === 'number' ? p.score : 80 + Math.floor(Math.random() * 15),
        lastGiftDate: p.lastGiftDate || '6 months ago',
        givingTier: p.givingTier || 'Annual',
      }));
    }

    if (parsed.resultType === 'priority_list') {
      const arr = Array.isArray(parsed.data) ? parsed.data : [];
      parsed.data = arr.slice(0, 12).map((p: PriorityProspectRow, i: number) => ({
        id: p.id || `p${i + 1}`,
        name: p.name || 'Unknown',
        subtitle: p.subtitle,
        priority: ['high', 'medium', 'low'].includes(p.priority) ? p.priority : 'medium',
        lastActivity: p.lastActivity || '5 days ago',
        stallReasons: Array.isArray(p.stallReasons) ? p.stallReasons : [],
        officer: p.officer || 'Sarah Mitchell',
        activeAgents: Array.isArray(p.activeAgents) ? p.activeAgents : [],
        suggestedAgents: Array.isArray(p.suggestedAgents) ? p.suggestedAgents : [],
      }));
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error generating advancement pipeline mock:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate mock data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function inferResultType(prompt: string): ResultType {
  const p = prompt.toLowerCase();
  if (/likely|give|donat|30\s+days|giving/i.test(p)) return 'likely_to_give';
  if (/priority|today|list|outreach|work\s+on|attend|event|who\s+was/i.test(p)) return 'priority_list';
  return 'stalled_summary';
}

function inferResultTitle(prompt: string, resultType: ResultType): string {
  if (resultType === 'stalled_summary') return 'Prospects who stalled this week';
  if (resultType === 'likely_to_give') return 'Prospects likely to give in 30 days';
  return prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt;
}

function inferResultDescription(prompt: string, resultType: ResultType): string {
  if (resultType === 'stalled_summary') return 'Prospects with no movement in 7 days. Prioritize by urgency.';
  if (resultType === 'likely_to_give') return 'Ranked by opportunity score based on giving history and engagement.';
  return 'Consider follow-up outreach.';
}

function createFallbackMock(prompt: string): GenerateMockResponse {
  const resultType = inferResultType(prompt);
  const thinkingSteps =
    resultType === 'stalled_summary'
      ? [
          'Pulling prospects with no movement in 7 days...',
          'Checking for: no recent touchpoints...',
          'Checking for: open asks with no activity...',
          'Checking for: overdue follow-ups...',
          'Planning next steps...',
        ]
      : resultType === 'likely_to_give'
        ? [
            'Analyzing giving history and patterns...',
            'Identifying prospects with capacity and affinity...',
            'Scoring likelihood to give in next 30 days...',
            'Ranking prospects by opportunity score...',
            'Planning next steps...',
          ]
        : [
            "Building today's outreach list...",
            'Checking officer assignments and workload...',
            'Prioritizing by urgency and opportunity...',
            'Planning next steps...',
          ];

  const resultTitle = inferResultTitle(prompt, resultType);
  const resultDescription = inferResultDescription(prompt, resultType);

  if (resultType === 'stalled_summary') {
    const base = (id: string, name: string, sub: string, p: 'high' | 'medium' | 'low', reasons: string[]): PriorityProspectRow => ({
      id, name, subtitle: sub, priority: p, lastActivity: '5 days ago', stallReasons: reasons, officer: 'Sarah Mitchell', activeAgents: [], suggestedAgents: ['Pipeline Agent'],
    });
    return {
      thinkingSteps,
      resultType,
      resultTitle,
      resultDescription,
      suggestedNextSteps: [
        'Review high-priority prospects first',
        "Build today's outreach list",
        'Identify top reasons prospects are stalling',
        'Trigger follow-up tasks for overdue next steps',
      ],
      data: {
        stalledCount: 24,
        highCount: 6,
        mediumCount: 10,
        lowCount: 8,
        highProspects: ['Margaret Chen', 'Robert Williams', 'Elizabeth Davis', 'David Martinez', 'Patricia Thompson', 'Christopher Lee'].map((n, i) => base(`p${i + 1}`, n, 'Major Donor', 'high', ['No recent touchpoints'])),
        mediumProspects: Array.from({ length: 10 }, (_, i) => base(`pm${i}`, `Prospect ${i + 7}`, 'Alumni', 'medium', ['No recent touchpoints'])),
        lowProspects: Array.from({ length: 8 }, (_, i) => base(`pl${i}`, `Prospect ${i + 17}`, 'Alumni', 'low', [])),
      },
    };
  }
  if (resultType === 'likely_to_give') {
    return {
      thinkingSteps,
      resultType,
      resultTitle,
      resultDescription,
      suggestedNextSteps: [
        'Reach out to top 3 prospects this week',
        'Personalize outreach based on giving history',
        'Schedule calls for high-score prospects',
      ],
      data: [
        { id: 'p1', name: 'Margaret Chen', score: 92, lastGiftDate: '6 months ago', givingTier: 'Leadership' },
        { id: 'p2', name: 'Robert Williams', score: 88, lastGiftDate: '8 months ago', givingTier: 'Major' },
        { id: 'p3', name: 'Elizabeth Davis', score: 85, lastGiftDate: '4 months ago', givingTier: 'Annual' },
        { id: 'p4', name: 'David Martinez', score: 83, lastGiftDate: '5 months ago', givingTier: 'Major' },
        { id: 'p5', name: 'Patricia Thompson', score: 80, lastGiftDate: '9 months ago', givingTier: 'Leadership' },
      ],
    };
  }
  return {
    thinkingSteps,
    resultType,
    resultTitle,
    resultDescription,
    suggestedNextSteps: [
      'Tackle high-priority prospects first',
      'Block time for outreach calls',
      'Create tasks for follow-ups',
    ],
    data: [
      { id: 'p1', name: 'Margaret Chen', subtitle: 'Class of 1998', priority: 'high' as const, lastActivity: '8 days ago', stallReasons: ['No recent touchpoints'], officer: 'Sarah Mitchell', activeAgents: ['Pipeline Agent'], suggestedAgents: ['Follow-up Agent'] },
      { id: 'p2', name: 'Robert Williams', subtitle: 'Major Donor', priority: 'high' as const, lastActivity: '7 days ago', stallReasons: ['Overdue follow-up'], officer: 'James Park', activeAgents: [], suggestedAgents: ['Pipeline Agent'] },
      { id: 'p3', name: 'Thomas Anderson', subtitle: 'Class of 1992', priority: 'medium' as const, lastActivity: '5 days ago', stallReasons: ['No recent touchpoints'], officer: 'James Park', activeAgents: [], suggestedAgents: ['Pipeline Agent'] },
    ],
  };
}
