// CRM Mock Adapter - Client-side adapter that calls API routes
// This adapter provides the CRM Mock interface while calling API routes that use the database

// Note: This is a client-side adapter. API routes handle the database access.

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
  OpportunityFilters,
  GiftFilters,
  PagingOptions,
  SortOptions,
  // Identity Domain
  Household,
  HouseholdMember,
  Address,
  Email,
  Phone,
  Preferences,
  Consent,
  Tag,
  ConstituentTag,
  Segment,
  SegmentMember,
  CustomFieldDefinition,
  CustomFieldValue,
  // Prospecting Domain
  ProspectProfile,
  Rating,
  Assignment,
  // Moves Management Domain
  Opportunity,
  StageHistory,
  MovePlan,
  MoveStep,
  // Gifts Domain
  GiftAllocation,
  SoftCredit,
  Pledge,
  RecurringGiftSchedule,
  Installment,
  Payment,
  Tribute,
  MatchingGift,
  Receipt,
  // Campaign Structure Domain
  Campaign,
  Appeal,
  Fund,
  Designation,
  FiscalYear,
  // Reporting Types
  LYBUNTReport,
  SYBUNTReport,
  PipelineForecast,
  RetentionReport,
} from './types';

// Helper: Convert Opportunity (won) to Gift
function opportunityToGift(opp: any): Gift {
  const date = new Date(opp.createdAt);
  const fiscalYear = getFiscalYear(date);
  
  return {
    id: opp.id,
    constituentId: opp.constituentId || '',
    amount: opp.amount || 0,
    date: opp.createdAt,
    fiscalYear,
    paymentMethod: 'other' as const,
    isAnonymous: false,
    isTribute: false,
    isMatchingGift: false,
    createdAt: opp.createdAt,
    updatedAt: opp.updatedAt,
  };
}

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

// Helper: Convert Interaction to CRM Mock Interaction
function toInteraction(interaction: any): Interaction {
  return {
    id: interaction.id,
    type: interaction.type,
    subject: interaction.subject,
    constituentId: interaction.constituentId,
    sentiment: undefined, // Not in database yet
    sentimentScore: undefined,
    createdAt: interaction.createdAt,
  };
}

