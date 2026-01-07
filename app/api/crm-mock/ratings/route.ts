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

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (type) {
      where.type = type;
    }

    const ratings = await prisma.crmRating.findMany({
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
        ratedAt: 'desc',
      },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      type,
      score,
      ratedBy,
      notes,
    } = body;

    if (!constituentId || !type || score === undefined) {
      return NextResponse.json(
        { error: 'constituentId, type, and score are required' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'score must be between 0 and 100' },
        { status: 400 }
      );
    }

    const rating = await prisma.crmRating.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        type,
        score: parseInt(score),
        ratedBy,
        notes,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}



