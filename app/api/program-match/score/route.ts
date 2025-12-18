import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';
import { checkScoringRateLimit } from '@/lib/program-match/rate-limiting';

/**
 * POST /api/program-match/score
 * 
 * Score quiz responses and return program matches
 * 
 * Body:
 * - lead_id (required)
 * - responses (required) - full response set
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, responses } = body;

    if (!lead_id || !responses) {
      return NextResponse.json(
        { error: 'lead_id and responses are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkScoringRateLimit(lead_id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const outcome = await dataClient.scoreProgramMatch(
      { workspace: 'admissions', app: 'admissions' },
      lead_id,
      responses
    );

    return NextResponse.json(outcome);
  } catch (error) {
    console.error('Error scoring Program Match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

