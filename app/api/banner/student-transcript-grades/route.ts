import { NextRequest, NextResponse } from 'next/server';
import { StudentTranscriptGradeService } from '../../../../lib/banner/services';
import { StudentTranscriptGradeSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const studentTranscriptGradeService = new StudentTranscriptGradeService();

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
      studentId?: string;
      sectionId?: string;
      sectionRegistrationId?: string;
      academicPeriodId?: string;
      academicPeriodCode?: string;
      courseId?: string;
      status?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('student')) {
      filters.studentId = searchParams.get('student')!;
    }
    if (searchParams.get('section')) {
      filters.sectionId = searchParams.get('section')!;
    }
    if (searchParams.get('sectionRegistration')) {
      filters.sectionRegistrationId = searchParams.get('sectionRegistration')!;
    }
    if (searchParams.get('academicPeriod')) {
      filters.academicPeriodId = searchParams.get('academicPeriod')!;
    }
    if (searchParams.get('termCode')) {
      filters.academicPeriodCode = searchParams.get('termCode')!;
    }
    if (searchParams.get('course')) {
      filters.courseId = searchParams.get('course')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    const grades = await studentTranscriptGradeService.findAll(filters);
    const validated = grades.map((g) => StudentTranscriptGradeSchema.parse(g));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching student transcript grades:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

