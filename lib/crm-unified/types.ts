// CRM Unified Service Types - Advancement CRM

export interface CRMContext {
  workspace: string;  // e.g., 'advancement'
  app: string;        // e.g., 'pipeline'
  userId?: string;    // Current user ID for user-specific filtering
}

// Constituent Types (formerly Contact)
export interface Constituent {
  id: string;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConstituentInput {
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
}

// Organization Types (formerly Account)
export interface Organization {
  id: string;
  name: string;
  type: 'household' | 'corporation' | 'foundation' | 'nonprofit';
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInput {
  name: string;
  type: 'household' | 'corporation' | 'foundation' | 'nonprofit';
}

// Opportunity Types (Fundraising Ask/Proposal)
export interface Opportunity {
  id: string;
  name: string;
  stage: 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed';
  status: 'open' | 'won' | 'lost' | 'closed';
  constituentId?: string;
  organizationId?: string;
  amount?: number;
  workspace: string;
  app: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityInput {
  name: string;
  stage: 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed';
  status: 'open' | 'won' | 'lost' | 'closed';
  constituentId?: string;
  organizationId?: string;
  amount?: number;
}

// Interaction Types (formerly Activity)
export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  organizationId?: string;
  opportunityId?: string;
  workspace: string;
  app: string;
  createdAt: string;
}

export interface InteractionInput {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  organizationId?: string;
  opportunityId?: string;
}

// Simulation Options
export interface SeedOptions {
  constituentCount?: number;
  organizationCount?: number;
  opportunityCount?: number;
  interactionCount?: number;
}

export interface SimulateOptions {
  days?: number;
  interactionCount?: number;
}

// CRM Provider Interface
export interface CRMProvider {
  // Constituents (formerly Contacts)
  listConstituents(ctx: CRMContext): Promise<Constituent[]>;
  getConstituent(ctx: CRMContext, id: string): Promise<Constituent | null>;
  createConstituent(ctx: CRMContext, data: ConstituentInput): Promise<Constituent>;
  updateConstituent(ctx: CRMContext, id: string, data: ConstituentInput): Promise<Constituent>;
  deleteConstituent(ctx: CRMContext, id: string): Promise<void>;

  // Organizations (formerly Accounts)
  listOrganizations(ctx: CRMContext): Promise<Organization[]>;
  getOrganization(ctx: CRMContext, id: string): Promise<Organization | null>;
  createOrganization(ctx: CRMContext, data: OrganizationInput): Promise<Organization>;
  updateOrganization(ctx: CRMContext, id: string, data: OrganizationInput): Promise<Organization>;
  deleteOrganization(ctx: CRMContext, id: string): Promise<void>;

  // Opportunities (Fundraising Asks)
  listOpportunities(ctx: CRMContext): Promise<Opportunity[]>;
  getOpportunity(ctx: CRMContext, id: string): Promise<Opportunity | null>;
  createOpportunity(ctx: CRMContext, data: OpportunityInput): Promise<Opportunity>;
  updateOpportunity(ctx: CRMContext, id: string, data: OpportunityInput): Promise<Opportunity>;
  deleteOpportunity(ctx: CRMContext, id: string): Promise<void>;

  // Interactions (formerly Activities)
  listInteractions(ctx: CRMContext, constituentId?: string): Promise<Interaction[]>;
  createInteraction(ctx: CRMContext, data: InteractionInput): Promise<Interaction>;

  // Data Simulation
  seedData(ctx: CRMContext, options: SeedOptions): Promise<void>;
  simulateInteraction(ctx: CRMContext, options: SimulateOptions): Promise<void>;
}

