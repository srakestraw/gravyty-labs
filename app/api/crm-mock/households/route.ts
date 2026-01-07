import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const householdId = searchParams.get('id');

    if (householdId) {
      // Get single household
      const household = await prisma.crmHousehold.findFirst({
        where: {
          id: householdId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          members: {
            include: {
              constituent: true,
            },
          },
          primaryConstituent: true,
        },
      });

      if (!household) {
        return NextResponse.json({ error: 'Household not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: household.id,
        name: household.name,
        primaryConstituentId: household.primaryConstituentId,
        createdAt: household.createdAt.toISOString(),
        updatedAt: household.updatedAt.toISOString(),
        sourceSystemRef: household.sourceSystemRef,
          members: household.members.map((m: any) => ({
          id: m.id,
          householdId: m.householdId,
          constituentId: m.constituentId,
          role: m.role,
          createdAt: m.createdAt.toISOString(),
        })),
      });
    }

    // List all households
    const households = await prisma.crmHousehold.findMany({
      where: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
      include: {
        members: true,
        primaryConstituent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      households.map((h: any) => ({
        id: h.id,
        name: h.name,
        primaryConstituentId: h.primaryConstituentId,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
        sourceSystemRef: h.sourceSystemRef,
        memberCount: h.members.length,
      }))
    );
  } catch (error) {
    console.error('Error fetching households:', error);
    return NextResponse.json(
      { error: 'Failed to fetch households' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, primaryConstituentId, sourceSystemRef } = body;

    const household = await prisma.crmHousehold.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name,
        primaryConstituentId,
        sourceSystemRef,
      },
    });

    return NextResponse.json({
      id: household.id,
      name: household.name,
      primaryConstituentId: household.primaryConstituentId,
      createdAt: household.createdAt.toISOString(),
      updatedAt: household.updatedAt.toISOString(),
      sourceSystemRef: household.sourceSystemRef,
    });
  } catch (error) {
    console.error('Error creating household:', error);
    return NextResponse.json(
      { error: 'Failed to create household' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



