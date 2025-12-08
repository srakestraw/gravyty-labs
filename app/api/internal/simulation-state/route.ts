import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

// Note: This API route is redirected to Cloud Functions in production via netlify.toml
// Removed force-dynamic to allow static export build

// Lazy initialization to avoid build-time errors
// Note: API routes are redirected to Cloud Functions in production
let prisma: any = null;
async function getPrisma() {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null;
  }
  if (!prisma) {
    try {
      // Dynamic import to prevent build-time execution
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (e) {
      // Silently fail during build
      return null;
    }
  }
  return prisma;
}

// Handle CORS preflight
export async function OPTIONS() {
  return createCorsPreflightResponse();
}

// Dev-only endpoint to get simulation state
export async function GET(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request);
  if (authError) {
    return setCorsHeaders(authError);
  }
  try {
    const db = await getPrisma();
    if (!db) {
      return setCorsHeaders(
        NextResponse.json({ error: 'Database not available' }, { status: 503 })
      );
    }
    
    const state = await db.simulationState.findFirst();
    
    if (!state) {
    const response = NextResponse.json({
      currentSimDate: null,
      lastTickDate: null,
    });
    return setCorsHeaders(response);
  }

  const response = NextResponse.json({
    currentSimDate: state.currentSimDate.toISOString().split('T')[0],
    lastTickDate: state.lastTickDate?.toISOString().split('T')[0] || null,
  });
  return setCorsHeaders(response);
} catch (error) {
    console.error('Error fetching simulation state:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

