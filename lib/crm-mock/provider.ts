// CRM Mock Provider - Advancement-only mock data provider

import {
  generateSeedData,
  resetData,
  getConstituents,
  getGifts,
  getPortfolios,
  getPortfolioMembers,
  getInteractions,
  getTasks,
  getEvents,
  getEventParticipations,
  getOrganizations,
  getRelationships,
  createPortfolio,
  addPortfolioMembers,
  removePortfolioMember,
} from './mock-data';

import type {
  CRMContext,
  Constituent,
  ConstituentDetail,
  Gift,
  Portfolio,
  PortfolioMember,
  Interaction,
  Task,
  Event,
  EventParticipation,
  Organization,
  Relationship,
  LapsedDonor,
  ConstituentFilters,
  PagingOptions,
  SortOptions,
} from './types';

// Ensure data is seeded
function ensureSeeded(): void {
  generateSeedData();
}

// Get fiscal year start/end dates
function getFiscalYearDates(fy: string): { start: Date; end: Date } {
  const year = parseInt(fy.replace('FY', ''));
  const start = new Date(year - 1, 6, 1); // July 1
  const end = new Date(year, 5, 30, 23, 59, 59); // June 30
  return { start, end };
}

// Get current fiscal year
function getCurrentFiscalYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const fyYear = month >= 7 ? year + 1 : year;
  return `FY${fyYear}`;
}

// Get prior fiscal year
function getPriorFiscalYear(): string {
  const currentFy = getCurrentFiscalYear();
  const year = parseInt(currentFy.replace('FY', ''));
  return `FY${year - 1}`;
}

