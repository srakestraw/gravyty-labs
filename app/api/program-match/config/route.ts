import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';

/**
 * GET /api/program-match/config
 * 
 * Fetch Program Match configuration for embed/preview
 * 
 * Query params:
 * - institutionId: Institution ID
 * - quizId: Quiz ID
 * - version: Optional version ID (defaults to latest published)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const institutionId = searchParams.get('institutionId');
    const quizId = searchParams.get('quizId');
    const version = searchParams.get('version') || undefined;

    if (!institutionId || !quizId) {
      return NextResponse.json(
        { error: 'institutionId and quizId are required' },
        { status: 400 }
      );
    }

    const config = await dataClient.getProgramMatchConfig(
      { workspace: institutionId, app: 'admissions' },
      quizId,
      version
    );

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching Program Match config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

