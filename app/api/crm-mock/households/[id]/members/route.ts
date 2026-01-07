import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const householdId = params.id;

    const members = await prisma.crmHouseholdMember.findMany({
      where: {
        householdId,
        household: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
      },
      include: {
        constituent: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(
      members.map((m: any) => ({
        id: m.id,
        householdId: m.householdId,
        constituentId: m.constituentId,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
        constituent: {
          id: m.constituent.id,
          name: m.constituent.name,
          email: m.constituent.email,
          phone: m.constituent.phone,
          type: m.constituent.type,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching household members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch household members' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const householdId = params.id;
    const body = await request.json();
    const { constituentId, role } = body;

    // Verify household exists and is in correct workspace/app
    const household = await prisma.crmHousehold.findFirst({
      where: {
        id: householdId,
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
      },
    });

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 });
    }

    const member = await prisma.crmHouseholdMember.create({
      data: {
        householdId,
        constituentId,
        role: role || 'other',
      },
      include: {
        constituent: true,
      },
    });

    return NextResponse.json({
      id: member.id,
      householdId: member.householdId,
      constituentId: member.constituentId,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error adding household member:', error);
    return NextResponse.json(
      { error: 'Failed to add household member' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



