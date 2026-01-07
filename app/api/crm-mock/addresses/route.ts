import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const constituentId = searchParams.get('constituentId');
    const householdId = searchParams.get('householdId');
    const isActive = searchParams.get('isActive');

    const where: any = {
      workspace: WORKSPACE,
      app: APP,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (householdId) {
      where.householdId = householdId;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const addresses = await prisma.crmAddress.findMany({
      where,
      include: {
        constituent: {
          select: {
            id: true,
            name: true,
          },
        },
        household: {
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

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
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
      householdId,
      type,
      street1,
      street2,
      city,
      state,
      postalCode,
      country,
      isPrimary,
      isActive,
    } = body;

    if (!street1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'street1, city, state, and postalCode are required' },
        { status: 400 }
      );
    }

    if (!constituentId && !householdId) {
      return NextResponse.json(
        { error: 'Either constituentId or householdId is required' },
        { status: 400 }
      );
    }

    const address = await prisma.crmAddress.create({
      data: {
        workspace: WORKSPACE,
        app: APP,
        constituentId,
        householdId,
        type: type ?? 'home',
        street1,
        street2,
        city,
        state,
        postalCode,
        country: country ?? 'US',
        isPrimary: isPrimary ?? false,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



