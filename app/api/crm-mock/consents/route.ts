import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

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
    if (status) {
      where.status = status;
    }

    const consents = await prisma.crmConsent.findMany({
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(consents);
  } catch (error) {
    console.error('Error fetching consents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consents' },
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
      status,
      grantedAt,
      revokedAt,
      expiresAt,
    } = body;

    if (!constituentId || !type || !status) {
      return NextResponse.json(
        { error: 'constituentId, type, and status are required' },
        { status: 400 }
      );
    }

    const consent = await prisma.crmConsent.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        type,
        status,
        grantedAt: grantedAt ? new Date(grantedAt) : null,
        revokedAt: revokedAt ? new Date(revokedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(consent, { status: 201 });
  } catch (error) {
    console.error('Error creating consent:', error);
    return NextResponse.json(
      { error: 'Failed to create consent' },
      { status: 500 }
    );
  }
}



