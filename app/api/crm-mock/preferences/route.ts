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

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }

    const preferences = await prisma.crmPreferences.findMany({
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

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      preferredContactMethod,
      preferredContactTime,
      preferredLanguage,
      doNotCall,
      doNotEmail,
      doNotMail,
    } = body;

    if (!constituentId) {
      return NextResponse.json(
        { error: 'constituentId is required' },
        { status: 400 }
      );
    }

    const preference = await prisma.crmPreferences.upsert({
      where: {
        constituentId,
      },
      update: {
        preferredContactMethod,
        preferredContactTime,
        preferredLanguage,
        doNotCall: doNotCall ?? false,
        doNotEmail: doNotEmail ?? false,
        doNotMail: doNotMail ?? false,
      },
      create: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        preferredContactMethod: preferredContactMethod ?? 'email',
        preferredContactTime,
        preferredLanguage,
        doNotCall: doNotCall ?? false,
        doNotEmail: doNotEmail ?? false,
        doNotMail: doNotMail ?? false,
      },
    });

    return NextResponse.json(preference, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to create/update preferences' },
      { status: 500 }
    );
  }
}



