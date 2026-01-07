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
    const constituentId = searchParams.get('constituentId');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.OR = [
        { constituentId1: constituentId },
        { constituentId2: constituentId },
      ];
    }
    if (type) {
      where.type = type;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const relationships = await prisma.crmRelationship.findMany({
      where,
      include: {
        constituent1: {
          select: {
            id: true,
            name: true,
          },
        },
        constituent2: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(relationships);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId1,
      constituentId2,
      type,
      reciprocalType,
      startDate,
      endDate,
      isActive,
      notes,
    } = body;

    if (!constituentId1 || !constituentId2 || !type) {
      return NextResponse.json(
        { error: 'constituentId1, constituentId2, and type are required' },
        { status: 400 }
      );
    }

    if (constituentId1 === constituentId2) {
      return NextResponse.json(
        { error: 'constituentId1 and constituentId2 must be different' },
        { status: 400 }
      );
    }

    const relationship = await prisma.crmRelationship.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId1,
        constituentId2,
        type,
        reciprocalType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        notes,
      },
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    console.error('Error creating relationship:', error);
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}



