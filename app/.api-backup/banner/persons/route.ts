import { NextRequest, NextResponse } from 'next/server';
import { PersonService } from '../../../../lib/banner/services';
import { PersonSchema } from '../../../../packages/contracts/src';
import { checkAuth } from '../../../../lib/middleware/auth';
import { setCorsHeaders, createCorsPreflightResponse } from '../../../../lib/middleware/cors';

const personService = new PersonService();

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
    const filters: { id?: string } = {};

    if (searchParams.get('id')) {
      filters.id = searchParams.get('id')!;
    }

    const persons = await personService.findAll(filters);
    const validated = persons.map((p) => PersonSchema.parse(p));

    const response = NextResponse.json(validated);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching persons:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

