import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';

/**
 * GET /api/program-match/resume
 * 
 * Resume quiz session from token
 * 
 * Query params:
 * - leadId: Lead ID
 * - token: Resume token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const token = searchParams.get('token');

    if (!leadId || !token) {
      return NextResponse.json(
        { error: 'leadId and token are required' },
        { status: 400 }
      );
    }

    const resumeData = await dataClient.getProgramMatchResume(
      { workspace: 'admissions', app: 'admissions' },
      leadId,
      token
    );

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Invalid or expired resume token' },
        { status: 404 }
      );
    }

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('Error resuming Program Match session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

