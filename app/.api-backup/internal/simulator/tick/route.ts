import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../../lib/middleware/cors';

// Note: This API route is redirected to Cloud Functions in production via netlify.toml
// Removed force-dynamic to allow static export build

// Import simulation function
async function simulateWeek() {
  // Dynamic import to avoid issues with Prisma client initialization
  const { simulateWeek: runSimulation } = await import('../../../../../packages/db/prisma/simulate-week');
  return runSimulation();
}

// Handle CORS preflight
export async function OPTIONS() {
  return createCorsPreflightResponse();
}

// Dev-only endpoint to run simulation tick
export async function POST(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request);
  if (authError) {
    return setCorsHeaders(authError);
  }
  // In production, add environment check here
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  // }

  try {
    const result = await simulateWeek();
    const response = NextResponse.json({
      success: true,
      message: 'Weekly simulation tick completed',
      newDate: result.newDate,
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Simulation error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

