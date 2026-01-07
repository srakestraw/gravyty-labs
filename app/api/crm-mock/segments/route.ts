import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const segments = await prisma.crmSegment.findMany({
      where: {
        workspace: WORKSPACE,
        app: APP,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Update memberCount if needed
    const segmentsWithCounts = segments.map((segment: any) => ({
      ...segment,
      memberCount: segment._count.members,
    }));

    return NextResponse.json(segmentsWithCounts);
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, criteria } = body;

    if (!name || !criteria) {
      return NextResponse.json(
        { error: 'name and criteria are required' },
        { status: 400 }
      );
    }

    const segment = await prisma.crmSegment.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        name,
        description,
        criteria: JSON.parse(JSON.stringify(criteria)),
        memberCount: 0,
      },
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
}



