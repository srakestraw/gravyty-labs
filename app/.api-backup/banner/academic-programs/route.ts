import { NextRequest, NextResponse } from 'next/server';
import { AcademicProgramService } from '../../../../lib/banner/services';
import { AcademicProgramSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const academicProgramService = new AcademicProgramService();

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
      type?: string;
      level?: string;
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
    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')!;
    }
    if (searchParams.get('level')) {
      filters.level = searchParams.get('level')!;
    }

    const programs = await academicProgramService.findAll(filters);
    const validated = programs.map((p) => AcademicProgramSchema.parse(p));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching academic programs:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

