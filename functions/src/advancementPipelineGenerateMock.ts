/**
 * Advancement Pipeline generate-mock handler for Firebase Functions.
 * Returns fallback mock data (no OpenAI). Set OPENAI_API_KEY in Firebase config for AI-generated data.
 */

type ResultType = 'stalled_summary' | 'likely_to_give' | 'priority_list';

interface PriorityProspectRow {
  id: string;
  name: string;
  subtitle?: string;
  priority: 'high' | 'medium' | 'low';
  lastActivity: string;
  stallReasons: string[];
  officer: string;
  activeAgents: string[];
  suggestedAgentIds?: string[];
}

const ADVANCEMENT_AGENT_IDS = ['agent-donor-warmup', 'agent-flow-prospect-reengagement', 'agent-flow-major-gift'];

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

function createFallbackMock(prompt: string, mode?: 'steps' | 'data', resultTypeParam?: ResultType): Record<string, unknown> {
  const resultType = (resultTypeParam || inferResultType(prompt)) as ResultType;
  const aid = ADVANCEMENT_AGENT_IDS[0];
  const base = (id: string, name: string, sub: string, p: 'high' | 'medium' | 'low', reasons: string[]): PriorityProspectRow => ({
    id, name, subtitle: sub, priority: p, lastActivity: '5 days ago', stallReasons: reasons, officer: 'Sarah Mitchell', activeAgents: [], suggestedAgentIds: aid ? [aid] : [],
  });

  const thinkingSteps =
    resultType === 'stalled_summary'
      ? ['Pulling prospects with no movement in 7 days...', 'Checking for: no recent touchpoints...', 'Checking for: open asks with no activity...', 'Checking for: overdue follow-ups...', 'Planning next steps...']
      : resultType === 'likely_to_give'
        ? ['Analyzing giving history and patterns...', 'Identifying prospects with capacity and affinity...', 'Scoring likelihood to give in next 30 days...', 'Ranking prospects by opportunity score...', 'Planning next steps...']
        : ["Building today's outreach list...", 'Checking officer assignments and workload...', 'Prioritizing by urgency and opportunity...', 'Planning next steps...'];

  const resultTitle = inferResultTitle(prompt, resultType);
  const resultDescription = inferResultDescription(prompt, resultType);
  const suggestedNextSteps = getDefaultSuggestedNextSteps(resultType);

  if (mode === 'steps') {
    return { thinkingSteps, resultType, resultTitle, resultDescription, suggestedNextSteps };
  }

  if (mode === 'data') {
    const data =
      resultType === 'stalled_summary'
        ? {
            stalledCount: 24,
            highCount: 6,
            mediumCount: 10,
            lowCount: 8,
            highProspects: ['Margaret Chen', 'Robert Williams', 'Elizabeth Davis', 'David Martinez', 'Patricia Thompson', 'Christopher Lee'].map((n, i) => base(`p${i + 1}`, n, 'Major Donor', 'high', ['No recent touchpoints'])),
            mediumProspects: Array.from({ length: 10 }, (_, i) => base(`pm${i}`, `Prospect ${i + 7}`, 'Alumni', 'medium', ['No recent touchpoints'])),
            lowProspects: Array.from({ length: 8 }, (_, i) => base(`pl${i}`, `Prospect ${i + 17}`, 'Alumni', 'low', [])),
          }
        : resultType === 'likely_to_give'
          ? [
              { id: 'p1', name: 'Margaret Chen', score: 92, lastGiftDate: '6 months ago', givingTier: 'Leadership' },
              { id: 'p2', name: 'Robert Williams', score: 88, lastGiftDate: '8 months ago', givingTier: 'Major' },
              { id: 'p3', name: 'Elizabeth Davis', score: 85, lastGiftDate: '4 months ago', givingTier: 'Annual' },
              { id: 'p4', name: 'David Martinez', score: 83, lastGiftDate: '5 months ago', givingTier: 'Major' },
              { id: 'p5', name: 'Patricia Thompson', score: 80, lastGiftDate: '9 months ago', givingTier: 'Leadership' },
            ]
          : [
              { id: 'p1', name: 'Margaret Chen', subtitle: 'Class of 1998', priority: 'high' as const, lastActivity: '8 days ago', stallReasons: ['No recent touchpoints'], officer: 'Sarah Mitchell', activeAgents: ['Donor Warm-Up Agent'], suggestedAgentIds: aid ? [aid] : [] },
              { id: 'p2', name: 'Robert Williams', subtitle: 'Major Donor', priority: 'high' as const, lastActivity: '7 days ago', stallReasons: ['Overdue follow-up'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
              { id: 'p3', name: 'Thomas Anderson', subtitle: 'Class of 1992', priority: 'medium' as const, lastActivity: '5 days ago', stallReasons: ['No recent touchpoints'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
            ];
    return { data, resultTitle, resultDescription, suggestedNextSteps };
  }

  const fullData =
    resultType === 'stalled_summary'
      ? {
          stalledCount: 24,
          highCount: 6,
          mediumCount: 10,
          lowCount: 8,
          highProspects: ['Margaret Chen', 'Robert Williams', 'Elizabeth Davis', 'David Martinez', 'Patricia Thompson', 'Christopher Lee'].map((n, i) => base(`p${i + 1}`, n, 'Major Donor', 'high', ['No recent touchpoints'])),
          mediumProspects: Array.from({ length: 10 }, (_, i) => base(`pm${i}`, `Prospect ${i + 7}`, 'Alumni', 'medium', ['No recent touchpoints'])),
          lowProspects: Array.from({ length: 8 }, (_, i) => base(`pl${i}`, `Prospect ${i + 17}`, 'Alumni', 'low', [])),
        }
      : resultType === 'likely_to_give'
        ? [
            { id: 'p1', name: 'Margaret Chen', score: 92, lastGiftDate: '6 months ago', givingTier: 'Leadership' },
            { id: 'p2', name: 'Robert Williams', score: 88, lastGiftDate: '8 months ago', givingTier: 'Major' },
            { id: 'p3', name: 'Elizabeth Davis', score: 85, lastGiftDate: '4 months ago', givingTier: 'Annual' },
            { id: 'p4', name: 'David Martinez', score: 83, lastGiftDate: '5 months ago', givingTier: 'Major' },
            { id: 'p5', name: 'Patricia Thompson', score: 80, lastGiftDate: '9 months ago', givingTier: 'Leadership' },
          ]
        : [
            { id: 'p1', name: 'Margaret Chen', subtitle: 'Class of 1998', priority: 'high' as const, lastActivity: '8 days ago', stallReasons: ['No recent touchpoints'], officer: 'Sarah Mitchell', activeAgents: ['Donor Warm-Up Agent'], suggestedAgentIds: aid ? [aid] : [] },
            { id: 'p2', name: 'Robert Williams', subtitle: 'Major Donor', priority: 'high' as const, lastActivity: '7 days ago', stallReasons: ['Overdue follow-up'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
            { id: 'p3', name: 'Thomas Anderson', subtitle: 'Class of 1992', priority: 'medium' as const, lastActivity: '5 days ago', stallReasons: ['No recent touchpoints'], officer: 'James Park', activeAgents: [], suggestedAgentIds: aid ? [aid] : [] },
          ];

  return { thinkingSteps, resultType, resultTitle, resultDescription, suggestedNextSteps, data: fullData };
}

export async function handleAdvancementPipelineGenerateMock(req: any, res: any): Promise<void> {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = await new Promise<any>((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => { data += chunk; });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });

    const { prompt, mode, resultType } = body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'prompt is required and must be a string' });
      return;
    }

    const result = createFallbackMock(prompt, mode, resultType);
    res.status(200).json(result);
  } catch (error) {
    console.error('Advancement pipeline generate-mock error:', error);
    res.status(500).json({ error: 'Failed to generate mock data', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
