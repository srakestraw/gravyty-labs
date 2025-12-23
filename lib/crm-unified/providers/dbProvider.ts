import { prisma } from '../../../packages/db/src';
import type {
  CRMProvider,
  CRMContext,
  Constituent,
  ConstituentInput,
  Organization,
  OrganizationInput,
  Opportunity,
  OpportunityInput,
  Interaction,
  InteractionInput,
  SeedOptions,
  SimulateOptions,
} from '../types';

// Helper to convert Prisma models to API types
function toConstituent(record: any): Constituent {
  return {
    id: record.id,
    name: record.name,
    type: record.type as 'person' | 'organization',
    email: record.email ?? undefined,
    phone: record.phone ?? undefined,
    workspace: record.workspace,
    app: record.app,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toOrganization(record: any): Organization {
  return {
    id: record.id,
    name: record.name,
    type: record.type as 'household' | 'corporation' | 'foundation' | 'nonprofit',
    workspace: record.workspace,
    app: record.app,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toOpportunity(record: any): Opportunity {
  return {
    id: record.id,
    name: record.name,
    stage: record.stage as 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed',
    status: record.status as 'open' | 'won' | 'lost' | 'closed',
    constituentId: record.constituentId ?? undefined,
    organizationId: record.organizationId ?? undefined,
    amount: record.amount ? Number(record.amount) : undefined,
    workspace: record.workspace,
    app: record.app,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toInteraction(record: any): Interaction {
  return {
    id: record.id,
    type: record.type as 'call' | 'email' | 'meeting' | 'note' | 'task',
    subject: record.subject,
    constituentId: record.constituentId ?? undefined,
    organizationId: record.organizationId ?? undefined,
    opportunityId: record.opportunityId ?? undefined,
    workspace: record.workspace,
    app: record.app,
    createdAt: record.createdAt.toISOString(),
  };
}

export const dbProvider: CRMProvider = {
  // Constituents (formerly Contacts)
  async listConstituents(ctx: CRMContext): Promise<Constituent[]> {
    const records = await prisma.crmConstituent.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map(toConstituent);
  },

  async getConstituent(ctx: CRMContext, id: string): Promise<Constituent | null> {
    const record = await prisma.crmConstituent.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    return record ? toConstituent(record) : null;
  },

  async createConstituent(ctx: CRMContext, data: ConstituentInput): Promise<Constituent> {
    const record = await prisma.crmConstituent.create({
      data: {
        workspace: ctx.workspace,
        app: ctx.app,
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
      },
    });
    return toConstituent(record);
  },

  async updateConstituent(ctx: CRMContext, id: string, data: ConstituentInput): Promise<Constituent> {
    const record = await prisma.crmConstituent.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
      },
    });
    // Verify workspace/app match
    if (record.workspace !== ctx.workspace || record.app !== ctx.app) {
      throw new Error('Constituent not found in specified workspace/app');
    }
    return toConstituent(record);
  },

  async deleteConstituent(ctx: CRMContext, id: string): Promise<void> {
    // Verify workspace/app match before delete
    const existing = await prisma.crmConstituent.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    if (!existing) {
      throw new Error('Constituent not found');
    }
    // Cascade delete handled by Prisma schema
    await prisma.crmConstituent.delete({
      where: { id },
    });
  },

  // Organizations (formerly Accounts)
  async listOrganizations(ctx: CRMContext): Promise<Organization[]> {
    const records = await prisma.crmOrganization.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map(toOrganization);
  },

  async getOrganization(ctx: CRMContext, id: string): Promise<Organization | null> {
    const record = await prisma.crmOrganization.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    return record ? toOrganization(record) : null;
  },

  async createOrganization(ctx: CRMContext, data: OrganizationInput): Promise<Organization> {
    const record = await prisma.crmOrganization.create({
      data: {
        workspace: ctx.workspace,
        app: ctx.app,
        name: data.name,
        type: data.type,
      },
    });
    return toOrganization(record);
  },

  async updateOrganization(ctx: CRMContext, id: string, data: OrganizationInput): Promise<Organization> {
    const record = await prisma.crmOrganization.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        type: data.type,
      },
    });
    // Verify workspace/app match
    if (record.workspace !== ctx.workspace || record.app !== ctx.app) {
      throw new Error('Organization not found in specified workspace/app');
    }
    return toOrganization(record);
  },

  async deleteOrganization(ctx: CRMContext, id: string): Promise<void> {
    // Verify workspace/app match before delete
    const existing = await prisma.crmOrganization.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    if (!existing) {
      throw new Error('Organization not found');
    }
    // Cascade delete handled by Prisma schema
    await prisma.crmOrganization.delete({
      where: { id },
    });
  },

  // Opportunities (Fundraising Asks)
  async listOpportunities(ctx: CRMContext): Promise<Opportunity[]> {
    const records = await prisma.crmOpportunity.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map(toOpportunity);
  },

  async getOpportunity(ctx: CRMContext, id: string): Promise<Opportunity | null> {
    const record = await prisma.crmOpportunity.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    return record ? toOpportunity(record) : null;
  },

  async createOpportunity(ctx: CRMContext, data: OpportunityInput): Promise<Opportunity> {
    // Verify constituent/organization exists if provided
    if (data.constituentId) {
      const constituent = await prisma.crmConstituent.findFirst({
        where: {
          id: data.constituentId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!constituent) {
        throw new Error('Constituent not found');
      }
    }
    if (data.organizationId) {
      const organization = await prisma.crmOrganization.findFirst({
        where: {
          id: data.organizationId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!organization) {
        throw new Error('Organization not found');
      }
    }

    const record = await prisma.crmOpportunity.create({
      data: {
        workspace: ctx.workspace,
        app: ctx.app,
        name: data.name,
        stage: data.stage,
        status: data.status,
        constituentId: data.constituentId,
        organizationId: data.organizationId,
        amount: data.amount ? data.amount : null,
      },
    });
    return toOpportunity(record);
  },

  async updateOpportunity(ctx: CRMContext, id: string, data: OpportunityInput): Promise<Opportunity> {
    // Verify constituent/organization exists if provided
    if (data.constituentId) {
      const constituent = await prisma.crmConstituent.findFirst({
        where: {
          id: data.constituentId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!constituent) {
        throw new Error('Constituent not found');
      }
    }
    if (data.organizationId) {
      const organization = await prisma.crmOrganization.findFirst({
        where: {
          id: data.organizationId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!organization) {
        throw new Error('Organization not found');
      }
    }

    const record = await prisma.crmOpportunity.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        stage: data.stage,
        status: data.status,
        constituentId: data.constituentId,
        organizationId: data.organizationId,
        amount: data.amount ? data.amount : null,
      },
    });
    // Verify workspace/app match
    if (record.workspace !== ctx.workspace || record.app !== ctx.app) {
      throw new Error('Opportunity not found in specified workspace/app');
    }
    return toOpportunity(record);
  },

  async deleteOpportunity(ctx: CRMContext, id: string): Promise<void> {
    // Verify workspace/app match before delete
    const existing = await prisma.crmOpportunity.findFirst({
      where: {
        id,
        workspace: ctx.workspace,
        app: ctx.app,
      },
    });
    if (!existing) {
      throw new Error('Opportunity not found');
    }
    // Cascade delete handled by Prisma schema
    await prisma.crmOpportunity.delete({
      where: { id },
    });
  },

  // Interactions (formerly Activities)
  async listInteractions(ctx: CRMContext, constituentId?: string): Promise<Interaction[]> {
    const where: any = {
      workspace: ctx.workspace,
      app: ctx.app,
    };
    if (constituentId) {
      where.constituentId = constituentId;
    }
    const records = await prisma.crmInteraction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map(toInteraction);
  },

  async createInteraction(ctx: CRMContext, data: InteractionInput): Promise<Interaction> {
    // Verify related records exist if provided
    if (data.constituentId) {
      const constituent = await prisma.crmConstituent.findFirst({
        where: {
          id: data.constituentId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!constituent) {
        throw new Error('Constituent not found');
      }
    }
    if (data.organizationId) {
      const organization = await prisma.crmOrganization.findFirst({
        where: {
          id: data.organizationId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!organization) {
        throw new Error('Organization not found');
      }
    }
    if (data.opportunityId) {
      const opportunity = await prisma.crmOpportunity.findFirst({
        where: {
          id: data.opportunityId,
          workspace: ctx.workspace,
          app: ctx.app,
        },
      });
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }
    }

    const record = await prisma.crmInteraction.create({
      data: {
        workspace: ctx.workspace,
        app: ctx.app,
        type: data.type,
        subject: data.subject,
        constituentId: data.constituentId,
        organizationId: data.organizationId,
        opportunityId: data.opportunityId,
      },
    });
    return toInteraction(record);
  },

  // Data Simulation
  async seedData(ctx: CRMContext, options: SeedOptions): Promise<void> {
    const constituentCount = options.constituentCount ?? 50;
    const organizationCount = options.organizationCount ?? 10;
    const opportunityCount = options.opportunityCount ?? 25;
    const interactionCount = options.interactionCount ?? 100;

    // Generate constituents
    const constituents: any[] = [];
    for (let i = 0; i < constituentCount; i++) {
      constituents.push({
        workspace: ctx.workspace,
        app: ctx.app,
        name: `Constituent ${i + 1}`,
        type: i % 3 === 0 ? 'organization' : 'person',
        email: `constituent${i + 1}@example.com`,
        phone: `555-${String(i + 1).padStart(4, '0')}`,
      });
    }
    await prisma.crmConstituent.createMany({
      data: constituents,
      skipDuplicates: true,
    });

    // Generate organizations
    const organizations: any[] = [];
    const orgTypes: ('household' | 'corporation' | 'foundation' | 'nonprofit')[] = ['household', 'corporation', 'foundation', 'nonprofit'];
    for (let i = 0; i < organizationCount; i++) {
      organizations.push({
        workspace: ctx.workspace,
        app: ctx.app,
        name: `Organization ${i + 1}`,
        type: orgTypes[i % orgTypes.length],
      });
    }
    await prisma.crmOrganization.createMany({
      data: organizations,
      skipDuplicates: true,
    });

    // Get created constituents and organizations for relationships
    const createdConstituents = await prisma.crmConstituent.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: constituentCount,
    });
    const createdOrganizations = await prisma.crmOrganization.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: organizationCount,
    });

    // Generate opportunities linked to constituents/organizations
    const opportunities: any[] = [];
    const stages: ('prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed')[] = ['prospecting', 'cultivation', 'solicitation', 'stewardship', 'closed'];
    const statuses: ('open' | 'won' | 'lost' | 'closed')[] = ['open', 'won', 'lost', 'closed'];
    for (let i = 0; i < opportunityCount; i++) {
      const constituent = createdConstituents[i % createdConstituents.length];
      const organization = createdOrganizations[i % createdOrganizations.length];
      opportunities.push({
        workspace: ctx.workspace,
        app: ctx.app,
        name: `Fundraising Ask ${i + 1}`,
        stage: stages[i % stages.length],
        status: statuses[i % statuses.length],
        constituentId: constituent?.id,
        organizationId: organization?.id,
        amount: Math.floor(Math.random() * 100000) + 1000,
      });
    }
    await prisma.crmOpportunity.createMany({
      data: opportunities,
      skipDuplicates: true,
    });

    // Get created opportunities for interactions
    const createdOpportunities = await prisma.crmOpportunity.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: opportunityCount,
    });

    // Generate interactions
    const interactions: any[] = [];
    const interactionTypes: ('call' | 'email' | 'meeting' | 'note' | 'task')[] = ['call', 'email', 'meeting', 'note', 'task'];
    for (let i = 0; i < interactionCount; i++) {
      const constituent = createdConstituents[i % createdConstituents.length];
      const organization = createdOrganizations[i % createdOrganizations.length];
      const opportunity = createdOpportunities[i % createdOpportunities.length];
      interactions.push({
        workspace: ctx.workspace,
        app: ctx.app,
        type: interactionTypes[i % interactionTypes.length],
        subject: `Interaction ${i + 1}`,
        constituentId: constituent?.id,
        organizationId: organization?.id,
        opportunityId: opportunity?.id,
      });
    }
    await prisma.crmInteraction.createMany({
      data: interactions,
      skipDuplicates: true,
    });
  },

  async simulateInteraction(ctx: CRMContext, options: SimulateOptions): Promise<void> {
    const days = options.days ?? 7;
    const interactionCount = options.interactionCount ?? 20;

    // Get existing constituents, organizations, and opportunities
    const constituents = await prisma.crmConstituent.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: 10,
    });
    const organizations = await prisma.crmOrganization.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: 5,
    });
    const opportunities = await prisma.crmOpportunity.findMany({
      where: {
        workspace: ctx.workspace,
        app: ctx.app,
      },
      take: 10,
    });

    if (constituents.length === 0 && organizations.length === 0 && opportunities.length === 0) {
      throw new Error('No constituents, organizations, or opportunities found. Seed data first.');
    }

    // Generate time-based interactions
    const interactions: any[] = [];
    const interactionTypes: ('call' | 'email' | 'meeting' | 'note' | 'task')[] = ['call', 'email', 'meeting', 'note', 'task'];
    const now = new Date();
    
    for (let i = 0; i < interactionCount; i++) {
      const daysAgo = Math.floor(Math.random() * days);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const constituent = constituents.length > 0 ? constituents[i % constituents.length] : null;
      const organization = organizations.length > 0 ? organizations[i % organizations.length] : null;
      const opportunity = opportunities.length > 0 ? opportunities[i % opportunities.length] : null;

      interactions.push({
        workspace: ctx.workspace,
        app: ctx.app,
        type: interactionTypes[i % interactionTypes.length],
        subject: `Simulated Interaction ${i + 1}`,
        constituentId: constituent?.id,
        organizationId: organization?.id,
        opportunityId: opportunity?.id,
        createdAt,
      });
    }

    await prisma.crmInteraction.createMany({
      data: interactions,
      skipDuplicates: true,
    });
  },
};