// Provider functions
export const crmMockProvider = {
  // List constituents with filters, paging, and sorting
  listConstituents(
    ctx: CRMContext,
    options?: {
      filters?: ConstituentFilters;
      paging?: PagingOptions;
      sort?: SortOptions;
    }
  ): Constituent[] {
    ensureSeeded();
    let results = [...getConstituents()];

    // Apply filters
    if (options?.filters) {
      const filters = options.filters;
      const gifts = getGifts();
      const interactions = getInteractions();
      const eventParticipations = getEventParticipations();
      const events = getEvents();

      results = results.filter((constituent) => {
        // Propensity filter
        if (filters.propensityMin !== undefined && constituent.propensity < filters.propensityMin) {
          return false;
        }
        if (filters.propensityMax !== undefined && constituent.propensity > filters.propensityMax) {
          return false;
        }

        // Last gift recency filter
        if (filters.lastGiftDays !== undefined) {
          const constituentGifts = gifts.filter((g) => g.constituentId === constituent.id);
          if (constituentGifts.length === 0) return false;
          const lastGift = constituentGifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const daysSinceGift = Math.floor((Date.now() - new Date(lastGift.date).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceGift > filters.lastGiftDays) return false;
        }

        // Sentiment filter
        if (filters.sentiment) {
          const constituentInteractions = interactions.filter(
            (i) => i.constituentId === constituent.id && i.sentiment
          );
          if (constituentInteractions.length === 0) return false;
          const lastInteraction = constituentInteractions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          if (lastInteraction.sentiment !== filters.sentiment) return false;
        }

        // Event attendance recency filter
        if (filters.eventAttendanceDays !== undefined) {
          const participations = eventParticipations.filter(
            (p) => p.constituentId === constituent.id && p.status === 'attended'
          );
          if (participations.length === 0) return false;
          const eventDates = participations.map((p) => {
            const event = events.find((e) => e.id === p.eventId);
            return event ? new Date(event.date) : null;
          }).filter((d): d is Date => d !== null);
          if (eventDates.length === 0) return false;
          const lastEventDate = eventDates.sort((a, b) => b.getTime() - a.getTime())[0];
          const daysSinceEvent = Math.floor((Date.now() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceEvent > filters.eventAttendanceDays) return false;
        }

        return true;
      });
    }

    // Apply sorting
    if (options?.sort) {
      const { field, direction } = options.sort;
      const gifts = getGifts();
      const interactions = getInteractions();
      const currentFy = getCurrentFiscalYear();

      results.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (field) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'propensity':
            aValue = a.propensity;
            bValue = b.propensity;
            break;
          case 'lastGift':
            const aGifts = gifts.filter((g) => g.constituentId === a.id);
            const bGifts = gifts.filter((g) => g.constituentId === b.id);
            aValue = aGifts.length > 0 ? new Date(aGifts.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0].date).getTime() : 0;
            bValue = bGifts.length > 0 ? new Date(bGifts.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0].date).getTime() : 0;
            break;
          case 'fyGiving':
            const aFyGifts = gifts.filter((g) => g.constituentId === a.id && g.fiscalYear === currentFy);
            const bFyGifts = gifts.filter((g) => g.constituentId === b.id && g.fiscalYear === currentFy);
            aValue = aFyGifts.reduce((sum, g) => sum + g.amount, 0);
            bValue = bFyGifts.reduce((sum, g) => sum + g.amount, 0);
            break;
          case 'lastTouch':
            const aInteractions = interactions.filter((i) => i.constituentId === a.id);
            const bInteractions = interactions.filter((i) => i.constituentId === b.id);
            aValue = aInteractions.length > 0 ? new Date(aInteractions.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            bValue = bInteractions.length > 0 ? new Date(bInteractions.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            break;
          case 'sentiment':
            const aSentimentInteractions = interactions.filter((i) => i.constituentId === a.id && i.sentiment);
            const bSentimentInteractions = interactions.filter((i) => i.constituentId === b.id && i.sentiment);
            const aSentimentScore = aSentimentInteractions.length > 0
              ? aSentimentInteractions.reduce((sum, i) => sum + (i.sentimentScore || 0), 0) / aSentimentInteractions.length
              : 0;
            const bSentimentScore = bSentimentInteractions.length > 0
              ? bSentimentInteractions.reduce((sum, i) => sum + (i.sentimentScore || 0), 0) / bSentimentInteractions.length
              : 0;
            aValue = aSentimentScore;
            bValue = bSentimentScore;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by name
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply paging
    if (options?.paging) {
      const { page = 1, pageSize = 50 } = options.paging;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return results.slice(start, end);
    }

    return results;
  },

  // Get constituent with rollups
  getConstituent(ctx: CRMContext, id: string): ConstituentDetail | null {
    ensureSeeded();
    const constituent = getConstituents().find((c) => c.id === id);
    if (!constituent) return null;

    const gifts = getGifts().filter((g) => g.constituentId === id);
    const interactions = getInteractions().filter((i) => i.constituentId === id);
    const currentFy = getCurrentFiscalYear();
    const priorFy = getPriorFiscalYear();

    // Last gift
    const sortedGifts = gifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastGift = sortedGifts.length > 0
      ? {
          date: sortedGifts[0].date,
          amount: sortedGifts[0].amount,
        }
      : undefined;

    // FY totals
    const currentFyTotal = gifts
      .filter((g) => g.fiscalYear === currentFy)
      .reduce((sum, g) => sum + g.amount, 0);
    const priorFyTotal = gifts
      .filter((g) => g.fiscalYear === priorFy)
      .reduce((sum, g) => sum + g.amount, 0);

    // Last interaction
    const sortedInteractions = interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastInteraction = sortedInteractions.length > 0
      ? {
          date: sortedInteractions[0].createdAt,
          type: sortedInteractions[0].type,
          subject: sortedInteractions[0].subject,
        }
      : undefined;

    // Sentiment trend (compare last 3 months vs previous 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentInteractions = interactions.filter(
      (i) => i.sentiment && new Date(i.createdAt) >= threeMonthsAgo
    );
    const olderInteractions = interactions.filter(
      (i) => i.sentiment && new Date(i.createdAt) >= sixMonthsAgo && new Date(i.createdAt) < threeMonthsAgo
    );

    let sentimentTrend: 'improving' | 'stable' | 'declining' | undefined;
    if (recentInteractions.length > 0 && olderInteractions.length > 0) {
      const recentAvg = recentInteractions.reduce((sum, i) => sum + (i.sentimentScore || 0), 0) / recentInteractions.length;
      const olderAvg = olderInteractions.reduce((sum, i) => sum + (i.sentimentScore || 0), 0) / olderInteractions.length;
      if (recentAvg > olderAvg + 0.1) sentimentTrend = 'improving';
      else if (recentAvg < olderAvg - 0.1) sentimentTrend = 'declining';
      else sentimentTrend = 'stable';
    }

    return {
      ...constituent,
      lastGift,
      currentFyTotal,
      priorFyTotal,
      lastInteraction,
      sentimentTrend,
    };
  },

  // List portfolios
  listPortfolios(ctx: CRMContext, options?: { ownerOfficerId?: string }): Portfolio[] {
    ensureSeeded();
    let portfolios = [...getPortfolios()];
    
    if (options?.ownerOfficerId) {
      portfolios = portfolios.filter((p) => p.officerId === options.ownerOfficerId);
    }
    
    return portfolios;
  },

  // Create portfolio
  createPortfolio(
    ctx: CRMContext,
    data: { name: string; description?: string; ownerOfficerId: string }
  ): Portfolio {
    ensureSeeded();
    const officerNames: Record<string, string> = {
      'officer_1': 'Sarah Johnson',
      'officer_2': 'Michael Chen',
      'officer_3': 'Emily Rodriguez',
      'officer_4': 'David Kim',
      'officer_5': 'Lisa Thompson',
    };
    
    return createPortfolio({
      name: data.name,
      description: data.description,
      officerId: data.ownerOfficerId,
      officerName: officerNames[data.ownerOfficerId] || 'Unknown Officer',
    });
  },

  // Get portfolio
  getPortfolio(ctx: CRMContext, id: string): Portfolio | null {
    ensureSeeded();
    return getPortfolios().find((p) => p.id === id) || null;
  },

  // List portfolio members (returns constituent summaries)
  listPortfolioMembers(ctx: CRMContext, portfolioId: string): Constituent[] {
    ensureSeeded();
    const members = getPortfolioMembers().filter((pm) => pm.portfolioId === portfolioId);
    const constituents = getConstituents();
    const memberConstituents = members
      .map((pm) => constituents.find((c) => c.id === pm.constituentId))
      .filter((c): c is Constituent => c !== undefined);
    return memberConstituents;
  },

  // Add portfolio members
  addPortfolioMembers(ctx: CRMContext, portfolioId: string, personIds: string[]): void {
    ensureSeeded();
    addPortfolioMembers(portfolioId, personIds);
  },

  // Remove portfolio member
  removePortfolioMember(ctx: CRMContext, portfolioId: string, personId: string): void {
    ensureSeeded();
    removePortfolioMember(portfolioId, personId);
  },

  // Search constituents
  searchConstituents(ctx: CRMContext, query: string, limit?: number): Constituent[] {
    ensureSeeded();
    const searchLower = query.toLowerCase().trim();
    if (!searchLower) return [];
    
    let results = getConstituents().filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
    );
    
    if (limit) {
      results = results.slice(0, limit);
    }
    
    return results;
  },

  // List outreach queue (tasks for officer)
  listOutreachQueue(ctx: CRMContext, options?: { officerId?: string }): Task[] {
    ensureSeeded();
    let tasks = getTasks().filter((t) => t.status === 'open');

    if (options?.officerId) {
      tasks = tasks.filter((t) => t.officerId === options.officerId);
    }

    // Sort by due date (earliest first)
    tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return tasks;
  },

  // Get lapsed donors (prior FY donors with zero gifts this FY)
  getLapsedDonors(ctx: CRMContext, options: { currentFyStart: string; currentFyEnd: string }): LapsedDonor[] {
    ensureSeeded();
    const currentFy = getCurrentFiscalYear();
    const priorFy = getPriorFiscalYear();

    const gifts = getGifts();
    const interactions = getInteractions();
    const constituents = getConstituents();

    // Get all prior FY donors
    const priorFyGifts = gifts.filter((g) => g.fiscalYear === priorFy);
    const priorFyDonorIds = new Set(priorFyGifts.map((g) => g.constituentId));

    // Filter to those with zero gifts in current FY
    const currentFyGifts = gifts.filter((g) => g.fiscalYear === currentFy);
    const currentFyDonorIds = new Set(currentFyGifts.map((g) => g.constituentId));

    const lapsedDonorIds = Array.from(priorFyDonorIds).filter((id) => !currentFyDonorIds.has(id));

    // Build lapsed donor records
    const lapsedDonorResults = lapsedDonorIds
      .map((constituentId) => {
        const constituent = constituents.find((c) => c.id === constituentId);
        if (!constituent) return null;

        const priorFyConstituentGifts = priorFyGifts.filter((g) => g.constituentId === constituentId);
        const priorFyTotal = priorFyConstituentGifts.reduce((sum, g) => sum + g.amount, 0);
        const lastGift = priorFyConstituentGifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        const constituentInteractions = interactions.filter((i) => i.constituentId === constituentId);
        const lastInteraction = constituentInteractions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        const sentimentInteractions = interactions.filter((i) => i.constituentId === constituentId && i.sentiment);
        const lastSentimentInteraction = sentimentInteractions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        return {
          constituentId,
          name: constituent.name,
          email: constituent.email,
          priorFyTotal,
          lastGiftDate: lastGift.date,
          lastGiftAmount: lastGift.amount,
          propensity: constituent.propensity,
          lastTouchDate: lastInteraction?.createdAt,
          lastTouchType: lastInteraction?.type,
          sentiment: lastSentimentInteraction?.sentiment,
        } as LapsedDonor;
      })
      .filter((d): d is LapsedDonor => d !== null);

    return lapsedDonorResults;
  },

  // Additional helper functions
  listGifts(ctx: CRMContext, constituentId?: string): Gift[] {
    ensureSeeded();
    let gifts = getGifts();
    if (constituentId) {
      gifts = gifts.filter((g) => g.constituentId === constituentId);
    }
    return gifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  listInteractions(ctx: CRMContext, constituentId?: string): Interaction[] {
    ensureSeeded();
    let interactions = getInteractions();
    if (constituentId) {
      interactions = interactions.filter((i) => i.constituentId === constituentId);
    }
    return interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  listTasks(ctx: CRMContext, constituentId?: string): Task[] {
    ensureSeeded();
    let tasks = getTasks();
    if (constituentId) {
      tasks = tasks.filter((t) => t.constituentId === constituentId);
    }
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  listEvents(ctx: CRMContext): Event[] {
    ensureSeeded();
    return getEvents().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  listEventParticipations(ctx: CRMContext, eventId?: string): EventParticipation[] {
    ensureSeeded();
    let participations = getEventParticipations();
    if (eventId) {
      participations = participations.filter((p) => p.eventId === eventId);
    }
    return participations;
  },

  listOrganizations(ctx: CRMContext): Organization[] {
    ensureSeeded();
    return [...getOrganizations()];
  },

  listRelationships(ctx: CRMContext, constituentId?: string): Relationship[] {
    ensureSeeded();
    let relationships = getRelationships();
    if (constituentId) {
      relationships = relationships.filter((r) => r.constituentId === constituentId || r.relatedConstituentId === constituentId);
    }
    return relationships;
  },

  // Data management
  reset(): void {
    resetData();
  },

  seed(): void {
    generateSeedData();
  },
};

