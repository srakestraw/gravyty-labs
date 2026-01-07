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
    const pledgeId = searchParams.get('id');
    const constituentId = searchParams.get('constituentId');
    const status = searchParams.get('status');

    if (pledgeId) {
      // Get single pledge
      const pledge = await prisma.crmPledge.findFirst({
        where: {
          id: pledgeId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          installments: {
            orderBy: {
              dueDate: 'asc',
            },
          },
        },
      });

      if (!pledge) {
        return NextResponse.json({ error: 'Pledge not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: pledge.id,
        constituentId: pledge.constituentId,
        totalAmount: pledge.totalAmount.toNumber(),
        amountPaid: pledge.amountPaid.toNumber(),
        amountRemaining: pledge.amountRemaining.toNumber(),
        pledgeDate: pledge.pledgeDate.toISOString().split('T')[0],
        dueDate: pledge.dueDate?.toISOString().split('T')[0],
        fundId: pledge.fundId,
        appealId: pledge.appealId,
        campaignId: pledge.campaignId,
        status: pledge.status,
        paymentSchedule: pledge.paymentSchedule,
        createdAt: pledge.createdAt.toISOString(),
        updatedAt: pledge.updatedAt.toISOString(),
        installments: pledge.installments.map((i: any) => ({
          id: i.id,
          pledgeId: i.pledgeId,
          amount: i.amount.toNumber(),
          dueDate: i.dueDate.toISOString().split('T')[0],
          paidDate: i.paidDate?.toISOString().split('T')[0],
          giftId: i.giftId,
          status: i.status,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
      });
    }

    // List pledges
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

    const pledges = await prisma.crmPledge.findMany({
      where,
      orderBy: {
        pledgeDate: 'desc',
      },
    });

    return NextResponse.json(
      pledges.map((p: any) => ({
        id: p.id,
        constituentId: p.constituentId,
        totalAmount: p.totalAmount.toNumber(),
        amountPaid: p.amountPaid.toNumber(),
        amountRemaining: p.amountRemaining.toNumber(),
        pledgeDate: p.pledgeDate.toISOString().split('T')[0],
        dueDate: p.dueDate?.toISOString().split('T')[0],
        fundId: p.fundId,
        appealId: p.appealId,
        campaignId: p.campaignId,
        status: p.status,
        paymentSchedule: p.paymentSchedule,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching pledges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pledges' },
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
      constituentId,
      totalAmount,
      pledgeDate,
      dueDate,
      fundId,
      appealId,
      campaignId,
      paymentSchedule,
    } = body;

    const pledge = await prisma.crmPledge.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId,
        totalAmount,
        amountPaid: 0,
        amountRemaining: totalAmount,
        pledgeDate: new Date(pledgeDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        fundId,
        appealId,
        campaignId,
        status: 'active',
        paymentSchedule: paymentSchedule || 'one-time',
      },
    });

    return NextResponse.json({
      id: pledge.id,
      constituentId: pledge.constituentId,
      totalAmount: pledge.totalAmount.toNumber(),
      amountPaid: pledge.amountPaid.toNumber(),
      amountRemaining: pledge.amountRemaining.toNumber(),
      pledgeDate: pledge.pledgeDate.toISOString().split('T')[0],
      dueDate: pledge.dueDate?.toISOString().split('T')[0],
      fundId: pledge.fundId,
      appealId: pledge.appealId,
      campaignId: pledge.campaignId,
      status: pledge.status,
      paymentSchedule: pledge.paymentSchedule,
      createdAt: pledge.createdAt.toISOString(),
      updatedAt: pledge.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating pledge:', error);
    return NextResponse.json(
      { error: 'Failed to create pledge' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



