import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const status = searchParams.get('status');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (status) {
      where.status = status;
    }

    const movePlans = await prisma.crmMovePlan.findMany({
      where,
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            steps: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(movePlans);
  } catch (error) {
    console.error('Error fetching move plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch move plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      name,
      description,
      status,
      startDate,
      targetDate,
    } = body;

    if (!constituentId || !name) {
      return NextResponse.json(
        { error: 'constituentId and name are required' },
        { status: 400 }
      );
    }

    const movePlan = await prisma.crmMovePlan.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        name,
        description,
        status: status ?? 'draft',
        startDate: new Date(startDate),
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json(movePlan, { status: 201 });
  } catch (error) {
    console.error('Error creating move plan:', error);
    return NextResponse.json(
      { error: 'Failed to create move plan' },
      { status: 500 }
    );
  }
}



