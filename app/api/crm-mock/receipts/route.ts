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
    const fiscalYear = searchParams.get('fiscalYear');
    const receiptNumber = searchParams.get('receiptNumber');

    const where: any = {};

    if (giftId) {
      where.giftId = giftId;
    }
    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }
    if (receiptNumber) {
      where.receiptNumber = receiptNumber;
    }

    const receipts = await prisma.crmReceipt.findMany({
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
        receiptDate: 'desc',
      },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftId,
      receiptNumber,
      receiptDate,
      amount,
      fiscalYear,
      method,
      sentAt,
    } = body;

    if (
      !giftId ||
      !receiptNumber ||
      !receiptDate ||
      !amount ||
      !fiscalYear
    ) {
      return NextResponse.json(
        {
          error:
            'giftId, receiptNumber, receiptDate, amount, and fiscalYear are required',
        },
        { status: 400 }
      );
    }

    const receipt = await prisma.crmReceipt.create({
      data: {
        giftId,
        receiptNumber,
        receiptDate: new Date(receiptDate),
        amount: parseFloat(amount),
        fiscalYear,
        method: method ?? 'mail',
        sentAt: sentAt ? new Date(sentAt) : null,
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}



