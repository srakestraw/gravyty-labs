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
    const searchParams = request.nextUrl.searchParams;
    const constituentId = searchParams.get('id');

    if (constituentId) {
      // Get single constituent
      const constituent = await crmClient.getConstituent(CRM_MOCK_CTX, constituentId);
      if (!constituent) {
        return NextResponse.json({ error: 'Constituent not found' }, { status: 404 });
      }
      return NextResponse.json(constituent);
    }

    // List all constituents
    const constituents = await crmClient.listConstituents(CRM_MOCK_CTX);
    return NextResponse.json(constituents);
  } catch (error) {
    console.error('Error fetching constituents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch constituents' },
      { status: 500 }
    );
  }
}



