import { NextRequest, NextResponse } from 'next/server';
import { StudentAcademicProgramService } from '../../../../lib/banner/services';
import { StudentAcademicProgramSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const studentAcademicProgramService = new StudentAcademicProgramService();

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
      academicProgramId?: string;
      status?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('student')) {
      filters.studentId = searchParams.get('student')!;
    }
    if (searchParams.get('academicProgram')) {
      filters.academicProgramId = searchParams.get('academicProgram')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    const studentPrograms = await studentAcademicProgramService.findAll(filters);
    const validated = studentPrograms.map((sp) => StudentAcademicProgramSchema.parse(sp));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching student academic programs:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

