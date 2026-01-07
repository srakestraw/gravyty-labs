import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appealId = searchParams.get('id');
    const campaignId = searchParams.get('campaignId');
    const fiscalYear = searchParams.get('fiscalYear');

    if (appealId) {
      // Get single appeal
      const appeal = await prisma.crmAppeal.findFirst({
        where: {
          id: appealId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          campaign: true,
          fund: true,
        },
      });

      if (!appeal) {
        return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: appeal.id,
        name: appeal.name,
        description: appeal.description,
        campaignId: appeal.campaignId,
        campaignName: appeal.campaign?.name,
        fundId: appeal.fundId,
        fundName: appeal.fund?.name,
        startDate: appeal.startDate.toISOString().split('T')[0],
        endDate: appeal.endDate?.toISOString().split('T')[0],
        fiscalYear: appeal.fiscalYear,
        goal: appeal.goal?.toNumber(),
        amountRaised: appeal.amountRaised?.toNumber(),
        status: appeal.status,
        createdAt: appeal.createdAt.toISOString(),
        updatedAt: appeal.updatedAt.toISOString(),
      });
    }

    // List appeals
    const where: any = {
      workspace: CRM_MOCK_CTX.workspace,
      app: CRM_MOCK_CTX.app,
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }
    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }

    const appeals = await prisma.crmAppeal.findMany({
      where,
      include: {
        campaign: true,
        fund: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(
      appeals.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        campaignId: a.campaignId,
        campaignName: a.campaign?.name,
        fundId: a.fundId,
        fundName: a.fund?.name,
        startDate: a.startDate.toISOString().split('T')[0],
        endDate: a.endDate?.toISOString().split('T')[0],
        fiscalYear: a.fiscalYear,
        goal: a.goal?.toNumber(),
        amountRaised: a.amountRaised?.toNumber(),
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching appeals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appeals' },
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
      campaignId,
      fundId,
      startDate,
      endDate,
      fiscalYear,
      goal,
      status,
    } = body;

    const appeal = await prisma.crmAppeal.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name,
        description,
        campaignId,
        fundId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        fiscalYear,
        goal: goal ? goal : null,
        status: status || 'planning',
      },
    });

    return NextResponse.json({
      id: appeal.id,
      name: appeal.name,
      description: appeal.description,
      campaignId: appeal.campaignId,
      fundId: appeal.fundId,
      startDate: appeal.startDate.toISOString().split('T')[0],
      endDate: appeal.endDate?.toISOString().split('T')[0],
      fiscalYear: appeal.fiscalYear,
      goal: appeal.goal?.toNumber(),
      amountRaised: appeal.amountRaised?.toNumber(),
      status: appeal.status,
      createdAt: appeal.createdAt.toISOString(),
      updatedAt: appeal.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json(
      { error: 'Failed to create appeal' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



