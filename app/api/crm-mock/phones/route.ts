import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const isActive = searchParams.get('isActive');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const phones = await prisma.crmPhone.findMany({
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
        isPrimary: 'desc',
      },
    });

    return NextResponse.json(phones);
  } catch (error) {
    console.error('Error fetching phones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      constituentId,
      phone,
      type,
      isPrimary,
      isActive,
    } = body;

    if (!constituentId || !phone) {
      return NextResponse.json(
        { error: 'constituentId and phone are required' },
        { status: 400 }
      );
    }

    const phoneRecord = await prisma.crmPhone.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        phone,
        type: type ?? 'mobile',
        isPrimary: isPrimary ?? false,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(phoneRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating phone:', error);
    return NextResponse.json(
      { error: 'Failed to create phone' },
      { status: 500 }
    );
  }
}



