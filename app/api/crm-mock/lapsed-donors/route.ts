import { NextRequest, NextResponse } from 'next/server';
import { crmClient } from '@/lib/crm-unified';

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

// Helper: Get current fiscal year
function getCurrentFiscalYear(): string {
  const now = new Date();
  return getFiscalYear(now);
}

// Helper: Get prior fiscal year
function getPriorFiscalYear(): string {
  const currentFy = getCurrentFiscalYear();
  const year = parseInt(currentFy.replace('FY', ''));
  return `FY${year - 1}`;
}

export async function GET(request: NextRequest) {
  try {
    const constituents = await crmClient.listConstituents(CRM_MOCK_CTX);
    const opportunities = await crmClient.listOpportunities(CRM_MOCK_CTX);
    const interactions = await crmClient.listInteractions(CRM_MOCK_CTX);
    
    const currentFy = getCurrentFiscalYear();
    const priorFy = getPriorFiscalYear();

    // Get all prior FY donors
    const priorFyGifts = opportunities.filter(
      (o) => o.status === 'won' && getFiscalYear(new Date(o.createdAt)) === priorFy
    );
    const priorFyDonorIds = new Set(priorFyGifts.map((g) => g.constituentId).filter((id): id is string => !!id));

    // Filter to those with zero gifts in current FY
    const currentFyGifts = opportunities.filter(
      (o) => o.status === 'won' && getFiscalYear(new Date(o.createdAt)) === currentFy
    );
    const currentFyDonorIds = new Set(currentFyGifts.map((g) => g.constituentId).filter((id): id is string => !!id));

    const lapsedDonorIds = Array.from(priorFyDonorIds).filter((id) => !currentFyDonorIds.has(id));

    // Build lapsed donor records
    const lapsedDonors = lapsedDonorIds.map((constituentId) => {
      const constituent = constituents.find((c) => c.id === constituentId);
      if (!constituent) return null;

      const priorFyConstituentGifts = priorFyGifts.filter((g) => g.constituentId === constituentId);
      const priorFyTotal = priorFyConstituentGifts.reduce((sum, g) => sum + (g.amount || 0), 0);
      const lastGift = priorFyConstituentGifts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const constituentInteractions = interactions.filter((i) => i.constituentId === constituentId);
      const lastInteraction = constituentInteractions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return {
        constituentId,
        name: constituent.name,
        email: constituent.email,
        priorFyTotal,
        lastGiftDate: lastGift.createdAt,
        lastGiftAmount: lastGift.amount || 0,
        propensity: Math.floor(Math.random() * 100), // Not in DB yet
        lastTouchDate: lastInteraction?.createdAt,
        lastTouchType: lastInteraction?.type,
        sentiment: undefined, // Not in DB yet
      };
    }).filter((d) => d !== null);

    return NextResponse.json(lapsedDonors);
  } catch (error) {
    console.error('Error fetching lapsed donors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lapsed donors' },
      { status: 500 }
    );
  }
}



