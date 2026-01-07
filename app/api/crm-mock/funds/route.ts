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
    const fundId = searchParams.get('id');
    const parentFundId = searchParams.get('parentFundId');

    if (fundId) {
      // Get single fund
      const fund = await prisma.crmFund.findFirst({
        where: {
          id: fundId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          designations: true,
          childFunds: true,
        },
      });

      if (!fund) {
        return NextResponse.json({ error: 'Fund not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: fund.id,
        name: fund.name,
        code: fund.code,
        description: fund.description,
        type: fund.type,
        isActive: fund.isActive,
        parentFundId: fund.parentFundId,
        createdAt: fund.createdAt.toISOString(),
        updatedAt: fund.updatedAt.toISOString(),
      });
    }

    // List funds
    const where: any = {
      workspace: CRM_MOCK_CTX.workspace,
      app: CRM_MOCK_CTX.app,
    };

    if (parentFundId) {
      where.parentFundId = parentFundId;
    }

    const funds = await prisma.crmFund.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      funds.map((f: any) => ({
        id: f.id,
        name: f.name,
        code: f.code,
        description: f.description,
        type: f.type,
        isActive: f.isActive,
        parentFundId: f.parentFundId,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funds' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, type, isActive, parentFundId } = body;

    const fund = await prisma.crmFund.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name,
        code,
        description,
        type: type || 'unrestricted',
        isActive: isActive !== undefined ? isActive : true,
        parentFundId,
      },
    });

    return NextResponse.json({
      id: fund.id,
      name: fund.name,
      code: fund.code,
      description: fund.description,
      type: fund.type,
      isActive: fund.isActive,
      parentFundId: fund.parentFundId,
      createdAt: fund.createdAt.toISOString(),
      updatedAt: fund.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating fund:', error);
    return NextResponse.json(
      { error: 'Failed to create fund' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



