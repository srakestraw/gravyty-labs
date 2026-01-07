import { NextResponse } from 'next/server';
import { prisma } from '@/packages/db';

// Using shared prisma instance from @/packages/db

const CRM_MOCK_CTX = {
  workspace: 'advancement',
  app: 'crm-mock',
} as const;

// Helper: Get current fiscal year
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const fyYear = month >= 7 ? year + 1 : year;
  return `FY${fyYear}`;
}

// Helper: Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function GET() {
  try {
    console.log('🔍 Running CRM Mock validation checks...');
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    const checks: Record<string, any> = {};

    // 1. Check gift allocations sum to gift amounts
    console.log('  Checking gift allocations...');
    const allGifts = await prisma.crmGift.findMany({
      where: CRM_MOCK_CTX,
    });
    let allocationErrors = 0;
    for (const gift of allGifts) {
      const allocations = await prisma.crmGiftAllocation.findMany({ where: { giftId: gift.id } });
      if (allocations.length > 0) {
        const allocationSum = allocations.reduce((sum: number, a: any) => sum + parseFloat(a.amount.toString()), 0);
        const giftAmount = parseFloat(gift.amount.toString());
        const difference = Math.abs(allocationSum - giftAmount);
        if (difference > 0.01) {
          allocationErrors++;
          if (allocationErrors <= 5) {
            // Only report first 5 errors
            validationErrors.push(
              `Gift ${gift.id}: Allocation sum (${allocationSum.toFixed(2)}) does not match gift amount (${giftAmount.toFixed(2)})`
            );
          }
        }
      }
    }
    checks.giftAllocations = {
      total: allGifts.length,
      errors: allocationErrors,
    };
    console.log(`  ✓ Checked ${allGifts.length} gifts, found ${allocationErrors} allocation errors`);

    // 2. Check LYBUNT/SYBUNT calculations
    console.log('  Checking LYBUNT/SYBUNT data...');
    const currentFy = getCurrentFiscalYear();
    const currentFyYear = parseInt(currentFy.replace('FY', ''));
    const lastFy = `FY${currentFyYear - 1}`;
    const twoYearsAgoFy = `FY${currentFyYear - 2}`;

    const currentFyGifts = allGifts.filter((g: any) => g.fiscalYear === currentFy);
    const lastFyGifts = allGifts.filter((g: any) => g.fiscalYear === lastFy);
    const twoYearsAgoGifts = allGifts.filter((g: any) => g.fiscalYear === twoYearsAgoFy);

    const currentFyDonors = new Set(currentFyGifts.map((g: any) => g.constituentId));
    const lastFyDonors = new Set(lastFyGifts.map((g: any) => g.constituentId));
    const twoYearsAgoDonors = new Set(twoYearsAgoGifts.map((g: any) => g.constituentId));

    const lybuntDonors = [...lastFyDonors].filter((id) => !currentFyDonors.has(id));
    const sybuntDonors = [...twoYearsAgoDonors].filter(
      (id) => !lastFyDonors.has(id) && !currentFyDonors.has(id)
    );

    checks.lybuntSybunt = {
      currentFyDonors: currentFyDonors.size,
      lastFyDonors: lastFyDonors.size,
      twoYearsAgoDonors: twoYearsAgoDonors.size,
      lybuntCount: lybuntDonors.length,
      sybuntCount: sybuntDonors.length,
    };
    console.log(`  ✓ LYBUNT: ${lybuntDonors.length} donors, SYBUNT: ${sybuntDonors.length} donors`);

    // 3. Check pipeline totals
    console.log('  Checking opportunity pipeline...');
    const allOpportunities = await prisma.crmOpportunity.findMany({
      where: CRM_MOCK_CTX,
    });
    const openOpportunities = allOpportunities.filter((o: any) => o.status === 'open');
    const pipelineTotal = openOpportunities.reduce(
      (sum: number, o: any) => {
        const value = o.expectedAmount || o.amount || 0;
        return sum + (typeof value === 'number' ? value : parseFloat(value.toString()));
      },
      0
    );
    const wonTotal = allOpportunities
      .filter((o: any) => o.status === 'won')
      .reduce((sum: number, o: any) => {
        const value = o.expectedAmount || o.amount || 0;
        return sum + (typeof value === 'number' ? value : parseFloat(value.toString()));
      }, 0);

    checks.pipeline = {
      totalOpportunities: allOpportunities.length,
      openOpportunities: openOpportunities.length,
      pipelineTotal: pipelineTotal,
      wonTotal: wonTotal,
    };
    console.log(`  ✓ Pipeline: ${formatCurrency(pipelineTotal)}, Won: ${formatCurrency(wonTotal)}`);

    // 4. Check receipt coverage
    console.log('  Checking receipt coverage...');
    // Get receipts by finding gifts first, then receipts
    const giftIds = allGifts.map((g: any) => g.id);
    const allReceipts = await prisma.crmReceipt.findMany({
      where: {
        giftId: { in: giftIds },
      },
    });
    const receiptedGifts = new Set(allReceipts.map((r: any) => r.giftId));
    const receiptCoverage = allGifts.length > 0 ? (receiptedGifts.size / allGifts.length) * 100 : 0;
    checks.receiptCoverage = {
      totalGifts: allGifts.length,
      receiptedGifts: receiptedGifts.size,
      coveragePercent: receiptCoverage,
    };
    console.log(`  ✓ Receipt coverage: ${receiptCoverage.toFixed(1)}%`);

    // 5. Check pledge fulfillment
    console.log('  Checking pledge fulfillment...');
    const allPledges = await prisma.crmPledge.findMany({
      where: CRM_MOCK_CTX,
    });
    let pledgeErrors = 0;
    for (const pledge of allPledges) {
      const amountPaid = parseFloat(pledge.amountPaid.toString());
      const totalAmount = parseFloat(pledge.totalAmount.toString());
      const amountRemaining = parseFloat(pledge.amountRemaining.toString());
      const calculatedRemaining = totalAmount - amountPaid;
      const difference = Math.abs(amountRemaining - calculatedRemaining);
      if (difference > 0.01) {
        pledgeErrors++;
        if (pledgeErrors <= 5) {
          validationErrors.push(
            `Pledge ${pledge.id}: Remaining amount (${amountRemaining.toFixed(2)}) does not match calculation (${calculatedRemaining.toFixed(2)})`
          );
        }
      }
    }
    checks.pledges = {
      total: allPledges.length,
      errors: pledgeErrors,
    };
    console.log(`  ✓ Checked ${allPledges.length} pledges, found ${pledgeErrors} errors`);

    // Summary
    const summary = {
      errors: validationErrors.length,
      warnings: validationWarnings.length,
      status: validationErrors.length === 0 ? 'pass' : 'fail',
    };

    if (validationErrors.length > 0) {
      console.error(`  ❌ Found ${validationErrors.length} validation errors`);
    }
    if (validationWarnings.length > 0) {
      console.warn(`  ⚠️  Found ${validationWarnings.length} validation warnings`);
    }
    if (validationErrors.length === 0 && validationWarnings.length === 0) {
      console.log('  ✅ All validation checks passed!');
    }

    return NextResponse.json({
      success: true,
      summary,
      errors: validationErrors,
      warnings: validationWarnings,
      checks,
    });
  } catch (error) {
    console.error('Error running validation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run validation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

