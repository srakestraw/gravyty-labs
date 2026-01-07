import { NextRequest, NextResponse } from 'next/server';
import { crmClient } from '@/lib/crm-unified';

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const constituentId = searchParams.get('constituentId');
    const type = searchParams.get('type'); // 'task' for tasks

    const interactions = await crmClient.listInteractions(
      CRM_MOCK_CTX,
      constituentId || undefined
    );

    let filtered = interactions;
    if (type) {
      filtered = interactions.filter((i) => i.type === type);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}



