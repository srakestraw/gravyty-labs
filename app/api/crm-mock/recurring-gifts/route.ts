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
    const scheduleId = searchParams.get('id');
    const constituentId = searchParams.get('constituentId');
    const status = searchParams.get('status');

    if (scheduleId) {
      // Get single recurring gift schedule
      const schedule = await prisma.crmRecurringGiftSchedule.findFirst({
        where: {
          id: scheduleId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
      });

      if (!schedule) {
        return NextResponse.json({ error: 'Recurring gift schedule not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: schedule.id,
        constituentId: schedule.constituentId,
        amount: schedule.amount.toNumber(),
        frequency: schedule.frequency,
        startDate: schedule.startDate.toISOString().split('T')[0],
        endDate: schedule.endDate?.toISOString().split('T')[0],
        fundId: schedule.fundId,
        paymentMethod: schedule.paymentMethod,
        status: schedule.status,
        nextGiftDate: schedule.nextGiftDate?.toISOString().split('T')[0],
        lastGiftDate: schedule.lastGiftDate?.toISOString().split('T')[0],
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
      });
    }

    // List recurring gift schedules
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

    const schedules = await prisma.crmRecurringGiftSchedule.findMany({
      where,
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(
      schedules.map((s: any) => ({
        id: s.id,
        constituentId: s.constituentId,
        amount: s.amount.toNumber(),
        frequency: s.frequency,
        startDate: s.startDate.toISOString().split('T')[0],
        endDate: s.endDate?.toISOString().split('T')[0],
        fundId: s.fundId,
        paymentMethod: s.paymentMethod,
        status: s.status,
        nextGiftDate: s.nextGiftDate?.toISOString().split('T')[0],
        lastGiftDate: s.lastGiftDate?.toISOString().split('T')[0],
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching recurring gift schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring gift schedules' },
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
      amount,
      frequency,
      startDate,
      endDate,
      fundId,
      paymentMethod,
    } = body;

    const schedule = await prisma.crmRecurringGiftSchedule.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId,
        amount,
        frequency: frequency || 'monthly',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        fundId,
        paymentMethod: paymentMethod || 'credit-card',
        status: 'active',
        nextGiftDate: new Date(startDate),
      },
    });

    return NextResponse.json({
      id: schedule.id,
      constituentId: schedule.constituentId,
      amount: schedule.amount.toNumber(),
      frequency: schedule.frequency,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate?.toISOString().split('T')[0],
      fundId: schedule.fundId,
      paymentMethod: schedule.paymentMethod,
      status: schedule.status,
      nextGiftDate: schedule.nextGiftDate?.toISOString().split('T')[0],
      lastGiftDate: schedule.lastGiftDate?.toISOString().split('T')[0],
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating recurring gift schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring gift schedule' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



