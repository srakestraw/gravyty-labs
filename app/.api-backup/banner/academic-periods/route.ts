import { NextRequest, NextResponse } from 'next/server';
import { AcademicPeriodService } from '../../../../lib/banner/services';
import { AcademicPeriodSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const academicPeriodService = new AcademicPeriodService();

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
      id?: string;
      code?: string;
      status?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('code')) {
      filters.code = searchParams.get('code')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    const periods = await academicPeriodService.findAll(filters);
    const validated = periods.map((p) => AcademicPeriodSchema.parse(p));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching academic periods:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response = NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

