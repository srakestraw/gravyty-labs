import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '../../../../lib/banner/services';
import { CourseSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const courseService = new CourseService();

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
      subjectCode?: string;
      number?: string;
      status?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('subject')) {
      filters.subjectCode = searchParams.get('subject')!;
    }
    if (searchParams.get('number')) {
      filters.number = searchParams.get('number')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    const courses = await courseService.findAll(filters);
    const validated = courses.map((c) => CourseSchema.parse(c));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching courses:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response = NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

