import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAdvancementAgentOptions } from '@/lib/ai-assistant/providers/advancementAgentOptions';

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
  /** Agent IDs from availableAgentOptions only. Never use human names. */
  suggestedAgentIds?: string[];
}

interface GenerateMockResponse {
  thinkingSteps: string[];
  resultType: ResultType;
  resultTitle: string;
  resultDescription: string;
  suggestedNextSteps?: string[];
  data: StalledSummaryData | LikelyToGiveProspect[] | PriorityProspectRow[];
}

function buildStepsSystemPrompt(): string {
  return `You are a university advancement pipeline AI assistant. The user asked a question about prospects, donors, or pipeline activity.

Return ONLY this JSON (no other text):
{
  "thinkingSteps": ["step 1...", "step 2...", ...],
  "resultType": "stalled_summary" | "likely_to_give" | "priority_list",
  "resultTitle": "Short title reflecting the question",
  "resultDescription": "One sentence description",
  "suggestedNextSteps": ["Step 1", "Step 2", ...]
}

Rules:
- thinkingSteps: 5-7 steps that feel like internal processing. Be specific to the user's question.
- resultType: stalled_summary (stalled/at-risk), likely_to_give (giving likelihood), priority_list (lists, events, outreach).
- resultTitle/resultDescription: directly reflect the question.
- suggestedNextSteps: 3-5 short action bullets.`;
}

function buildDataSystemPrompt(
  resultType: ResultType,
  availableAgentOptions: { id: string; name: string; type: string }[]
): string {
  const agentListJson = JSON.stringify(availableAgentOptions);
  return `You are generating mock data for a university advancement pipeline. The user asked a question. Generate data for result type: ${resultType}.

AVAILABLE AGENT OPTIONS (use ONLY these ids for suggestedAgentIds):
${agentListJson}

Return ONLY valid JSON with a "data" field.

For stalled_summary: { "data": { stalledCount, highCount, mediumCount, lowCount, highProspects, mediumProspects, lowProspects } }. CRITICAL: highProspects length = highCount, mediumProspects = mediumCount, lowProspects = lowCount. stalledCount = sum. Each prospect: { id, name, subtitle, priority, lastActivity, stallReasons, officer, activeAgents, suggestedAgentIds }. Use realistic university donor names. suggestedAgentIds: ONLY ids from the list above.

For likely_to_give: { "data": [ { id, name, score (70-95), lastGiftDate, givingTier }, ... ] }. 5-10 prospects.

For priority_list: { "data": [ { id, name, subtitle, priority, lastActivity, stallReasons, officer, activeAgents, suggestedAgentIds }, ... ] }. 6-12 prospects. Use subtitle for event name when relevant.`;
}

function buildSystemPrompt(availableAgentOptions: { id: string; name: string; type: string }[]): string {
  const agentListJson = JSON.stringify(availableAgentOptions);
  return `You are generating mock data for a university advancement pipeline AI assistant.
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

AVAILABLE AGENT OPTIONS (use ONLY these ids for suggestedAgentIds - NEVER use human names as agents):
${agentListJson}

For stalled_summary: return { stalledCount, highCount, mediumCount, lowCount, highProspects, mediumProspects, lowProspects }. CRITICAL: highProspects MUST contain exactly highCount items; mediumProspects exactly mediumCount; lowProspects exactly lowCount. stalledCount = highCount + mediumCount + lowCount. Generate ALL prospects—do not truncate. Each prospect: { id, name, subtitle, priority, lastActivity, stallReasons, officer, activeAgents, suggestedAgentIds }. Use realistic university donor names for prospect names. For suggestedAgentIds: use ONLY ids from the availableAgentOptions list above (e.g. "agent-donor-warmup", "agent-flow-prospect-reengagement"). If none fit, use empty array []. NEVER put human/officer names in suggestedAgentIds.

For likely_to_give: return an array of 5-10 prospects with { id, name, score (70-95), lastGiftDate, givingTier }.

For priority_list: return an array of 6-12 prospects. Each prospect: { id, name, subtitle, priority, lastActivity, stallReasons, officer, activeAgents, suggestedAgentIds }. For event-related questions, use subtitle for event name or "Attended [event]". Use realistic university donor names. For suggestedAgentIds: use ONLY ids from availableAgentOptions. If none fit, use [].

Return ONLY valid JSON:
{
  "thinkingSteps": ["step 1...", ...],
  "resultType": "stalled_summary" | "likely_to_give" | "priority_list",
  "resultTitle": "Short title reflecting the question",
  "resultDescription": "One sentence description",
  "suggestedNextSteps": ["Step 1", "Step 2", ...],
  "data": { ... } or [ ... ]
}`;
}

