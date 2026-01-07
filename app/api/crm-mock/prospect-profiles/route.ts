import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }

    const profiles = await prisma.crmProspectProfile.findMany({
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
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching prospect profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospect profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      capacity,
      inclination,
      interests,
      researchNotes,
      lastResearchedAt,
    } = body;

    if (!constituentId) {
      return NextResponse.json(
        { error: 'constituentId is required' },
        { status: 400 }
      );
    }

    const profile = await prisma.crmProspectProfile.upsert({
      where: {
        constituentId,
      },
      update: {
        capacity: capacity ? parseFloat(capacity) : null,
        inclination: inclination ? parseInt(inclination) : null,
        interests: interests ? JSON.parse(JSON.stringify(interests)) : null,
        researchNotes,
        lastResearchedAt: lastResearchedAt ? new Date(lastResearchedAt) : new Date(),
      },
      create: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        capacity: capacity ? parseFloat(capacity) : null,
        inclination: inclination ? parseInt(inclination) : null,
        interests: interests ? JSON.parse(JSON.stringify(interests)) : null,
        researchNotes,
        lastResearchedAt: lastResearchedAt ? new Date(lastResearchedAt) : new Date(),
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating prospect profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update prospect profile' },
      { status: 500 }
    );
  }
}



