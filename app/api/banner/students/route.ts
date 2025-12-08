import { NextRequest, NextResponse } from 'next/server';
import { StudentService } from '../../../../lib/banner/services';
import { StudentSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const studentService = new StudentService();

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
      personId?: string;
      studentNumber?: string;
      search?: string;
    } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }
    if (searchParams.get('person')) {
      filters.personId = searchParams.get('person')!;
    }
    if (searchParams.get('studentNumber')) {
      filters.studentNumber = searchParams.get('studentNumber')!;
    }
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    const students = await studentService.findAll(filters);
    const validated = students.map((s) => StudentSchema.parse(s));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching students:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

