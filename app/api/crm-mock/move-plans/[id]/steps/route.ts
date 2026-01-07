import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movePlanId = params.id;

    const steps = await prisma.crmMoveStep.findMany({
      where: {
        movePlanId,
        movePlan: {
          workspace: WORKSPACE,
          app: APP,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching move steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch move steps' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movePlanId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      stepType,
      status,
      dueDate,
      notes,
      order,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Verify move plan exists and belongs to workspace/app
    const movePlan = await prisma.crmMovePlan.findFirst({
      where: {
        id: movePlanId,
        workspace: WORKSPACE,
        app: APP,
      },
    });

    if (!movePlan) {
      return NextResponse.json(
        { error: 'Move plan not found' },
        { status: 404 }
      );
    }

    const step = await prisma.crmMoveStep.create({
      data: {
        movePlanId,
        name,
        description,
        stepType: stepType ?? 'other',
        status: status ?? 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        order: order ?? 0,
      },
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    console.error('Error creating move step:', error);
    return NextResponse.json(
      { error: 'Failed to create move step' },
      { status: 500 }
    );
  }
}



