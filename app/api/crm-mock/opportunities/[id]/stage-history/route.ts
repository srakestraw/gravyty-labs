import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id;

    // Verify opportunity exists
    const opportunity = await prisma.crmOpportunity.findFirst({
      where: {
        id: opportunityId,
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const history = await prisma.crmOpportunityStageHistory.findMany({
      where: {
        opportunityId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });

    return NextResponse.json(
      history.map((h: any) => ({
        id: h.id,
        opportunityId: h.opportunityId,
        stage: h.stage,
        status: h.status,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
        notes: h.notes,
      }))
    );
  } catch (error) {
    console.error('Error fetching stage history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stage history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id;
    const body = await request.json();
    const { stage, status, changedBy, notes } = body;

    // Verify opportunity exists and get current stage/status
    const opportunity = await prisma.crmOpportunity.findFirst({
      where: {
        id: opportunityId,
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Create stage history entry
    const historyEntry = await prisma.crmOpportunityStageHistory.create({
      data: {
        opportunityId,
        stage: stage || opportunity.stage,
        status: status || opportunity.status,
        changedBy,
        notes,
      },
    });

    // Update opportunity stage/status if provided
    if (stage || status) {
      await prisma.crmOpportunity.update({
        where: { id: opportunityId },
        data: {
          ...(stage && { stage }),
          ...(status && { status }),
        },
      });
    }

    return NextResponse.json({
      id: historyEntry.id,
      opportunityId: historyEntry.opportunityId,
      stage: historyEntry.stage,
      status: historyEntry.status,
      changedAt: historyEntry.changedAt.toISOString(),
      changedBy: historyEntry.changedBy,
      notes: historyEntry.notes,
    });
  } catch (error) {
    console.error('Error creating stage history:', error);
    return NextResponse.json(
      { error: 'Failed to create stage history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



