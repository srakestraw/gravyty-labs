import { NextRequest, NextResponse } from 'next/server';
import { SectionRegistrationService } from '../../../../lib/banner/services';
import { SectionRegistrationSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const sectionRegistrationService = new SectionRegistrationService();

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
      academicPeriodId?: string;
      academicPeriodCode?: string;
      statusCode?: string;
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
    if (searchParams.get('academicPeriod')) {
      filters.academicPeriodId = searchParams.get('academicPeriod')!;
    }
    if (searchParams.get('termCode')) {
      filters.academicPeriodCode = searchParams.get('termCode')!;
    }
    if (searchParams.get('status')) {
      filters.statusCode = searchParams.get('status')!;
    }

    const registrations = await sectionRegistrationService.findAll(filters);
    const validated = registrations.map((r) => SectionRegistrationSchema.parse(r));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching section registrations:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

