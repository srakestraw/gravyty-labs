import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

// Note: This API route is redirected to Cloud Functions in production via netlify.toml
// Removed force-dynamic to allow static export build

// Lazy initialization to avoid build-time errors
// Note: API routes are redirected to Cloud Functions in production, so Prisma is only needed at runtime
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

export async function GET(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request);
  if (authError) {
    return setCorsHeaders(authError);
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: {
      studentId?: string;
      academicPeriodId?: string;
      academicPeriodCode?: string;
    } = {};

    if (searchParams.get('student')) {
      filters.studentId = searchParams.get('student')!;
    }
    if (searchParams.get('academicPeriod')) {
      filters.academicPeriodId = searchParams.get('academicPeriod')!;
    }
    const db = await getPrisma();
    if (!db) {
      return setCorsHeaders(
        NextResponse.json({ error: 'Database not available' }, { status: 503 })
      );
    }

    if (searchParams.get('termCode')) {
      const period = await db.academicPeriod.findUnique({
        where: { code: searchParams.get('termCode')! },
      });
      if (period) {
        filters.academicPeriodId = period.id;
      }
    }

    const where: any = {};
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters.academicPeriodId) {
      where.academicPeriodId = filters.academicPeriodId;
    }

    const risks = await db.studentRisk.findMany({
      where,
      include: {
        student: {
          include: {
            person: {
              include: {
                names: true,
              },
            },
          },
        },
        academicPeriod: true,
      },
    });

    // Convert to Banner format
    const bannerRisks = risks.map((risk: typeof risks[0]) => ({
      id: risk.id,
      student: {
        id: risk.studentId,
      },
      academicPeriod: {
        id: risk.academicPeriodId,
        code: risk.academicPeriod.code,
      },
      attendanceRiskScore: risk.attendanceRiskScore,
      academicSupportRiskScore: risk.academicSupportRiskScore,
      overallRiskBucket: risk.overallRiskBucket,
      updatedAt: risk.updatedAt.toISOString(),
    }));

    const response = NextResponse.json(bannerRisks);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching student risks:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