type ApiMode = 'steps' | 'data' | undefined;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, mode, resultType: resultTypeParam } = body as {
      prompt?: string;
      mode?: ApiMode;
      resultType?: ResultType;
    };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(createFallbackMock(prompt, mode, resultTypeParam));
    }

    const availableAgentOptions = getAdvancementAgentOptions();
    const validAgentIds = new Set(availableAgentOptions.map((o) => o.id));

    if (mode === 'steps') {
      const userPrompt = `User asked: "${prompt}"\n\nReturn the JSON object only.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildStepsSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });
      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) throw new Error('No response from OpenAI');
      const parsed = JSON.parse(responseContent) as {
        thinkingSteps?: string[];
        resultType?: string;
        resultTitle?: string;
        resultDescription?: string;
        suggestedNextSteps?: string[];
      };
      if (!parsed.thinkingSteps || !Array.isArray(parsed.thinkingSteps)) {
        throw new Error('Invalid response: thinkingSteps required');
      }
      const rt = parsed.resultType as ResultType;
      if (!rt || !['stalled_summary', 'likely_to_give', 'priority_list'].includes(rt)) {
        throw new Error('Invalid response: resultType required');
      }
      return NextResponse.json({
        thinkingSteps: parsed.thinkingSteps,
        resultType: rt,
        resultTitle: typeof parsed.resultTitle === 'string' ? parsed.resultTitle : inferResultTitle(prompt, rt),
        resultDescription: typeof parsed.resultDescription === 'string' ? parsed.resultDescription : inferResultDescription(prompt, rt),
        suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : undefined,
      });
    }

    if (mode === 'data' && resultTypeParam) {
      const rt = resultTypeParam as ResultType;
      if (!['stalled_summary', 'likely_to_give', 'priority_list'].includes(rt)) {
        return NextResponse.json({ error: 'Invalid resultType' }, { status: 400 });
      }
      const userPrompt = `User asked: "${prompt}"\n\nGenerate mock data for result type: ${rt}. Return the JSON object only.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildDataSystemPrompt(rt, availableAgentOptions) },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });
      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) throw new Error('No response from OpenAI');
      const parsed = JSON.parse(responseContent) as { data?: unknown };
      if (!parsed.data) throw new Error('Invalid response: data required');
      const data = parsed.data;
      const resultTitle = inferResultTitle(prompt, rt);
      const resultDescription = inferResultDescription(prompt, rt);
      const suggestedNextSteps = getDefaultSuggestedNextSteps(rt);
      const validated = validateAndNormalizeData(data, rt, validAgentIds);
      return NextResponse.json({
        data: validated,
        resultTitle,
        resultDescription,
        suggestedNextSteps,
      });
    }

    // Full mode (backward compat)
    const userPrompt = `User asked: "${prompt}"

Generate mock data for this advancement pipeline question. Return the JSON object only.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(availableAgentOptions) },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
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
      const highCount = Math.max(0, d.highCount);
      const mediumCount = Math.max(0, d.mediumCount ?? 0);
      const lowCount = Math.max(0, d.lowCount ?? 0);
      const normalizeProspect = (prefix: string, priority: 'high' | 'medium' | 'low') => (p: Partial<PriorityProspectRow>, i: number) => {
        const rawIds = Array.isArray(p?.suggestedAgentIds) ? p.suggestedAgentIds : [];
        const validatedIds = rawIds.filter((id) => validAgentIds.has(id));
        return {
          id: p?.id || `${prefix}-${i + 1}`,
          name: p?.name || 'Unknown',
          subtitle: p?.subtitle,
          priority: (p?.priority as 'high' | 'medium' | 'low') || priority,
          lastActivity: p?.lastActivity || '5 days ago',
          stallReasons: Array.isArray(p?.stallReasons) ? p.stallReasons : [],
          officer: p?.officer || 'Sarah Mitchell',
          activeAgents: Array.isArray(p?.activeAgents) ? p.activeAgents : [],
          suggestedAgentIds: validatedIds,
        };
      };
      const padProspect = (prefix: string, priority: 'high' | 'medium' | 'low', startIndex: number) =>
        normalizeProspect(prefix, priority)({ name: `Prospect ${startIndex + 1}` }, startIndex);

      let highProspects = (d.highProspects || []).slice(0, highCount).map(normalizeProspect('p-high', 'high'));
      let mediumProspects = (d.mediumProspects || []).slice(0, mediumCount).map(normalizeProspect('p-med', 'medium'));
      let lowProspects = (d.lowProspects || []).slice(0, lowCount).map(normalizeProspect('p-low', 'low'));

      // Pad when AI returns fewer prospects than counts (common with LLMs)
      while (highProspects.length < highCount) {
        highProspects.push(padProspect('p-high', 'high', highProspects.length));
      }
      while (mediumProspects.length < mediumCount) {
        mediumProspects.push(padProspect('p-med', 'medium', mediumProspects.length));
      }
      while (lowProspects.length < lowCount) {
        lowProspects.push(padProspect('p-low', 'low', lowProspects.length));
      }

      parsed.data = {
        stalledCount: highCount + mediumCount + lowCount,
        highCount,
        mediumCount,
        lowCount,
        highProspects,
        mediumProspects,
        lowProspects,
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
      parsed.data = arr.slice(0, 12).map((p: PriorityProspectRow, i: number) => {
        const rawIds = Array.isArray(p.suggestedAgentIds) ? p.suggestedAgentIds : [];
        const validatedIds = rawIds.filter((id) => validAgentIds.has(id));
        return {
          id: p.id || `p${i + 1}`,
          name: p.name || 'Unknown',
          subtitle: p.subtitle,
          priority: ['high', 'medium', 'low'].includes(p.priority) ? p.priority : 'medium',
          lastActivity: p.lastActivity || '5 days ago',
          stallReasons: Array.isArray(p.stallReasons) ? p.stallReasons : [],
          officer: p.officer || 'Sarah Mitchell',
          activeAgents: Array.isArray(p.activeAgents) ? p.activeAgents : [],
          suggestedAgentIds: validatedIds,
        };
      });
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

function getDefaultSuggestedNextSteps(resultType: ResultType): string[] {
  if (resultType === 'stalled_summary') {
    return ['Review high-priority prospects first', "Build today's outreach list", 'Identify top reasons prospects are stalling', 'Trigger follow-up tasks for overdue next steps'];
  }
  if (resultType === 'likely_to_give') {
    return ['Reach out to top 3 prospects this week', 'Personalize outreach based on giving history', 'Schedule calls for high-score prospects'];
  }
  return ['Tackle high-priority prospects first', 'Block time for outreach calls', 'Create tasks for follow-ups'];
}

function validateAndNormalizeData(
  data: unknown,
  resultType: ResultType,
  validAgentIds: Set<string>
): StalledSummaryData | LikelyToGiveProspect[] | PriorityProspectRow[] {
  if (resultType === 'stalled_summary') {
    const d = data as StalledSummaryData;
    if (typeof d?.stalledCount !== 'number' || typeof d?.highCount !== 'number') {
      throw new Error('Invalid stalled_summary data');
    }
    const highCount = Math.max(0, d.highCount);
    const mediumCount = Math.max(0, d.mediumCount ?? 0);
    const lowCount = Math.max(0, d.lowCount ?? 0);
    const normalizeProspect = (prefix: string, priority: 'high' | 'medium' | 'low') => (p: Partial<PriorityProspectRow>, i: number) => {
      const rawIds = Array.isArray(p?.suggestedAgentIds) ? p.suggestedAgentIds : [];
      const validatedIds = rawIds.filter((id) => validAgentIds.has(id));
      return {
        id: p?.id || `${prefix}-${i + 1}`,
        name: p?.name || 'Unknown',
        subtitle: p?.subtitle,
        priority: (p?.priority as 'high' | 'medium' | 'low') || priority,
        lastActivity: p?.lastActivity || '5 days ago',
        stallReasons: Array.isArray(p?.stallReasons) ? p.stallReasons : [],
        officer: p?.officer || 'Sarah Mitchell',
        activeAgents: Array.isArray(p?.activeAgents) ? p.activeAgents : [],
        suggestedAgentIds: validatedIds,
      };
    };
    const padProspect = (prefix: string, priority: 'high' | 'medium' | 'low', startIndex: number) =>
      normalizeProspect(prefix, priority)({ name: `Prospect ${startIndex + 1}` }, startIndex);
    let highProspects = (d.highProspects || []).slice(0, highCount).map(normalizeProspect('p-high', 'high'));
    let mediumProspects = (d.mediumProspects || []).slice(0, mediumCount).map(normalizeProspect('p-med', 'medium'));
    let lowProspects = (d.lowProspects || []).slice(0, lowCount).map(normalizeProspect('p-low', 'low'));
    while (highProspects.length < highCount) highProspects.push(padProspect('p-high', 'high', highProspects.length));
    while (mediumProspects.length < mediumCount) mediumProspects.push(padProspect('p-med', 'medium', mediumProspects.length));
    while (lowProspects.length < lowCount) lowProspects.push(padProspect('p-low', 'low', lowProspects.length));
    return { stalledCount: highCount + mediumCount + lowCount, highCount, mediumCount, lowCount, highProspects, mediumProspects, lowProspects };
  }
  if (resultType === 'likely_to_give') {
    const arr = Array.isArray(data) ? data : [];
    return arr.slice(0, 10).map((p: LikelyToGiveProspect, i: number) => ({
      id: p?.id || `p${i + 1}`,
      name: p?.name || 'Unknown',
      score: typeof p?.score === 'number' ? p.score : 80 + Math.floor(Math.random() * 15),
      lastGiftDate: p?.lastGiftDate || '6 months ago',
      givingTier: p?.givingTier || 'Annual',
    }));
  }
  const arr = Array.isArray(data) ? data : [];
  return arr.slice(0, 12).map((p: PriorityProspectRow, i: number) => {
    const rawIds = Array.isArray(p?.suggestedAgentIds) ? p.suggestedAgentIds : [];
    const validatedIds = rawIds.filter((id) => validAgentIds.has(id));
    return {
      id: p?.id || `p${i + 1}`,
      name: p?.name || 'Unknown',
      subtitle: p?.subtitle,
      priority: ['high', 'medium', 'low'].includes(p?.priority) ? p.priority : 'medium',
      lastActivity: p?.lastActivity || '5 days ago',
      stallReasons: Array.isArray(p?.stallReasons) ? p.stallReasons : [],
      officer: p?.officer || 'Sarah Mitchell',
      activeAgents: Array.isArray(p?.activeAgents) ? p.activeAgents : [],
      suggestedAgentIds: validatedIds,
    };
  });
}

function createFallbackData(resultType: ResultType): StalledSummaryData | LikelyToGiveProspect[] | PriorityProspectRow[] {
  const agentOptions = getAdvancementAgentOptions();
  const defaultAgentId = agentOptions[0]?.id;
  const base = (id: string, name: string, sub: string, p: 'high' | 'medium' | 'low', reasons: string[]): PriorityProspectRow => ({
    id, name, subtitle: sub, priority: p, lastActivity: '5 days ago', stallReasons: reasons, officer: 'Sarah Mitchell', activeAgents: [], suggestedAgentIds: defaultAgentId ? [defaultAgentId] : [],
  });
  if (resultType === 'stalled_summary') {
    return {
      stalledCount: 24,
      highCount: 6,
      mediumCount: 10,
      lowCount: 8,
      highProspects: ['Margaret Chen', 'Robert Williams', 'Elizabeth Davis', 'David Martinez', 'Patricia Thompson', 'Christopher Lee'].map((n, i) => base(`p${i + 1}`, n, 'Major Donor', 'high', ['No recent touchpoints'])),
      mediumProspects: Array.from({ length: 10 }, (_, i) => base(`pm${i}`, `Prospect ${i + 7}`, 'Alumni', 'medium', ['No recent touchpoints'])),
      lowProspects: Array.from({ length: 8 }, (_, i) => base(`pl${i}`, `Prospect ${i + 17}`, 'Alumni', 'low', [])),
    };
  }
  if (resultType === 'likely_to_give') {
    return [
      { id: 'p1', name: 'Margaret Chen', score: 92, lastGiftDate: '6 months ago', givingTier: 'Leadership' },
      { id: 'p2', name: 'Robert Williams', score: 88, lastGiftDate: '8 months ago', givingTier: 'Major' },
      { id: 'p3', name: 'Elizabeth Davis', score: 85, lastGiftDate: '4 months ago', givingTier: 'Annual' },
      { id: 'p4', name: 'David Martinez', score: 83, lastGiftDate: '5 months ago', givingTier: 'Major' },
      { id: 'p5', name: 'Patricia Thompson', score: 80, lastGiftDate: '9 months ago', givingTier: 'Leadership' },
    ];
  }
  const aid = agentOptions[0]?.id;
  return [
    { id: 'p1', name: 'Margaret Chen', subtitle: 'Class of 1998', priority: 'high' as const, lastActivity: '8 days ago', stallReasons: ['No recent touchpoints'], officer: 'Sarah Mitchell', activeAgents: ['Donor Warm-Up Agent'], suggestedAgentIds: aid ? [aid] : [] },
    { id: 'p2', name: 'Robert Williams', subtitle: 'Major Donor', priority: 'high' as const, lastActivity: '7 days ago', stallReasons: ['Overdue follow-up'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
    { id: 'p3', name: 'Thomas Anderson', subtitle: 'Class of 1992', priority: 'medium' as const, lastActivity: '5 days ago', stallReasons: ['No recent touchpoints'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
  ];
}

function createFallbackMock(
  prompt: string,
  mode?: ApiMode,
  resultTypeParam?: ResultType
): GenerateMockResponse | Record<string, unknown> {
  const resultType = (resultTypeParam || inferResultType(prompt)) as ResultType;
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

  if (mode === 'steps') {
    return {
      thinkingSteps,
      resultType,
      resultTitle,
      resultDescription,
      suggestedNextSteps: getDefaultSuggestedNextSteps(resultType),
    };
  }

  if (mode === 'data') {
    const data = createFallbackData(resultType);
    return {
      data,
      resultTitle,
      resultDescription,
      suggestedNextSteps: getDefaultSuggestedNextSteps(resultType),
    };
  }

  if (resultType === 'stalled_summary') {
    const agentOptions = getAdvancementAgentOptions();
    const defaultAgentId = agentOptions[0]?.id; // Use first Advancement agent if available
    const base = (id: string, name: string, sub: string, p: 'high' | 'medium' | 'low', reasons: string[]): PriorityProspectRow => ({
      id, name, subtitle: sub, priority: p, lastActivity: '5 days ago', stallReasons: reasons, officer: 'Sarah Mitchell', activeAgents: [], suggestedAgentIds: defaultAgentId ? [defaultAgentId] : [],
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
    data: (() => {
      const opts = getAdvancementAgentOptions();
      const aid = opts[0]?.id;
      return [
        { id: 'p1', name: 'Margaret Chen', subtitle: 'Class of 1998', priority: 'high' as const, lastActivity: '8 days ago', stallReasons: ['No recent touchpoints'], officer: 'Sarah Mitchell', activeAgents: ['Donor Warm-Up Agent'], suggestedAgentIds: aid ? [aid] : [] },
        { id: 'p2', name: 'Robert Williams', subtitle: 'Major Donor', priority: 'high' as const, lastActivity: '7 days ago', stallReasons: ['Overdue follow-up'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
        { id: 'p3', name: 'Thomas Anderson', subtitle: 'Class of 1992', priority: 'medium' as const, lastActivity: '5 days ago', stallReasons: ['No recent touchpoints'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
      ];
    })(),
  };
}
