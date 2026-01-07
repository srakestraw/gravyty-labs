import { NextRequest, NextResponse } from 'next/server';





import { prisma } from '@/packages/db';






// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';
// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

// Helper: Get fiscal year from date (assuming July 1 start)
function getFiscalYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const fyYear = month >= 7 ? year + 1 : year;
  return `FY${fyYear}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const giftId = searchParams.get('id');
    const constituentId = searchParams.get('constituentId');
    const fiscalYear = searchParams.get('fiscalYear');
    const fundId = searchParams.get('fundId');
    const campaignId = searchParams.get('campaignId');

    if (giftId) {
      // Get single gift
      const gift = await prisma.crmGift.findFirst({
        where: {
          id: giftId,
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
        },
        include: {
          fund: true,
          campaign: true,
          appeal: true,
          allocations: {
            include: {
              fund: true,
              designation: true,
            },
          },
        },
      });

      if (!gift) {
        return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: gift.id,
        constituentId: gift.constituentId,
        amount: gift.amount.toNumber(),
        date: gift.date.toISOString().split('T')[0],
        fiscalYear: gift.fiscalYear,
        fundId: gift.fundId,
        fundName: gift.fund?.name,
        appealId: gift.appealId,
        appealName: gift.appeal?.name,
        campaignId: gift.campaignId,
        campaignName: gift.campaign?.name,
        paymentMethod: gift.paymentMethod,
        paymentReference: gift.paymentReference,
        isAnonymous: gift.isAnonymous,
        isTribute: gift.isTribute,
        isMatchingGift: gift.isMatchingGift,
        receiptId: gift.receiptId,
        createdAt: gift.createdAt.toISOString(),
        updatedAt: gift.updatedAt.toISOString(),
        sourceSystemRef: gift.sourceSystemRef,
        allocations: gift.allocations.map((a: any) => ({
          id: a.id,
          giftId: a.giftId,
          fundId: a.fundId,
          fundName: a.fund.name,
          designationId: a.designationId,
          designationName: a.designation?.name,
          amount: a.amount.toNumber(),
          createdAt: a.createdAt.toISOString(),
        })),
      });
    }

    // List gifts
    const where: any = {
      workspace: CRM_MOCK_CTX.workspace,
      app: CRM_MOCK_CTX.app,
    };

    if (constituentId) {
      where.constituentId = constituentId;
    }
    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }
    if (fundId) {
      where.fundId = fundId;
    }
    if (campaignId) {
      where.campaignId = campaignId;
    }

    const gifts = await prisma.crmGift.findMany({
      where,
      include: {
        fund: true,
        campaign: true,
        appeal: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(
      gifts.map((g: any) => ({
        id: g.id,
        constituentId: g.constituentId,
        amount: g.amount.toNumber(),
        date: g.date.toISOString().split('T')[0],
        fiscalYear: g.fiscalYear,
        fundId: g.fundId,
        fundName: g.fund?.name,
        appealId: g.appealId,
        appealName: g.appeal?.name,
        campaignId: g.campaignId,
        campaignName: g.campaign?.name,
        paymentMethod: g.paymentMethod,
        paymentReference: g.paymentReference,
        isAnonymous: g.isAnonymous,
        isTribute: g.isTribute,
        isMatchingGift: g.isMatchingGift,
        receiptId: g.receiptId,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
        sourceSystemRef: g.sourceSystemRef,
      }))
    );
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gifts' },
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
      amount,
      date,
      fundId,
      appealId,
      campaignId,
      paymentMethod,
      paymentReference,
      isAnonymous,
      isTribute,
      isMatchingGift,
      sourceSystemRef,
    } = body;

    const giftDate = date ? new Date(date) : new Date();
    const fiscalYear = getFiscalYear(giftDate);

    const gift = await prisma.crmGift.create({
      data: {
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId,
        amount,
        date: giftDate,
        fiscalYear,
        fundId,
        appealId,
        campaignId,
        paymentMethod: paymentMethod || 'check',
        paymentReference,
        isAnonymous: isAnonymous || false,
        isTribute: isTribute || false,
        isMatchingGift: isMatchingGift || false,
        sourceSystemRef,
      },
    });

    return NextResponse.json({
      id: gift.id,
      constituentId: gift.constituentId,
      amount: gift.amount.toNumber(),
      date: gift.date.toISOString().split('T')[0],
      fiscalYear: gift.fiscalYear,
      fundId: gift.fundId,
      appealId: gift.appealId,
      campaignId: gift.campaignId,
      paymentMethod: gift.paymentMethod,
      paymentReference: gift.paymentReference,
      isAnonymous: gift.isAnonymous,
      isTribute: gift.isTribute,
      isMatchingGift: gift.isMatchingGift,
      receiptId: gift.receiptId,
      createdAt: gift.createdAt.toISOString(),
      updatedAt: gift.updatedAt.toISOString(),
      sourceSystemRef: gift.sourceSystemRef,
    });
  } catch (error) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Failed to create gift' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}



