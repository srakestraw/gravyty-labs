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
    const paymentDateStart = searchParams.get('paymentDateStart');
    const paymentDateEnd = searchParams.get('paymentDateEnd');

    const where: any = {};

    if (giftId) {
      where.giftId = giftId;
    }
    if (status) {
      where.status = status;
    }
    if (paymentDateStart || paymentDateEnd) {
      where.paymentDate = {};
      if (paymentDateStart) {
        where.paymentDate.gte = new Date(paymentDateStart);
      }
      if (paymentDateEnd) {
        where.paymentDate.lte = new Date(paymentDateEnd);
      }
    }

    const payments = await prisma.crmPayment.findMany({
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
        paymentDate: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      giftId,
      amount,
      paymentDate,
      paymentMethod,
      paymentReference,
      processedAt,
      status,
    } = body;

    if (!giftId || !amount || !paymentDate || !paymentMethod) {
      return NextResponse.json(
        {
          error:
            'giftId, amount, paymentDate, and paymentMethod are required',
        },
        { status: 400 }
      );
    }

    const payment = await prisma.crmPayment.create({
      data: {
        giftId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod,
        paymentReference,
        processedAt: processedAt ? new Date(processedAt) : null,
        status: status ?? 'pending',
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}



