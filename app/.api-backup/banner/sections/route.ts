import { NextRequest, NextResponse } from 'next/server';
import { SectionService } from '../../../../lib/banner/services';
import { SectionSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const sectionService = new SectionService();

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
      courseId?: string;
      academicPeriodId?: string;
      academicPeriodCode?: string;
      crn?: string;
      status?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('course')) {
      filters.courseId = searchParams.get('course')!;
    }
    if (searchParams.get('academicPeriod')) {
      filters.academicPeriodId = searchParams.get('academicPeriod')!;
    }
    if (searchParams.get('termCode')) {
      filters.academicPeriodCode = searchParams.get('termCode')!;
    }
    if (searchParams.get('crn')) {
      filters.crn = searchParams.get('crn')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    const sections = await sectionService.findAll(filters);
    const validated = sections.map((s) => SectionSchema.parse(s));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching sections:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

