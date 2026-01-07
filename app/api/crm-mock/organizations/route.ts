import { NextRequest, NextResponse } from 'next/server';





import { crmClient } from '@/lib/crm-unified';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(request: NextRequest) {
  try {
    const organizations = await crmClient.listOrganizations(CRM_MOCK_CTX);
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}



