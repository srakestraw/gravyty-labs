import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';

const WORKSPACE = 'advancement';
const APP = 'crm-mock';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const constituentId = searchParams.get('constituentId');
    const householdId = searchParams.get('householdId');

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

    const addresses = await prisma.crmAddress.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      addresses.map((a: any) => ({
        id: a.id,
        constituentId: a.constituentId,
        householdId: a.householdId,
        type: a.type,
        street1: a.street1,
        street2: a.street2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        isPrimary: a.isPrimary,
        isActive: a.isActive,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
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
        constituentId: constituentId || null,
        householdId: householdId || null,
        type: type || 'home',
        street1,
        street2: street2 || null,
        city,
        state,
        postalCode,
        country: country || 'US',
        isPrimary: isPrimary || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      id: address.id,
      constituentId: address.constituentId,
      householdId: address.householdId,
      type: address.type,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isPrimary: address.isPrimary,
      isActive: address.isActive,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
