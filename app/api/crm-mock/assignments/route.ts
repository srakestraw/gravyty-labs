import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const officerId = searchParams.get('officerId');
    const role = searchParams.get('role');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (officerId) {
      where.officerId = officerId;
    }
    if (role) {
      where.role = role;
    }

    const assignments = await prisma.crmAssignment.findMany({
      where,
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
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
      officerId,
      role,
      assignedBy,
      notes,
    } = body;

    if (!constituentId || !officerId || !role) {
      return NextResponse.json(
        { error: 'constituentId, officerId, and role are required' },
        { status: 400 }
      );
    }

    const assignment = await prisma.crmAssignment.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        officerId,
        role,
        assignedBy,
        notes,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



