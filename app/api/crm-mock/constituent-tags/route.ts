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
    const tagId = searchParams.get('tagId');

    const where: any = {};

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (tagId) {
      where.tagId = tagId;
    }

    const constituentTags = await prisma.crmConstituentTag.findMany({
      where,
      include: {
        tag: true,
        constituent: {
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

    return NextResponse.json(constituentTags);
  } catch (error) {
    console.error('Error fetching constituent tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch constituent tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagId, constituentId } = body;

    if (!tagId || !constituentId) {
      return NextResponse.json(
        { error: 'tagId and constituentId are required' },
        { status: 400 }
      );
    }

    const constituentTag = await prisma.crmConstituentTag.upsert({
      where: {
        tagId_constituentId: {
          tagId,
          constituentId,
        },
      },
      update: {},
      create: {
        tagId,
        constituentId,
      },
    });

    return NextResponse.json(constituentTag, { status: 201 });
  } catch (error) {
    console.error('Error creating constituent tag:', error);
    return NextResponse.json(
      { error: 'Failed to create constituent tag' },
      { status: 500 }
    );
  }
}



