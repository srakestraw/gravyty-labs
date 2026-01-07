import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      eventId,
      event: {
        workspace: WORKSPACE,
        app: APP,
      },
    };

    if (status) {
      where.status = status;
    }

    const participations = await prisma.crmEventParticipation.findMany({
      where,
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching event participations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event participations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const {
      constituentId,
      status,
      registeredAt,
      attendedAt,
      notes,
    } = body;

    if (!constituentId) {
      return NextResponse.json(
        { error: 'constituentId is required' },
        { status: 400 }
      );
    }

    // Verify event exists and belongs to workspace/app
    const event = await prisma.crmEvent.findFirst({
      where: {
        id: eventId,
        workspace: WORKSPACE,
        app: APP,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const participation = await prisma.crmEventParticipation.upsert({
      where: {
        eventId_constituentId: {
          eventId,
          constituentId,
        },
      },
      update: {
        status,
        registeredAt: registeredAt ? new Date(registeredAt) : null,
        attendedAt: attendedAt ? new Date(attendedAt) : null,
        notes,
      },
      create: {
        eventId,
        constituentId,
        status: status ?? 'registered',
        registeredAt: registeredAt ? new Date(registeredAt) : new Date(),
        attendedAt: attendedAt ? new Date(attendedAt) : null,
        notes,
      },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error creating event participation:', error);
    return NextResponse.json(
      { error: 'Failed to create event participation' },
      { status: 500 }
    );
  }
}



