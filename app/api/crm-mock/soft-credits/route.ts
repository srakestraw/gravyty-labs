import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');
    const constituentId = searchParams.get('constituentId');

    const where: any = {};

    if (giftId) {
      where.giftId = giftId;
    }
    if (constituentId) {
      where.constituentId = constituentId;
    }

    const softCredits = await prisma.crmSoftCredit.findMany({
      where,
      include: {
        gift: {
          select: {
            id: true,
            amount: true,
            date: true,
            constituent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(softCredits);
  } catch (error) {
    console.error('Error fetching soft credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soft credits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giftId, constituentId, amount, reason } = body;

    if (!giftId || !constituentId || !amount || !reason) {
      return NextResponse.json(
        { error: 'giftId, constituentId, amount, and reason are required' },
        { status: 400 }
      );
    }

    const softCredit = await prisma.crmSoftCredit.create({
      data: {
        giftId,
        constituentId,
        amount: parseFloat(amount),
        reason,
      },
    });

    return NextResponse.json(softCredit, { status: 201 });
  } catch (error) {
    console.error('Error creating soft credit:', error);
    return NextResponse.json(
      { error: 'Failed to create soft credit' },
      { status: 500 }
    );
  }
}



