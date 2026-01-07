import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');
    const type = searchParams.get('type');

    const where: any = {};

    if (giftId) {
      where.giftId = giftId;
    }
    if (type) {
      where.type = type;
    }

    const tributes = await prisma.crmTribute.findMany({
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

    return NextResponse.json(tributes);
  } catch (error) {
    console.error('Error fetching tributes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tributes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftId,
      type,
      honoreeName,
      honoreeConstituentId,
      notificationSent,
      notificationSentAt,
    } = body;

    if (!giftId || !type || !honoreeName) {
      return NextResponse.json(
        { error: 'giftId, type, and honoreeName are required' },
        { status: 400 }
      );
    }

    const tribute = await prisma.crmTribute.create({
      data: {
        giftId,
        type,
        honoreeName,
        honoreeConstituentId,
        notificationSent: notificationSent ?? false,
        notificationSentAt: notificationSentAt
          ? new Date(notificationSentAt)
          : null,
      },
    });

    return NextResponse.json(tribute, { status: 201 });
  } catch (error) {
    console.error('Error creating tribute:', error);
    return NextResponse.json(
      { error: 'Failed to create tribute' },
      { status: 500 }
    );
  }
}



