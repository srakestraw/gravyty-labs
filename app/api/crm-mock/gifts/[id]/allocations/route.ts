import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

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
    const giftId = params.id;

    // Verify gift exists
    const gift = await prisma.crmGift.findFirst({
      where: {
        id: giftId,
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
    });

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const allocations = await prisma.crmGiftAllocation.findMany({
      where: {
        giftId,
      },
      include: {
        fund: true,
        designation: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(
      allocations.map((a: any) => ({
        id: a.id,
        giftId: a.giftId,
        fundId: a.fundId,
        fundName: a.fund.name,
        designationId: a.designationId,
        designationName: a.designation?.name,
        amount: a.amount.toNumber(),
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching gift allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift allocations' },
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
    const giftId = params.id;
    const body = await request.json();
    const { fundId, designationId, amount } = body;

    // Verify gift exists
    const gift = await prisma.crmGift.findFirst({
      where: {
        id: giftId,
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
    });

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const allocation = await prisma.crmGiftAllocation.create({
      data: {
        giftId,
        fundId,
        designationId,
        amount,
      },
      include: {
        fund: true,
        designation: true,
      },
    });

    return NextResponse.json({
      id: allocation.id,
      giftId: allocation.giftId,
      fundId: allocation.fundId,
      fundName: allocation.fund.name,
      designationId: allocation.designationId,
      designationName: allocation.designation?.name,
      amount: allocation.amount.toNumber(),
      createdAt: allocation.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating gift allocation:', error);
    return NextResponse.json(
      { error: 'Failed to create gift allocation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



