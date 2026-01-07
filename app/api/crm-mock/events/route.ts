import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDateStart = searchParams.get('startDateStart');
    const startDateEnd = searchParams.get('startDateEnd');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (status) {
      where.status = status;
    }
    if (startDateStart || startDateEnd) {
      where.startDate = {};
      if (startDateStart) {
        where.startDate.gte = new Date(startDateStart);
      }
      if (startDateEnd) {
        where.startDate.lte = new Date(startDateEnd);
      }
    }

    const events = await prisma.crmEvent.findMany({
      where,
      include: {
        _count: {
          select: {
            participations: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      location,
      capacity,
      status,
    } = body;

    if (!name || !startDate) {
      return NextResponse.json(
        { error: 'name and startDate are required' },
        { status: 400 }
      );
    }

    const event = await prisma.crmEvent.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        name,
        description,
        type: type ?? 'other',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        capacity,
        status: status ?? 'draft',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}



