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
    const segmentId = params.id;

    const members = await prisma.crmSegmentMember.findMany({
      where: {
        segmentId,
        segment: {
          workspace: WORKSPACE,
          app: APP,
        },
      },
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching segment members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segmentId = params.id;
    const body = await request.json();
    const { constituentId } = body;

    if (!constituentId) {
      return NextResponse.json(
        { error: 'constituentId is required' },
        { status: 400 }
      );
    }

    // Verify segment exists and belongs to workspace/app
    const segment = await prisma.crmSegment.findFirst({
      where: {
        id: segmentId,
        workspace: WORKSPACE,
        app: APP,
      },
    });

    if (!segment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    const member = await prisma.crmSegmentMember.upsert({
      where: {
        segmentId_constituentId: {
          segmentId,
          constituentId,
        },
      },
      update: {},
      create: {
        segmentId,
        constituentId,
      },
    });

    // Update member count
    const memberCount = await prisma.crmSegmentMember.count({
      where: { segmentId },
    });

    await prisma.crmSegment.update({
      where: { id: segmentId },
      data: { memberCount },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding segment member:', error);
    return NextResponse.json(
      { error: 'Failed to add segment member' },
      { status: 500 }
    );
  }
}



