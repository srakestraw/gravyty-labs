import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const opportunityId = searchParams.get('id');
    const constituentId = searchParams.get('constituentId');
    const status = searchParams.get('status'); // 'won' for gifts

    if (opportunityId) {
      // Get single opportunity
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

      // Fetch related data manually
      const fund = opportunity.fundId ? await prisma.crmFund.findUnique({ where: { id: opportunity.fundId } }) : null;
      const campaign = opportunity.campaignId ? await prisma.crmCampaign.findUnique({ where: { id: opportunity.campaignId } }) : null;
      const appeal = opportunity.appealId ? await prisma.crmAppeal.findUnique({ where: { id: opportunity.appealId } }) : null;

      return NextResponse.json({
        id: opportunity.id,
        name: opportunity.name,
        stage: opportunity.stage,
        status: opportunity.status,
        constituentId: opportunity.constituentId,
        organizationId: opportunity.organizationId,
        amount: opportunity.amount?.toNumber(),
        expectedAmount: opportunity.expectedAmount?.toNumber(),
        expectedCloseDate: opportunity.expectedCloseDate?.toISOString().split('T')[0],
        probability: opportunity.probability,
        fundId: opportunity.fundId,
        fundName: fund?.name,
        appealId: opportunity.appealId,
        appealName: appeal?.name,
        campaignId: opportunity.campaignId,
        campaignName: campaign?.name,
        closeDate: opportunity.closeDate?.toISOString().split('T')[0],
        closeReason: opportunity.closeReason,
        notes: opportunity.notes,
        createdAt: opportunity.createdAt.toISOString(),
        updatedAt: opportunity.updatedAt.toISOString(),
      });
    }

    // List opportunities
    const where: any = {
      workspace: CRM_MOCK_CTX.workspace,
      app: CRM_MOCK_CTX.app,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }

    if (status) {
      where.status = status;
    }

    const opportunities = await prisma.crmOpportunity.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch all related data for opportunities
    const fundIds = Array.from(new Set(opportunities.map(o => o.fundId).filter((id): id is string => !!id)));
    const campaignIds = Array.from(new Set(opportunities.map(o => o.campaignId).filter((id): id is string => !!id)));
    const appealIds = Array.from(new Set(opportunities.map(o => o.appealId).filter((id): id is string => !!id)));
    
    const [funds, campaigns, appeals] = await Promise.all([
      fundIds.length > 0 ? prisma.crmFund.findMany({ where: { id: { in: fundIds } } }) : Promise.resolve([]),
      campaignIds.length > 0 ? prisma.crmCampaign.findMany({ where: { id: { in: campaignIds } } }) : Promise.resolve([]),
      appealIds.length > 0 ? prisma.crmAppeal.findMany({ where: { id: { in: appealIds } } }) : Promise.resolve([]),
    ]);
    
    const fundMap = new Map(funds.map(f => [f.id, f]));
    const campaignMap = new Map(campaigns.map(c => [c.id, c]));
    const appealMap = new Map(appeals.map(a => [a.id, a]));

    return NextResponse.json(
      opportunities.map((o: any) => ({
        id: o.id,
        name: o.name,
        stage: o.stage,
        status: o.status,
        constituentId: o.constituentId,
        organizationId: o.organizationId,
        amount: o.amount?.toNumber(),
        expectedAmount: o.expectedAmount?.toNumber(),
        expectedCloseDate: o.expectedCloseDate?.toISOString().split('T')[0],
        probability: o.probability,
        fundId: o.fundId,
        fundName: o.fundId ? fundMap.get(o.fundId)?.name : undefined,
        appealId: o.appealId,
        appealName: o.appealId ? appealMap.get(o.appealId)?.name : undefined,
        campaignId: o.campaignId,
        campaignName: o.campaignId ? campaignMap.get(o.campaignId)?.name : undefined,
        closeDate: o.closeDate?.toISOString().split('T')[0],
        closeReason: o.closeReason,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



