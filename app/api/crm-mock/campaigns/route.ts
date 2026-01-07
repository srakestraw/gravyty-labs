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
    const campaignId = searchParams.get('id');
    const fiscalYear = searchParams.get('fiscalYear');

    if (campaignId) {
      // Get single campaign
      const campaign = await prisma.crmCampaign.findFirst({
        where: {
          id: campaignId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          appeals: true,
          gifts: true,
        },
      });

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString().split('T')[0],
        endDate: campaign.endDate?.toISOString().split('T')[0],
        fiscalYear: campaign.fiscalYear,
        goal: campaign.goal?.toNumber(),
        amountRaised: campaign.amountRaised?.toNumber(),
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        sourceSystemRef: campaign.sourceSystemRef,
      });
    }

    // List campaigns
    const where: any = {
      workspace: CRM_MOCK_CTX.workspace,
      app: CRM_MOCK_CTX.app,
    };

    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }

    const campaigns = await prisma.crmCampaign.findMany({
      where,
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(
      campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        startDate: c.startDate.toISOString().split('T')[0],
        endDate: c.endDate?.toISOString().split('T')[0],
        fiscalYear: c.fiscalYear,
        goal: c.goal?.toNumber(),
        amountRaised: c.amountRaised?.toNumber(),
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        sourceSystemRef: c.sourceSystemRef,
      }))
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      startDate,
      endDate,
      fiscalYear,
      goal,
      status,
      sourceSystemRef,
    } = body;

    const campaign = await prisma.crmCampaign.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        fiscalYear,
        goal: goal ? goal : null,
        status: status || 'planning',
        sourceSystemRef,
      },
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate.toISOString().split('T')[0],
      endDate: campaign.endDate?.toISOString().split('T')[0],
      fiscalYear: campaign.fiscalYear,
      goal: campaign.goal?.toNumber(),
      amountRaised: campaign.amountRaised?.toNumber(),
      status: campaign.status,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      sourceSystemRef: campaign.sourceSystemRef,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



