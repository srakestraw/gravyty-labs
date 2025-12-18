import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';
import { checkProgressSaveRateLimit } from '@/lib/program-match/rate-limiting';

/**
 * POST /api/program-match/progress
 * 
 * Save quiz progress
 * 
 * Body:
 * - lead_id (required)
 * - responses_partial (required)
 * - current_step (required)
 * - current_question_index (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, responses_partial, current_step, current_question_index } = body;

    if (!lead_id || !responses_partial || !current_step) {
      return NextResponse.json(
        { error: 'lead_id, responses_partial, and current_step are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkProgressSaveRateLimit(lead_id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const progress = await dataClient.saveProgramMatchProgress(
      { workspace: 'admissions', app: 'admissions' },
      lead_id,
      {
        responses_partial,
        current_step,
        current_question_index,
      }
    );

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error saving Program Match progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