// Adapter that provides CRM Mock interface using API routes
export const crmMockProvider = {
  // List constituents with filters, paging, and sorting
  async listConstituents(
    ctx: CRMContext,
    options?: {
      filters?: ConstituentFilters;
      paging?: PagingOptions;
      sort?: SortOptions;
    }
  ): Promise<Constituent[]> {
    const response = await fetch('/api/crm-mock/constituents');
    if (!response.ok) {
      throw new Error('Failed to fetch constituents');
    }
    const allConstituents = await response.json();
    
    // Convert to CRM Mock format
    let results: Constituent[] = allConstituents.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      type: c.type,
      propensity: Math.floor(Math.random() * 100), // Not in DB yet - generate random for now
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    // Apply filters
    if (options?.filters) {
      const filters = options.filters;
      const [opportunitiesRes, interactionsRes] = await Promise.all([
        fetch('/api/crm-mock/opportunities?status=won'),
        fetch('/api/crm-mock/interactions'),
      ]);
      const wonOpportunities = await opportunitiesRes.json();
      const interactions = await interactionsRes.json();

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
          const constituentGifts = wonOpportunities.filter((o: any) => o.constituentId === constituent.id);
          if (constituentGifts.length === 0) return false;
          const lastGift = constituentGifts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const daysSinceGift = Math.floor((Date.now() - new Date(lastGift.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceGift > filters.lastGiftDays) return false;
        }

        // Sentiment filter - not available in CRM Unified yet
        // if (filters.sentiment) { ... }

        return true;
      });
    }

    // Apply sorting
    if (options?.sort) {
      const { field, direction } = options.sort;
      const [opportunitiesRes, interactionsRes] = await Promise.all([
        fetch('/api/crm-mock/opportunities?status=won'),
        fetch('/api/crm-mock/interactions'),
      ]);
      const wonOpportunities = await opportunitiesRes.json();
      const interactions = await interactionsRes.json();
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
            const aGifts = wonOpportunities.filter((g: any) => g.constituentId === a.id);
            const bGifts = wonOpportunities.filter((g: any) => g.constituentId === b.id);
            aValue = aGifts.length > 0 ? new Date(aGifts.sort((x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            bValue = bGifts.length > 0 ? new Date(bGifts.sort((x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            break;
          case 'fyGiving':
            const aFyGifts = wonOpportunities.filter((g: any) => g.constituentId === a.id && getFiscalYear(new Date(g.createdAt)) === currentFy);
            const bFyGifts = wonOpportunities.filter((g: any) => g.constituentId === b.id && getFiscalYear(new Date(g.createdAt)) === currentFy);
            aValue = aFyGifts.reduce((sum: number, g: any) => sum + (g.amount || 0), 0);
            bValue = bFyGifts.reduce((sum: number, g: any) => sum + (g.amount || 0), 0);
            break;
          case 'lastTouch':
            const aInteractions = interactions.filter((i: any) => i.constituentId === a.id);
            const bInteractions = interactions.filter((i: any) => i.constituentId === b.id);
            aValue = aInteractions.length > 0 ? new Date(aInteractions.sort((x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            bValue = bInteractions.length > 0 ? new Date(bInteractions.sort((x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())[0].createdAt).getTime() : 0;
            break;
          case 'sentiment':
            // Not available in CRM Unified yet
            aValue = 0;
            bValue = 0;
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
  async getConstituent(ctx: CRMContext, id: string): Promise<ConstituentDetail | null> {
    const [constituentRes, opportunitiesRes, interactionsRes] = await Promise.all([
      fetch(`/api/crm-mock/constituents?id=${id}`),
      fetch('/api/crm-mock/opportunities?status=won'),
      fetch(`/api/crm-mock/interactions?constituentId=${id}`),
    ]);
    
    if (!constituentRes.ok) {
      return null;
    }
    
    const constituent = await constituentRes.json();
    if (!constituent) return null;

    const opportunities = await opportunitiesRes.json();
    const interactions = await interactionsRes.json();
    const wonOpportunities = opportunities.filter((o: any) => o.constituentId === id);
    const constituentInteractions = interactions;
    
    const currentFy = getCurrentFiscalYear();
    const priorFy = getPriorFiscalYear();

    // Last gift
    const sortedGifts = wonOpportunities.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastGift = sortedGifts.length > 0
      ? {
          date: sortedGifts[0].createdAt,
          amount: sortedGifts[0].amount || 0,
        }
      : undefined;

    // FY totals
    const currentFyTotal = wonOpportunities
      .filter((o: any) => getFiscalYear(new Date(o.createdAt)) === currentFy)
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const priorFyTotal = wonOpportunities
      .filter((o: any) => getFiscalYear(new Date(o.createdAt)) === priorFy)
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    // Last interaction
    const sortedInteractions = constituentInteractions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastInteraction = sortedInteractions.length > 0
      ? {
          date: sortedInteractions[0].createdAt,
          type: sortedInteractions[0].type,
          subject: sortedInteractions[0].subject,
        }
      : undefined;

    return {
      id: constituent.id,
      name: constituent.name,
      email: constituent.email,
      phone: constituent.phone,
      type: constituent.type,
      propensity: Math.floor(Math.random() * 100), // Not in DB yet
      createdAt: constituent.createdAt,
      updatedAt: constituent.updatedAt,
      lastGift,
      currentFyTotal,
      priorFyTotal,
      lastInteraction,
      sentimentTrend: undefined, // Not in DB yet
    };
  },

  // List portfolios - Not in CRM Unified yet, return empty
  async listPortfolios(ctx: CRMContext, options?: { ownerOfficerId?: string }): Promise<Portfolio[]> {
    return [];
  },

  // Get portfolio - Not in CRM Unified yet
  async getPortfolio(ctx: CRMContext, id: string): Promise<Portfolio | null> {
    return null;
  },

  // List portfolio members - Not in CRM Unified yet
  async listPortfolioMembers(ctx: CRMContext, portfolioId: string): Promise<PortfolioMember[]> {
    return [];
  },

  // Create portfolio - Not in CRM Unified yet
  async createPortfolio(ctx: CRMContext, data: { name: string; description?: string; ownerOfficerId?: string }): Promise<Portfolio> {
    throw new Error('Portfolios not yet supported in database');
  },

  // List outreach queue (tasks)
  async listOutreachQueue(ctx: CRMContext, options?: { officerId?: string }): Promise<Task[]> {
    const response = await fetch('/api/crm-mock/interactions?type=task');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const interactions = await response.json();
    
    const tasks = interactions.map((i: any) => ({
      id: i.id,
      type: 'task' as const,
      subject: i.subject,
      constituentId: i.constituentId,
      officerId: undefined, // Not in CRM Unified yet
      dueDate: undefined,
      status: 'open' as const, // Not in CRM Unified yet
      createdAt: i.createdAt,
    }));

    if (options?.officerId) {
      // Filtering by officer not supported yet
      return tasks;
    }

    return tasks;
  },

  // Get lapsed donors
  async getLapsedDonors(ctx: CRMContext, options: { currentFyStart: string; currentFyEnd: string }): Promise<LapsedDonor[]> {
    const response = await fetch('/api/crm-mock/lapsed-donors');
    if (!response.ok) {
      throw new Error('Failed to fetch lapsed donors');
    }
    return await response.json();
  },

  // List gifts (now using dedicated gifts API)
  async listGifts(ctx: CRMContext, constituentId?: string): Promise<Gift[]> {
    const url = new URL('/api/crm-mock/gifts', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch gifts');
    }
    const gifts = await response.json();
    return gifts.map((g: any) => ({
      id: g.id,
      constituentId: g.constituentId,
      amount: g.amount,
      date: g.date,
      fiscalYear: g.fiscalYear,
      fundId: g.fundId,
      appealId: g.appealId,
      campaignId: g.campaignId,
      paymentMethod: g.paymentMethod,
      paymentReference: g.paymentReference,
      isAnonymous: g.isAnonymous,
      isTribute: g.isTribute,
      isMatchingGift: g.isMatchingGift,
      receiptId: g.receiptId,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      sourceSystemRef: g.sourceSystemRef,
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // List interactions
  async listInteractions(ctx: CRMContext, constituentId?: string): Promise<Interaction[]> {
    const url = constituentId
      ? `/api/crm-mock/interactions?constituentId=${constituentId}`
      : '/api/crm-mock/interactions';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch interactions');
    }
    const interactions = await response.json();
    return interactions.map(toInteraction);
  },

  // List tasks
  async listTasks(ctx: CRMContext, constituentId?: string): Promise<Task[]> {
    const url = constituentId
      ? `/api/crm-mock/interactions?type=task&constituentId=${constituentId}`
      : '/api/crm-mock/interactions?type=task';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const interactions = await response.json();
    return interactions.map((i: any) => ({
      id: i.id,
      type: 'task' as const,
      subject: i.subject,
      constituentId: i.constituentId,
      officerId: undefined,
      dueDate: undefined,
      status: 'open' as const,
      createdAt: i.createdAt,
    }));
  },

  // List events - Not in CRM Unified yet
  async listEvents(ctx: CRMContext): Promise<Event[]> {
    const response = await fetch('/api/crm-mock/events');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return data.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      type: e.type,
      startDate: e.startDate,
      endDate: e.endDate,
      location: e.location,
      capacity: e.capacity,
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  },

  // List event participations
  async listEventParticipations(ctx: CRMContext, eventId?: string): Promise<EventParticipation[]> {
    if (!eventId) {
      return [];
    }
    const response = await fetch(`/api/crm-mock/events/${eventId}/participations`);
    if (!response.ok) {
      throw new Error('Failed to fetch event participations');
    }
    const data = await response.json();
    return data.map((ep: any) => ({
      id: ep.id,
      eventId: ep.eventId,
      constituentId: ep.constituentId,
      status: ep.status,
      registeredAt: ep.registeredAt,
      attendedAt: ep.attendedAt,
      notes: ep.notes,
      createdAt: ep.createdAt,
      updatedAt: ep.updatedAt,
    }));
  },

  // List organizations
  async listOrganizations(ctx: CRMContext): Promise<Organization[]> {
    const response = await fetch('/api/crm-mock/organizations');
    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }
    const orgs = await response.json();
    return orgs.map((o: any) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      createdAt: o.createdAt,
    }));
  },

  // List relationships
  async listRelationships(ctx: CRMContext, constituentId?: string): Promise<Relationship[]> {
    const url = new URL('/api/crm-mock/relationships', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch relationships');
    }
    const data = await response.json();
    return data.map((r: any) => ({
      id: r.id,
      constituentId1: r.constituentId1,
      constituentId2: r.constituentId2,
      type: r.type,
      reciprocalType: r.reciprocalType,
      startDate: r.startDate,
      endDate: r.endDate,
      isActive: r.isActive,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },

  // ============================================================================
  // Phase 2: Enhanced Identity Domain APIs
  // ============================================================================

  // Households
  async getHousehold(ctx: CRMContext, id: string): Promise<Household | null> {
    const response = await fetch(`/api/crm-mock/households?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch household');
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      primaryConstituentId: data.primaryConstituentId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      sourceSystemRef: data.sourceSystemRef,
    };
  },

  async listHouseholdMembers(ctx: CRMContext, householdId: string): Promise<HouseholdMember[]> {
    const response = await fetch(`/api/crm-mock/households/${householdId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch household members');
    }
    const data = await response.json();
    return data.map((m: any) => ({
      id: m.id,
      householdId: m.householdId,
      constituentId: m.constituentId,
      role: m.role,
      createdAt: m.createdAt,
    }));
  },

  // Addresses, Emails, Phones
  async listAddresses(ctx: CRMContext, constituentId?: string, householdId?: string): Promise<Address[]> {
    const url = new URL('/api/crm-mock/addresses', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    if (householdId) url.searchParams.append('householdId', householdId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }
    const data = await response.json();
    return data.map((a: any) => ({
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
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  },

  async listEmails(ctx: CRMContext, constituentId: string): Promise<Email[]> {
    const response = await fetch(`/api/crm-mock/emails?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    const data = await response.json();
    return data.map((e: any) => ({
      id: e.id,
      constituentId: e.constituentId,
      email: e.email,
      type: e.type,
      isPrimary: e.isPrimary,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  },

  async listPhones(ctx: CRMContext, constituentId: string): Promise<Phone[]> {
    const response = await fetch(`/api/crm-mock/phones?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch phones');
    }
    const data = await response.json();
    return data.map((p: any) => ({
      id: p.id,
      constituentId: p.constituentId,
      phone: p.phone,
      type: p.type,
      isPrimary: p.isPrimary,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },

  // Preferences & Consent
  async getPreferences(ctx: CRMContext, constituentId: string): Promise<Preferences | null> {
    const response = await fetch(`/api/crm-mock/preferences?constituentId=${constituentId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch preferences');
    }
    const data = await response.json();
    if (data.length === 0) return null;
    const pref = data[0];
    return {
      id: pref.id,
      constituentId: pref.constituentId,
      preferredContactMethod: pref.preferredContactMethod,
      preferredContactTime: pref.preferredContactTime,
      preferredLanguage: pref.preferredLanguage,
      doNotCall: pref.doNotCall,
      doNotEmail: pref.doNotEmail,
      doNotMail: pref.doNotMail,
      createdAt: pref.createdAt,
      updatedAt: pref.updatedAt,
    };
  },

  async listConsents(ctx: CRMContext, constituentId: string): Promise<Consent[]> {
    const response = await fetch(`/api/crm-mock/consents?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch consents');
    }
    const data = await response.json();
    return data.map((c: any) => ({
      id: c.id,
      constituentId: c.constituentId,
      type: c.type,
      status: c.status,
      grantedAt: c.grantedAt,
      revokedAt: c.revokedAt,
      expiresAt: c.expiresAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },

  // Tags & Segments
  async listTags(ctx: CRMContext): Promise<Tag[]> {
    const response = await fetch('/api/crm-mock/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    const data = await response.json();
    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      color: t.color,
      createdAt: t.createdAt,
    }));
  },

  async listConstituentTags(ctx: CRMContext, constituentId: string): Promise<Tag[]> {
    const response = await fetch(`/api/crm-mock/constituent-tags?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch constituent tags');
    }
    const data = await response.json();
    return data.map((ct: any) => ({
      id: ct.tag.id,
      name: ct.tag.name,
      category: ct.tag.category,
      color: ct.tag.color,
      createdAt: ct.tag.createdAt,
    }));
  },

  async listSegments(ctx: CRMContext): Promise<Segment[]> {
    const response = await fetch('/api/crm-mock/segments');
    if (!response.ok) {
      throw new Error('Failed to fetch segments');
    }
    const data = await response.json();
    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      criteria: s.criteria,
      memberCount: s.memberCount,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },

  async listSegmentMembers(ctx: CRMContext, segmentId: string): Promise<Constituent[]> {
    const response = await fetch(`/api/crm-mock/segments/${segmentId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch segment members');
    }
    const data = await response.json();
    return data.map((m: any) => ({
      id: m.constituent.id,
      name: m.constituent.name,
      type: m.constituent.type,
      email: m.constituent.email,
      phone: undefined,
      createdAt: m.constituent.createdAt,
      updatedAt: m.constituent.updatedAt,
    }));
  },

  // Custom Fields
  async listCustomFieldDefinitions(ctx: CRMContext): Promise<CustomFieldDefinition[]> {
    const response = await fetch('/api/crm-mock/custom-fields?isActive=true');
    if (!response.ok) {
      throw new Error('Failed to fetch custom field definitions');
    }
    const data = await response.json();
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      label: d.label,
      type: d.type,
      category: d.category,
      options: d.options,
      isRequired: d.isRequired,
      isActive: d.isActive,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },

  async listCustomFieldValues(ctx: CRMContext, constituentId: string): Promise<CustomFieldValue[]> {
    const response = await fetch(`/api/crm-mock/custom-field-values?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch custom field values');
    }
    const data = await response.json();
    return data.map((v: any) => ({
      id: v.id,
      fieldDefinitionId: v.fieldDefinitionId,
      constituentId: v.constituentId,
      value: v.value,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  },

  // ============================================================================
  // Phase 2: Prospecting Domain APIs
  // ============================================================================

  async getProspectProfile(ctx: CRMContext, constituentId: string): Promise<ProspectProfile | null> {
    const response = await fetch(`/api/crm-mock/prospect-profiles?constituentId=${constituentId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch prospect profile');
    }
    const data = await response.json();
    if (data.length === 0) return null;
    const profile = data[0];
    return {
      id: profile.id,
      constituentId: profile.constituentId,
      capacity: profile.capacity ? parseFloat(profile.capacity.toString()) : 0,
      inclination: profile.inclination,
      interests: profile.interests,
      researchNotes: profile.researchNotes,
      lastResearchedAt: profile.lastResearchedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  },

  async listRatings(ctx: CRMContext, constituentId: string): Promise<Rating[]> {
    const response = await fetch(`/api/crm-mock/ratings?constituentId=${constituentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }
    const data = await response.json();
    return data.map((r: any) => ({
      id: r.id,
      constituentId: r.constituentId,
      type: r.type,
      score: r.score,
      ratedBy: r.ratedBy,
      ratedAt: r.ratedAt,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  },

  async listAssignments(ctx: CRMContext, constituentId?: string, officerId?: string): Promise<Assignment[]> {
    const url = new URL('/api/crm-mock/assignments', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    if (officerId) url.searchParams.append('officerId', officerId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    const data = await response.json();
    return data.map((a: any) => ({
      id: a.id,
      constituentId: a.constituentId,
      officerId: a.officerId,
      role: a.role,
      assignedAt: a.assignedAt,
      assignedBy: a.assignedBy,
      unassignedAt: a.unassignedAt,
      notes: a.notes,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  },

  // ============================================================================
  // Phase 2: Moves Management Domain APIs
  // ============================================================================

  async listOpportunities(
    ctx: CRMContext,
    options?: {
      filters?: OpportunityFilters;
      paging?: PagingOptions;
      sort?: SortOptions;
    }
  ): Promise<Opportunity[]> {
    // TODO: Implement via API route with filters
    const response = await fetch('/api/crm-mock/opportunities');
    if (!response.ok) {
      throw new Error('Failed to fetch opportunities');
    }
    return await response.json();
  },

  async getOpportunity(ctx: CRMContext, id: string): Promise<Opportunity | null> {
    // TODO: Implement via API route
    const response = await fetch(`/api/crm-mock/opportunities?id=${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  },

  async createOpportunity(ctx: CRMContext, data: Partial<Opportunity>): Promise<Opportunity> {
    // TODO: Implement via API route
    throw new Error('Create opportunity not yet implemented');
  },

  async updateOpportunity(ctx: CRMContext, id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    // TODO: Implement via API route
    throw new Error('Update opportunity not yet implemented');
  },

  async transitionOpportunityStage(
    ctx: CRMContext,
    id: string,
    newStage: string,
    newStatus?: string,
    notes?: string
  ): Promise<Opportunity> {
    // Create stage history entry and update opportunity
    const response = await fetch(`/api/crm-mock/opportunities/${id}/stage-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage, status: newStatus, notes }),
    });
    if (!response.ok) {
      throw new Error('Failed to transition opportunity stage');
    }
    // Fetch updated opportunity
    return await this.getOpportunity(ctx, id) as Opportunity;
  },

  async listStageHistory(ctx: CRMContext, opportunityId: string): Promise<StageHistory[]> {
    const response = await fetch(`/api/crm-mock/opportunities/${opportunityId}/stage-history`);
    if (!response.ok) {
      throw new Error('Failed to fetch stage history');
    }
    return await response.json();
  },

  // Move Plans
  async listMovePlans(ctx: CRMContext, constituentId?: string): Promise<MovePlan[]> {
    const url = new URL('/api/crm-mock/move-plans', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch move plans');
    }
    const data = await response.json();
    return data.map((mp: any) => ({
      id: mp.id,
      constituentId: mp.constituentId,
      name: mp.name,
      description: mp.description,
      status: mp.status,
      startDate: mp.startDate,
      targetDate: mp.targetDate,
      completedDate: mp.completedDate,
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
    }));
  },

  async getMovePlan(ctx: CRMContext, id: string): Promise<MovePlan | null> {
    const response = await fetch(`/api/crm-mock/move-plans?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch move plan');
    }
    const data = await response.json();
    if (data.length === 0) return null;
    const mp = data[0];
    return {
      id: mp.id,
      constituentId: mp.constituentId,
      name: mp.name,
      description: mp.description,
      goal: '',
      status: mp.status,
      startDate: mp.startDate,
      targetDate: mp.targetDate,
      completedDate: mp.completedDate,
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
    };
  },

  async createMovePlan(ctx: CRMContext, data: Partial<MovePlan>): Promise<MovePlan> {
    const response = await fetch('/api/crm-mock/move-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create move plan');
    }
    return await response.json();
  },

  async listMoveSteps(ctx: CRMContext, movePlanId: string): Promise<MoveStep[]> {
    const response = await fetch(`/api/crm-mock/move-plans/${movePlanId}/steps`);
    if (!response.ok) {
      throw new Error('Failed to fetch move steps');
    }
    const data = await response.json();
    return data.map((s: any) => ({
      id: s.id,
      movePlanId: s.movePlanId,
      name: s.name,
      description: s.description,
      stepType: s.stepType,
      status: s.status,
      dueDate: s.dueDate,
      completedDate: s.completedDate,
      notes: s.notes,
      order: s.order,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },

  async addMoveStep(ctx: CRMContext, movePlanId: string, data: Partial<MoveStep>): Promise<MoveStep> {
    // TODO: Implement via API route
    throw new Error('Add move step not yet implemented');
  },

  async completeMoveStep(ctx: CRMContext, movePlanId: string, stepId: string): Promise<MoveStep> {
    // TODO: Implement via API route
    throw new Error('Complete move step not yet implemented');
  },

  // ============================================================================
  // Phase 2: Enhanced Gifts Domain APIs
  // ============================================================================

  async listGiftsByConstituent(
    ctx: CRMContext,
    constituentId: string,
    options?: {
      filters?: GiftFilters;
      paging?: PagingOptions;
    }
  ): Promise<Gift[]> {
    const url = new URL('/api/crm-mock/gifts', window.location.origin);
    url.searchParams.append('constituentId', constituentId);
    if (options?.filters) {
      if (options.filters.fiscalYear) url.searchParams.append('fiscalYear', options.filters.fiscalYear);
      if (options.filters.fundId) url.searchParams.append('fundId', options.filters.fundId);
      if (options.filters.campaignId) url.searchParams.append('campaignId', options.filters.campaignId);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch gifts');
    }
    const gifts = await response.json();
    return gifts.map((g: any) => ({
      id: g.id,
      constituentId: g.constituentId,
      amount: g.amount,
      date: g.date,
      fiscalYear: g.fiscalYear,
      fundId: g.fundId,
      appealId: g.appealId,
      campaignId: g.campaignId,
      paymentMethod: g.paymentMethod,
      paymentReference: g.paymentReference,
      isAnonymous: g.isAnonymous,
      isTribute: g.isTribute,
      isMatchingGift: g.isMatchingGift,
      receiptId: g.receiptId,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      sourceSystemRef: g.sourceSystemRef,
    }));
  },

  async getGift(ctx: CRMContext, id: string): Promise<Gift | null> {
    const response = await fetch(`/api/crm-mock/gifts?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch gift');
    }
    const g = await response.json();
    return {
      id: g.id,
      constituentId: g.constituentId,
      amount: g.amount,
      date: g.date,
      fiscalYear: g.fiscalYear,
      fundId: g.fundId,
      appealId: g.appealId,
      campaignId: g.campaignId,
      paymentMethod: g.paymentMethod,
      paymentReference: g.paymentReference,
      isAnonymous: g.isAnonymous,
      isTribute: g.isTribute,
      isMatchingGift: g.isMatchingGift,
      receiptId: g.receiptId,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      sourceSystemRef: g.sourceSystemRef,
    };
  },

  async listGiftAllocations(ctx: CRMContext, giftId: string): Promise<GiftAllocation[]> {
    const response = await fetch(`/api/crm-mock/gifts/${giftId}/allocations`);
    if (!response.ok) {
      throw new Error('Failed to fetch gift allocations');
    }
    const allocations = await response.json();
    return allocations.map((a: any) => ({
      id: a.id,
      giftId: a.giftId,
      fundId: a.fundId,
      fundName: a.fundName,
      designationId: a.designationId,
      designationName: a.designationName,
      amount: a.amount,
      createdAt: a.createdAt,
    }));
  },

  async listSoftCredits(ctx: CRMContext, giftId?: string, constituentId?: string): Promise<SoftCredit[]> {
    const url = new URL('/api/crm-mock/soft-credits', window.location.origin);
    if (giftId) url.searchParams.append('giftId', giftId);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch soft credits');
    }
    const data = await response.json();
    return data.map((sc: any) => ({
      id: sc.id,
      giftId: sc.giftId,
      constituentId: sc.constituentId,
      amount: parseFloat(sc.amount),
      reason: sc.reason,
      createdAt: sc.createdAt,
    }));
  },

  async listPledges(ctx: CRMContext, constituentId?: string): Promise<Pledge[]> {
    const url = new URL('/api/crm-mock/pledges', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch pledges');
    }
    const pledges = await response.json();
    return pledges.map((p: any) => ({
      id: p.id,
      constituentId: p.constituentId,
      totalAmount: p.totalAmount,
      amountPaid: p.amountPaid,
      amountRemaining: p.amountRemaining,
      pledgeDate: p.pledgeDate,
      dueDate: p.dueDate,
      fundId: p.fundId,
      appealId: p.appealId,
      campaignId: p.campaignId,
      status: p.status,
      paymentSchedule: p.paymentSchedule,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },

  async getPledge(ctx: CRMContext, id: string): Promise<Pledge | null> {
    const response = await fetch(`/api/crm-mock/pledges?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch pledge');
    }
    const p = await response.json();
    return {
      id: p.id,
      constituentId: p.constituentId,
      totalAmount: p.totalAmount,
      amountPaid: p.amountPaid,
      amountRemaining: p.amountRemaining,
      pledgeDate: p.pledgeDate,
      dueDate: p.dueDate,
      fundId: p.fundId,
      appealId: p.appealId,
      campaignId: p.campaignId,
      status: p.status,
      paymentSchedule: p.paymentSchedule,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },

  async listPledgeInstallments(ctx: CRMContext, pledgeId: string): Promise<Installment[]> {
    const pledge = await this.getPledge(ctx, pledgeId);
    if (!pledge) throw new Error('Pledge not found');
    // Installments are included in pledge response
    const response = await fetch(`/api/crm-mock/pledges?id=${pledgeId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pledge installments');
    }
    const p = await response.json();
    return (p.installments || []).map((i: any) => ({
      id: i.id,
      pledgeId: i.pledgeId,
      amount: i.amount,
      dueDate: i.dueDate,
      paidDate: i.paidDate,
      giftId: i.giftId,
      status: i.status,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  },

  async listRecurringGiftSchedules(ctx: CRMContext, constituentId?: string): Promise<RecurringGiftSchedule[]> {
    const url = new URL('/api/crm-mock/recurring-gifts', window.location.origin);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch recurring gift schedules');
    }
    const schedules = await response.json();
    return schedules.map((s: any) => ({
      id: s.id,
      constituentId: s.constituentId,
      amount: s.amount,
      frequency: s.frequency,
      startDate: s.startDate,
      endDate: s.endDate,
      fundId: s.fundId,
      paymentMethod: s.paymentMethod,
      status: s.status,
      nextGiftDate: s.nextGiftDate,
      lastGiftDate: s.lastGiftDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },

  async getRecurringGiftSchedule(ctx: CRMContext, id: string): Promise<RecurringGiftSchedule | null> {
    const response = await fetch(`/api/crm-mock/recurring-gifts?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch recurring gift schedule');
    }
    const s = await response.json();
    return {
      id: s.id,
      constituentId: s.constituentId,
      amount: s.amount,
      frequency: s.frequency,
      startDate: s.startDate,
      endDate: s.endDate,
      fundId: s.fundId,
      paymentMethod: s.paymentMethod,
      status: s.status,
      nextGiftDate: s.nextGiftDate,
      lastGiftDate: s.lastGiftDate,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },

  async listPayments(ctx: CRMContext, giftId?: string): Promise<Payment[]> {
    const url = new URL('/api/crm-mock/payments', window.location.origin);
    if (giftId) url.searchParams.append('giftId', giftId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    const data = await response.json();
    return data.map((p: any) => ({
      id: p.id,
      giftId: p.giftId,
      amount: parseFloat(p.amount),
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      paymentReference: p.paymentReference,
      processedAt: p.processedAt,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },

  async listTributes(ctx: CRMContext, giftId?: string): Promise<Tribute[]> {
    const url = new URL('/api/crm-mock/tributes', window.location.origin);
    if (giftId) url.searchParams.append('giftId', giftId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch tributes');
    }
    const data = await response.json();
    return data.map((t: any) => ({
      id: t.id,
      giftId: t.giftId,
      type: t.type,
      honoreeName: t.honoreeName,
      honoreeConstituentId: t.honoreeConstituentId,
      notificationSent: t.notificationSent,
      notificationSentAt: t.notificationSentAt,
      createdAt: t.createdAt,
    }));
  },

  async listMatchingGifts(ctx: CRMContext, giftId?: string): Promise<MatchingGift[]> {
    const url = new URL('/api/crm-mock/matching-gifts', window.location.origin);
    if (giftId) url.searchParams.append('giftId', giftId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch matching gifts');
    }
    const data = await response.json();
    return data.map((mg: any) => ({
      id: mg.id,
      giftId: mg.giftId,
      matchingCompanyId: mg.matchingCompanyId,
      matchingCompanyName: mg.matchingCompanyName,
      matchAmount: parseFloat(mg.matchAmount),
      matchRatio: parseFloat(mg.matchRatio),
      status: mg.status,
      submittedAt: mg.submittedAt,
      receivedAt: mg.receivedAt,
      createdAt: mg.createdAt,
      updatedAt: mg.updatedAt,
    }));
  },

  async listReceipts(ctx: CRMContext, giftId?: string, constituentId?: string): Promise<Receipt[]> {
    const url = new URL('/api/crm-mock/receipts', window.location.origin);
    if (giftId) url.searchParams.append('giftId', giftId);
    if (constituentId) url.searchParams.append('constituentId', constituentId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch receipts');
    }
    const data = await response.json();
    return data.map((r: any) => ({
      id: r.id,
      giftId: r.giftId,
      receiptNumber: r.receiptNumber,
      receiptDate: r.receiptDate,
      amount: parseFloat(r.amount),
      fiscalYear: r.fiscalYear,
      method: r.method,
      sentAt: r.sentAt,
      createdAt: r.createdAt,
    }));
  },

  // ============================================================================
  // Phase 2: Campaign Structure Domain APIs
  // ============================================================================

  async listCampaigns(ctx: CRMContext, fiscalYear?: string): Promise<Campaign[]> {
    const url = new URL('/api/crm-mock/campaigns', window.location.origin);
    if (fiscalYear) url.searchParams.append('fiscalYear', fiscalYear);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }
    const campaigns = await response.json();
    return campaigns.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      fiscalYear: c.fiscalYear,
      goal: c.goal,
      amountRaised: c.amountRaised,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      sourceSystemRef: c.sourceSystemRef,
    }));
  },

  async getCampaign(ctx: CRMContext, id: string): Promise<Campaign | null> {
    const response = await fetch(`/api/crm-mock/campaigns?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch campaign');
    }
    const c = await response.json();
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      fiscalYear: c.fiscalYear,
      goal: c.goal,
      amountRaised: c.amountRaised,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      sourceSystemRef: c.sourceSystemRef,
    };
  },

  async listAppeals(ctx: CRMContext, campaignId?: string, fiscalYear?: string): Promise<Appeal[]> {
    const url = new URL('/api/crm-mock/appeals', window.location.origin);
    if (campaignId) url.searchParams.append('campaignId', campaignId);
    if (fiscalYear) url.searchParams.append('fiscalYear', fiscalYear);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch appeals');
    }
    const appeals = await response.json();
    return appeals.map((a: any) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      campaignId: a.campaignId,
      fundId: a.fundId,
      startDate: a.startDate,
      endDate: a.endDate,
      fiscalYear: a.fiscalYear,
      goal: a.goal,
      amountRaised: a.amountRaised,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  },

  async getAppeal(ctx: CRMContext, id: string): Promise<Appeal | null> {
    const response = await fetch(`/api/crm-mock/appeals?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch appeal');
    }
    const a = await response.json();
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      campaignId: a.campaignId,
      fundId: a.fundId,
      startDate: a.startDate,
      endDate: a.endDate,
      fiscalYear: a.fiscalYear,
      goal: a.goal,
      amountRaised: a.amountRaised,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  },

  async listFunds(ctx: CRMContext, parentFundId?: string): Promise<Fund[]> {
    const url = new URL('/api/crm-mock/funds', window.location.origin);
    if (parentFundId) url.searchParams.append('parentFundId', parentFundId);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch funds');
    }
    const funds = await response.json();
    return funds.map((f: any) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      description: f.description,
      type: f.type,
      isActive: f.isActive,
      parentFundId: f.parentFundId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  },

  async getFund(ctx: CRMContext, id: string): Promise<Fund | null> {
    const response = await fetch(`/api/crm-mock/funds?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch fund');
    }
    const f = await response.json();
    return {
      id: f.id,
      name: f.name,
      code: f.code,
      description: f.description,
      type: f.type,
      isActive: f.isActive,
      parentFundId: f.parentFundId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    };
  },

  async listDesignations(ctx: CRMContext, fundId: string): Promise<Designation[]> {
    // TODO: Implement via API route
    return [];
  },

  async getDesignation(ctx: CRMContext, id: string): Promise<Designation | null> {
    // TODO: Implement via API route
    return null;
  },

  async listFiscalYears(ctx: CRMContext): Promise<FiscalYear[]> {
    // TODO: Implement via API route
    return [];
  },

  async getFiscalYear(ctx: CRMContext, name: string): Promise<FiscalYear | null> {
    // TODO: Implement via API route
    return null;
  },

  // ============================================================================
  // Phase 2: Enhanced Constituent 360
  // ============================================================================

  async getConstituent360(ctx: CRMContext, id: string): Promise<ConstituentDetail | null> {
    // Enhanced version with all new domains
    const constituent = await this.getConstituent(ctx, id);
    if (!constituent) return null;

    // Fetch all related data in parallel
    const [
      household,
      householdMembers,
      addresses,
      emails,
      phones,
      preferences,
      consents,
      tags,
      segments,
      customFields,
      prospectProfile,
      ratings,
      assignments,
      opportunities,
      movePlans,
      gifts,
      pledges,
      recurringGifts,
      relationships,
    ] = await Promise.all([
      constituent.householdId ? this.getHousehold(ctx, constituent.householdId) : Promise.resolve(null),
      constituent.householdId ? this.listHouseholdMembers(ctx, constituent.householdId) : Promise.resolve([]),
      this.listAddresses(ctx, id),
      this.listEmails(ctx, id),
      this.listPhones(ctx, id),
      this.getPreferences(ctx, id),
      this.listConsents(ctx, id),
      this.listConstituentTags(ctx, id),
      this.listSegments(ctx).then(segs => segs.filter(s => true)), // TODO: Filter by membership
      this.listCustomFieldValues(ctx, id),
      this.getProspectProfile(ctx, id),
      this.listRatings(ctx, id),
      this.listAssignments(ctx, id),
      this.listOpportunities(ctx, { filters: { constituentId: id } }),
      this.listMovePlans(ctx, id),
      this.listGiftsByConstituent(ctx, id),
      this.listPledges(ctx, id),
      this.listRecurringGiftSchedules(ctx, id),
      this.listRelationships(ctx, id),
    ]);

    // Calculate lifetime total
    const lifetimeTotal = gifts.reduce((sum, g) => sum + g.amount, 0);

    // Fetch household member constituents if household exists
    const householdMemberConstituents = household && householdMembers.length > 0
      ? await Promise.all(
          householdMembers.map(m => 
            this.getConstituent(ctx, m.constituentId).catch(() => null)
          )
        ).then(results => results.filter((c): c is ConstituentDetail => c !== null))
      : [];

    return {
      ...constituent,
      household: household || undefined,
      householdMembers: householdMemberConstituents.length > 0 ? householdMemberConstituents : undefined,
      addresses: addresses.length > 0 ? addresses : undefined,
      emails: emails.length > 0 ? emails : undefined,
      phones: phones.length > 0 ? phones : undefined,
      preferences: preferences || undefined,
      consents: consents.length > 0 ? consents : undefined,
      tags: tags.length > 0 ? tags : undefined,
      segments: segments.length > 0 ? segments : undefined,
      customFields: customFields.length > 0 ? customFields : undefined,
      prospectProfile: prospectProfile || undefined,
      ratings: ratings.length > 0 ? ratings : undefined,
      assignments: assignments.length > 0 ? assignments : undefined,
      opportunities: opportunities.length > 0 ? opportunities : undefined,
      movePlans: movePlans.length > 0 ? movePlans : undefined,
      gifts: gifts.length > 0 ? gifts : undefined,
      pledges: pledges.length > 0 ? pledges : undefined,
      recurringGifts: recurringGifts.length > 0 ? recurringGifts : undefined,
      relationships: relationships.length > 0 ? relationships : undefined,
      lifetimeTotal,
    };
  },

  // ============================================================================
  // Phase 2: Reporting APIs
  // ============================================================================

  async getLYBUNTReport(ctx: CRMContext, fiscalYear: string): Promise<LYBUNTReport[]> {
    // TODO: Implement via API route
    // LYBUNT = Last Year But Not This Year
    return [];
  },

  async getSYBUNTReport(ctx: CRMContext, fiscalYear: string): Promise<SYBUNTReport[]> {
    // TODO: Implement via API route
    // SYBUNT = Some Year But Not This Year
    return [];
  },

  async getPipelineForecast(ctx: CRMContext, fiscalYear?: string): Promise<PipelineForecast[]> {
    // TODO: Implement via API route
    return [];
  },

  async getRetentionReport(ctx: CRMContext, fiscalYear: string): Promise<RetentionReport> {
    // TODO: Implement via API route
    throw new Error('Retention report not yet implemented');
  },

  // ============================================================================
  // Data Management
  // ============================================================================

  async seed(): Promise<void> {
    const res = await fetch('/api/crm-mock/admin/seed', {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to seed data' }));
      throw new Error(error.error || 'Failed to seed data');
    }
  },

  async reset(): Promise<void> {
    const res = await fetch('/api/crm-mock/admin/reset', {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to reset data' }));
      throw new Error(error.error || 'Failed to reset data');
    }
  },
};

