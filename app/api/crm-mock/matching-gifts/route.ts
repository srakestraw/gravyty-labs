import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');
    const status = searchParams.get('status');

    const where: any = {};

    if (giftId) {
      where.giftId = giftId;
    }
    if (status) {
      where.status = status;
    }

    const matchingGifts = await prisma.crmMatchingGift.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(matchingGifts);
  } catch (error) {
    console.error('Error fetching matching gifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matching gifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftId,
      matchingCompanyId,
      matchingCompanyName,
      matchAmount,
      matchRatio,
      status,
      submittedAt,
      receivedAt,
    } = body;

    if (!giftId || !matchingCompanyName || !matchAmount || !matchRatio) {
      return NextResponse.json(
        {
          error:
            'giftId, matchingCompanyName, matchAmount, and matchRatio are required',
        },
        { status: 400 }
      );
    }

    const matchingGift = await prisma.crmMatchingGift.create({
      data: {
        giftId,
        matchingCompanyId,
        matchingCompanyName,
        matchAmount: parseFloat(matchAmount),
        matchRatio: parseFloat(matchRatio),
        status: status ?? 'pending',
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        receivedAt: receivedAt ? new Date(receivedAt) : null,
      },
    });

    return NextResponse.json(matchingGift, { status: 201 });
  } catch (error) {
    console.error('Error creating matching gift:', error);
    return NextResponse.json(
      { error: 'Failed to create matching gift' },
      { status: 500 }
    );
  }
}



