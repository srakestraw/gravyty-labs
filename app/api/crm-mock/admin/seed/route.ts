import { NextResponse } from 'next/server';





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

// Helper: Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Generate name
function generateName(index: number): string {
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
    'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  ];
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return `${firstName} ${lastName}`;
}

export async function POST() {
  try {
    console.log('🌱 Starting CRM Mock Phase A seed (2 years of data)...');

    // Clear existing CRM Mock data (in reverse order of dependencies)
    console.log('🧹 Clearing existing CRM Mock data...');
    await prisma.crmAuditLog.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get pledges first to delete installments
    const existingPledges = await prisma.crmPledge.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingPledges.length > 0) {
      await prisma.crmPledgeInstallment.deleteMany({
        where: { pledgeId: { in: existingPledges.map((p: { id: string }) => p.id) } },
      });
    }
    
    await prisma.crmPledge.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmRecurringGiftSchedule.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get gifts first to delete allocations, soft credits, matching gifts, tributes, receipts, payments
    const existingGifts = await prisma.crmGift.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingGifts.length > 0) {
      await prisma.crmGiftAllocation.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmSoftCredit.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmMatchingGift.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmTribute.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmReceipt.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
      await prisma.crmPayment.deleteMany({
        where: { giftId: { in: existingGifts.map((g: { id: string }) => g.id) } },
      });
    }
    
    await prisma.crmGift.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get opportunities first to delete stage history
    const existingOpportunities = await prisma.crmOpportunity.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingOpportunities.length > 0) {
      await prisma.crmOpportunityStageHistory.deleteMany({
        where: { opportunityId: { in: existingOpportunities.map((o: { id: string }) => o.id) } },
      });
    }
    
    await prisma.crmInteraction.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmOpportunity.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get households first to delete members
    const existingHouseholds = await prisma.crmHousehold.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingHouseholds.length > 0) {
      await prisma.crmHouseholdMember.deleteMany({
        where: { householdId: { in: existingHouseholds.map((h: { id: string }) => h.id) } },
      });
    }
    
    await prisma.crmHousehold.deleteMany({ where: CRM_MOCK_CTX });
    
    // Phase B: Delete preferences, consents, custom fields, segments
    await prisma.crmPreferences.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmConsent.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get custom field definitions first to delete values
    const existingCustomFields = await prisma.crmCustomFieldDefinition.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingCustomFields.length > 0) {
      await prisma.crmCustomFieldValue.deleteMany({
        where: { fieldDefinitionId: { in: existingCustomFields.map((f: { id: string }) => f.id) } },
      });
    }
    await prisma.crmCustomFieldDefinition.deleteMany({ where: CRM_MOCK_CTX });
    
    // Get segments first to delete members
    const existingSegments = await prisma.crmSegment.findMany({ where: CRM_MOCK_CTX, select: { id: true } });
    if (existingSegments.length > 0) {
      await prisma.crmSegmentMember.deleteMany({
        where: { segmentId: { in: existingSegments.map((s: { id: string }) => s.id) } },
      });
    }
    await prisma.crmSegment.deleteMany({ where: CRM_MOCK_CTX });
    
    await prisma.crmDesignation.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmFund.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmAppeal.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmCampaign.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmOrganization.deleteMany({ where: CRM_MOCK_CTX });
    await prisma.crmConstituent.deleteMany({ where: CRM_MOCK_CTX });

    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 24);

    // Generate 300 constituents
    console.log('📝 Generating 300 constituents...');
    const constituents: any[] = [];
    for (let i = 0; i < 300; i++) {
      const createdAt = randomDate(twoYearsAgo, now);
      const isOrg = i % 10 === 0;
      constituents.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name: isOrg ? `${generateName(i)} Foundation` : generateName(i),
        type: isOrg ? 'organization' : 'person',
        email: `${generateName(i).toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `555-${String(i + 1).padStart(4, '0')}`,
        createdAt,
        updatedAt: createdAt,
      });
    }

    const createdConstituents = await prisma.crmConstituent.createMany({
      data: constituents,
    });
    console.log(`  ✓ Created ${createdConstituents.count} constituents`);

    const constituentRecords = await prisma.crmConstituent.findMany({
      where: CRM_MOCK_CTX,
    });

    // Generate 30 organizations
    console.log('🏢 Generating 30 organizations...');
    const organizations: any[] = [];
    const orgTypes: ('household' | 'corporation' | 'foundation' | 'nonprofit')[] = [
      'household', 'household', 'household',
      'corporation', 'corporation', 'corporation', 'corporation', 'corporation',
      'foundation', 'foundation', 'foundation',
      'nonprofit', 'nonprofit', 'nonprofit',
    ];
    for (let i = 0; i < 30; i++) {
      const createdAt = randomDate(twoYearsAgo, now);
      organizations.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        name: `Organization ${i + 1}`,
        type: orgTypes[i % orgTypes.length],
        createdAt,
        updatedAt: createdAt,
      });
    }

    const createdOrganizations = await prisma.crmOrganization.createMany({
      data: organizations,
    });
    console.log(`  ✓ Created ${createdOrganizations.count} organizations`);

    // Generate 100 households with 2-4 members each
    console.log('🏠 Generating 100 households...');
    const personConstituents = constituentRecords.filter((c: { type: string }) => c.type === 'person');
    const households: any[] = [];
    const householdMembers: any[] = [];
    let memberIndex = 0;

    for (let i = 0; i < 100 && memberIndex < personConstituents.length; i++) {
      const primary = personConstituents[memberIndex];
      const memberCount = Math.floor(Math.random() * 3) + 2; // 2-4 members
      const createdAt = randomDate(twoYearsAgo, now);

      const household = await prisma.crmHousehold.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: `${primary.name.split(' ')[1]} Family`,
          primaryConstituentId: primary.id,
          createdAt,
          updatedAt: createdAt,
        },
      });

      households.push(household);

      // Add primary constituent to household
      await prisma.crmHouseholdMember.create({
        data: {
          householdId: household.id,
          constituentId: primary.id,
          role: 'primary',
        },
      });

      // Update constituent with householdId
      await prisma.crmConstituent.update({
        where: { id: primary.id },
        data: { householdId: household.id },
      });

      // Add additional members
      for (let j = 1; j < memberCount && memberIndex + j < personConstituents.length; j++) {
        const member = personConstituents[memberIndex + j];
        const roles: ('spouse' | 'child' | 'other')[] = ['spouse', 'child', 'other'];
        await prisma.crmHouseholdMember.create({
          data: {
            householdId: household.id,
            constituentId: member.id,
            role: roles[j % roles.length],
          },
        });
        await prisma.crmConstituent.update({
          where: { id: member.id },
          data: { householdId: household.id },
        });
      }

      memberIndex += memberCount;
    }
    console.log(`  ✓ Created ${households.length} households`);

    // Generate fiscal years
    const currentFy = getFiscalYear(now);
    const priorFy = `FY${parseInt(currentFy.replace('FY', '')) - 1}`;

    // Generate 15 campaigns (spanning 2 fiscal years)
    console.log('📢 Generating 15 campaigns...');
    const campaigns: any[] = [];
    for (let i = 0; i < 15; i++) {
      const fy = i < 8 ? priorFy : currentFy;
      const startDate = new Date(fy === priorFy ? 2023 : 2024, 6, 1); // July 1
      startDate.setMonth(startDate.getMonth() + (i % 6));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);

      const campaign = await prisma.crmCampaign.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: `Campaign ${i + 1}`,
          description: `Campaign ${i + 1} description`,
          startDate,
          endDate,
          fiscalYear: fy,
          goal: Math.floor(Math.random() * 5000000) + 1000000,
          status: i < 10 ? 'active' : 'completed',
          createdAt: startDate,
          updatedAt: startDate,
        },
      });
      campaigns.push(campaign);
    }
    console.log(`  ✓ Created ${campaigns.length} campaigns`);

    // Generate 30 funds
    console.log('💰 Generating 30 funds...');
    const funds: any[] = [];
    const fundTypes: ('unrestricted' | 'restricted' | 'endowment' | 'scholarship' | 'other')[] = [
      'unrestricted', 'unrestricted', 'unrestricted',
      'restricted', 'restricted',
      'endowment', 'endowment',
      'scholarship', 'scholarship',
      'other',
    ];
    const fundNames = [
      'Annual Fund', 'Scholarship Fund', 'Capital Campaign', 'Endowment', 'General',
      'Research Fund', 'Athletics Fund', 'Arts Fund', 'Library Fund', 'Scholarship Fund',
    ];

    for (let i = 0; i < 30; i++) {
      const fund = await prisma.crmFund.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: `${fundNames[i % fundNames.length]} ${Math.floor(i / fundNames.length) + 1}`,
          code: `FUND-${String(i + 1).padStart(3, '0')}`,
          description: `${fundNames[i % fundNames.length]} description`,
          type: fundTypes[i % fundTypes.length],
          isActive: true,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        },
      });
      funds.push(fund);
    }
    console.log(`  ✓ Created ${funds.length} funds`);

    // Generate 40 appeals
    console.log('📧 Generating 40 appeals...');
    const appeals: any[] = [];
    for (let i = 0; i < 40; i++) {
      const campaign = campaigns[i % campaigns.length];
      const fund = funds[i % funds.length];
      const startDate = new Date(campaign.startDate);
      startDate.setMonth(startDate.getMonth() + (i % 3));

      const appeal = await prisma.crmAppeal.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: `Appeal ${i + 1}`,
          description: `Appeal ${i + 1} description`,
          campaignId: campaign.id,
          fundId: fund.id,
          startDate,
          endDate: campaign.endDate,
          fiscalYear: campaign.fiscalYear,
          goal: Math.floor(Math.random() * 500000) + 50000,
          status: campaign.status,
          createdAt: startDate,
          updatedAt: startDate,
        },
      });
      appeals.push(appeal);
    }
    console.log(`  ✓ Created ${appeals.length} appeals`);

    // Generate 300 opportunities with stage history
    console.log('🎯 Generating 300 opportunities with stage history...');
    const opportunities: any[] = [];
    const stages: ('prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed')[] = [
      'prospecting', 'cultivation', 'solicitation', 'stewardship', 'closed',
    ];
    const statuses: ('open' | 'won' | 'lost' | 'closed')[] = ['open', 'won', 'lost', 'closed'];

    for (let i = 0; i < 300; i++) {
      const constituent = constituentRecords[i % constituentRecords.length];
      const campaign = campaigns[i % campaigns.length];
      const appeal = appeals[i % appeals.length];
      const fund = funds[i % funds.length];
      const stage = stages[i % stages.length];
      const status = statuses[i % statuses.length];
      const createdAt = randomDate(twoYearsAgo, now);

      const opportunity = await prisma.crmOpportunity.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: `Opportunity ${i + 1}`,
          stage,
          status,
          constituentId: constituent.type === 'person' ? constituent.id : null,
          organizationId: constituent.type === 'organization' ? constituent.id : null,
          amount: Math.floor(Math.random() * 100000) + 5000,
          expectedAmount: Math.floor(Math.random() * 100000) + 5000,
          expectedCloseDate: randomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
          probability: Math.floor(Math.random() * 100),
          fundId: fund.id,
          appealId: appeal.id,
          campaignId: campaign.id,
          createdAt,
          updatedAt: createdAt,
        },
      });
      opportunities.push(opportunity);

      // Generate stage history (2-4 transitions per opportunity)
      const transitionCount = Math.floor(Math.random() * 3) + 2;
      const stageHistory: any[] = [];
      let currentStage: 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed' = 'prospecting';
      let currentStatus = 'open';

      for (let j = 0; j < transitionCount; j++) {
        const stageIndex = stages.indexOf(currentStage);
        if (stageIndex < stages.length - 1) {
          currentStage = stages[stageIndex + 1] as 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed';
        }
        if (j === transitionCount - 1 && status === 'won') {
          currentStatus = 'won';
        } else if (j === transitionCount - 1 && status === 'lost') {
          currentStatus = 'lost';
        }

        const changedAt = new Date(createdAt);
        changedAt.setDate(changedAt.getDate() + (j * 30));

        stageHistory.push({
          opportunityId: opportunity.id,
          stage: currentStage as 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed',
          status: currentStatus,
          changedAt,
          changedBy: `user-${Math.floor(Math.random() * 10) + 1}`,
          notes: `Transitioned to ${currentStage}`,
        });
      }

      if (stageHistory.length > 0) {
        await prisma.crmOpportunityStageHistory.createMany({
          data: stageHistory,
        });
      }
    }
    console.log(`  ✓ Created ${opportunities.length} opportunities with stage history`);

    // Generate 2,000 gifts with allocations
    console.log('🎁 Generating 2,000 gifts with allocations...');
    const giftAmounts = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
    const giftPaymentMethods: ('check' | 'credit-card' | 'wire' | 'stock' | 'other')[] = [
      'check', 'credit-card', 'credit-card', 'wire', 'other',
    ];
    const createdGifts: Array<{ id: string; amount: number; createdAt: Date; date: Date; fiscalYear: string; constituentId: string }> = [];

    for (let i = 0; i < 2000; i++) {
      const constituent = personConstituents[i % personConstituents.length];
      const giftDate = randomDate(twoYearsAgo, now);
      const fiscalYear = getFiscalYear(giftDate);
      const amount = giftAmounts[Math.floor(Math.random() * giftAmounts.length)];
      const campaign = campaigns[i % campaigns.length];
      const appeal = appeals[i % appeals.length];
      const fund = funds[i % funds.length];

      const gift = await prisma.crmGift.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          amount,
          date: giftDate,
          fiscalYear,
          fundId: fund.id,
          appealId: appeal.id,
          campaignId: campaign.id,
          paymentMethod: giftPaymentMethods[i % giftPaymentMethods.length],
          paymentReference: `REF-${String(i + 1).padStart(6, '0')}`,
          isAnonymous: i % 20 === 0,
          isTribute: i % 15 === 0,
          isMatchingGift: i % 25 === 0,
          createdAt: giftDate,
          updatedAt: giftDate,
        },
      });
      
      // Store gift for Phase B seed data
      createdGifts.push({
        id: gift.id,
        amount: parseFloat(gift.amount.toString()),
        createdAt: gift.createdAt,
        date: gift.date,
        fiscalYear: gift.fiscalYear,
        constituentId: gift.constituentId,
      });

      // Generate 1-3 allocations per gift (split across funds)
      const allocationCount = Math.floor(Math.random() * 3) + 1;
      const allocationAmount = amount / allocationCount;

      for (let j = 0; j < allocationCount; j++) {
        const allocationFund = funds[(i + j) % funds.length];
        await prisma.crmGiftAllocation.create({
          data: {
            giftId: gift.id,
            fundId: allocationFund.id,
            amount: allocationAmount,
          },
        });
      }
    }
    console.log(`  ✓ Created 2,000 gifts with allocations`);

    // Generate 200 pledges with installments
    console.log('📋 Generating 200 pledges with installments...');
    for (let i = 0; i < 200; i++) {
      const constituent = personConstituents[i % personConstituents.length];
      const pledgeDate = randomDate(twoYearsAgo, now);
      const totalAmount = giftAmounts[Math.floor(Math.random() * giftAmounts.length)] * (Math.floor(Math.random() * 3) + 1);
      const paymentSchedule: ('one-time' | 'installments' | 'recurring')[] = ['one-time', 'installments', 'recurring'];
      const schedule = paymentSchedule[i % paymentSchedule.length];
      const dueDate = new Date(pledgeDate);
      dueDate.setFullYear(dueDate.getFullYear() + 1);

      const amountPaid = Math.floor(totalAmount * Math.random() * 0.7);
      const amountRemaining = totalAmount - amountPaid;

      const pledge = await prisma.crmPledge.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          totalAmount,
          amountPaid,
          amountRemaining,
          pledgeDate,
          dueDate,
          fundId: funds[i % funds.length].id,
          appealId: appeals[i % appeals.length].id,
          campaignId: campaigns[i % campaigns.length].id,
          status: amountRemaining <= 0 ? 'fulfilled' : (i % 20 === 0 ? 'overdue' : 'active'),
          paymentSchedule: schedule,
          createdAt: pledgeDate,
          updatedAt: pledgeDate,
        },
      });

      // Generate installments for installment pledges
      if (schedule === 'installments') {
        const installmentCount = Math.floor(Math.random() * 4) + 2; // 2-5 installments
        const installmentAmount = totalAmount / installmentCount;

        for (let j = 0; j < installmentCount; j++) {
          const dueDate = new Date(pledgeDate);
          dueDate.setMonth(dueDate.getMonth() + (j * 3)); // Every 3 months

          await prisma.crmPledgeInstallment.create({
            data: {
              pledgeId: pledge.id,
              amount: installmentAmount,
              dueDate,
              status: j < Math.floor(installmentCount * 0.5) ? 'paid' : 'pending',
              createdAt: pledgeDate,
              updatedAt: pledgeDate,
            },
          });
        }
      }
    }
    console.log(`  ✓ Created 200 pledges with installments`);

    // Generate 100 recurring gift schedules
    console.log('🔄 Generating 100 recurring gift schedules...');
    const frequencies: ('monthly' | 'quarterly' | 'annually')[] = ['monthly', 'quarterly', 'annually'];
    const recurringPaymentMethods: ('credit-card' | 'ach' | 'check')[] = ['credit-card', 'ach', 'check'];

    for (let i = 0; i < 100; i++) {
      const constituent = personConstituents[i % personConstituents.length];
      const startDate = randomDate(twoYearsAgo, now);
      const frequency = frequencies[i % frequencies.length];
      const amount = giftAmounts[Math.floor(Math.random() * 5) + 1]; // Smaller amounts for recurring

      // Calculate next gift date based on frequency
      const nextGiftDate = new Date(startDate);
      if (frequency === 'monthly') {
        nextGiftDate.setMonth(nextGiftDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        nextGiftDate.setMonth(nextGiftDate.getMonth() + 3);
      } else {
        nextGiftDate.setFullYear(nextGiftDate.getFullYear() + 1);
      }

      await prisma.crmRecurringGiftSchedule.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          amount,
          frequency,
          startDate,
          endDate: null,
          fundId: funds[i % funds.length].id,
          paymentMethod: recurringPaymentMethods[i % recurringPaymentMethods.length],
          status: i % 10 === 0 ? 'paused' : 'active',
          nextGiftDate,
          lastGiftDate: i > 50 ? randomDate(startDate, now) : null,
          createdAt: startDate,
          updatedAt: startDate,
        },
      });
    }
    console.log(`  ✓ Created 100 recurring gift schedules`);

    // Generate 1,500 interactions
    console.log('💬 Generating 1,500 interactions...');
    const interactionTypes: ('call' | 'email' | 'meeting' | 'note' | 'task')[] = [
      'call', 'email', 'email', 'meeting', 'note', 'task',
    ];
    const interactionSubjects = [
      'Initial outreach call', 'Follow-up email', 'Donor meeting scheduled', 'Thank you note sent',
      'Proposal discussion', 'Stewardship update', 'Event invitation', 'Next steps planning',
      'Cultivation touchpoint', 'Solicitation call',
    ];

    const interactions: any[] = [];
    for (let i = 0; i < 1500; i++) {
      const constituent = constituentRecords[i % constituentRecords.length];
      const opportunity = opportunities[i % opportunities.length];
      const createdAt = randomDate(twoYearsAgo, now);

      interactions.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        type: interactionTypes[i % interactionTypes.length],
        subject: `${interactionSubjects[i % interactionSubjects.length]} ${i + 1}`,
        constituentId: constituent.id,
        opportunityId: opportunity.id,
        createdAt,
      });
    }

    await prisma.crmInteraction.createMany({
      data: interactions,
    });
    console.log(`  ✓ Created ${interactions.length} interactions`);

    // Generate audit logs for all creates
    console.log('📝 Generating audit logs...');
    const auditLogs: any[] = [];

    // Log constituent creates
    for (const constituent of constituentRecords.slice(0, 100)) {
      auditLogs.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        entityType: 'Constituent',
        entityId: constituent.id,
        action: 'create',
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        createdAt: constituent.createdAt,
      });
    }

    // Log gift creates
    const gifts = await prisma.crmGift.findMany({
      where: CRM_MOCK_CTX,
      take: 500,
    });
    for (const gift of gifts) {
      auditLogs.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        entityType: 'Gift',
        entityId: gift.id,
        action: 'create',
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        createdAt: gift.createdAt,
      });
    }

    if (auditLogs.length > 0) {
      await prisma.crmAuditLog.createMany({
        data: auditLogs,
      });
    }
    console.log(`  ✓ Created ${auditLogs.length} audit logs`);

    // ============================================================================
    // Phase B: Preferences, Consents, Custom Fields, Segments, Advanced Giving
    // ============================================================================
    console.log('🌱 Generating Phase B seed data...');

    // Preferences for 80% of constituents
    console.log('  Creating preferences...');
    const preferences = [];
    const contactMethods = ['email', 'phone', 'mail', 'none'];
    const languages = ['en', 'es', 'fr', null];
    for (let i = 0; i < Math.floor(constituentRecords.length * 0.8); i++) {
      const constituent = constituentRecords[i];
      preferences.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId: constituent.id,
        preferredContactMethod: contactMethods[Math.floor(Math.random() * contactMethods.length)],
        preferredContactTime: Math.random() > 0.7 ? ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)] : null,
        preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
        doNotCall: Math.random() < 0.1,
        doNotEmail: Math.random() < 0.05,
        doNotMail: Math.random() < 0.15,
        createdAt: randomDate(twoYearsAgo, now),
        updatedAt: randomDate(twoYearsAgo, now),
      });
    }
    if (preferences.length > 0) {
      await prisma.crmPreferences.createMany({ data: preferences });
    }
    console.log(`  ✓ Created ${preferences.length} preferences`);

    // Consents for 60% of constituents
    console.log('  Creating consents...');
    const consents = [];
    const consentTypes = ['marketing', 'research', 'sharing', 'other'];
    const consentStatuses = ['granted', 'denied', 'pending'];
    for (let i = 0; i < Math.floor(constituentRecords.length * 0.6); i++) {
      const constituent = constituentRecords[i];
      const type = consentTypes[Math.floor(Math.random() * consentTypes.length)];
      const status = consentStatuses[Math.floor(Math.random() * consentStatuses.length)];
      const grantedAt = status === 'granted' ? randomDate(twoYearsAgo, now) : null;
      const revokedAt = status === 'denied' && grantedAt ? randomDate(grantedAt, now) : null;
      consents.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId: constituent.id,
        type,
        status,
        grantedAt,
        revokedAt,
        expiresAt: Math.random() > 0.8 ? randomDate(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)) : null,
        createdAt: randomDate(twoYearsAgo, now),
        updatedAt: randomDate(twoYearsAgo, now),
      });
    }
    if (consents.length > 0) {
      await prisma.crmConsent.createMany({ data: consents });
    }
    console.log(`  ✓ Created ${consents.length} consents`);

    // Custom Field Definitions (20-30)
    console.log('  Creating custom field definitions...');
    const customFieldDefs = [
      { name: 'alumni_year', label: 'Alumni Year', type: 'number', category: 'Education' },
      { name: 'degree_type', label: 'Degree Type', type: 'select', category: 'Education', options: ['Bachelor', 'Master', 'Doctorate', 'Certificate'] },
      { name: 'major', label: 'Major', type: 'text', category: 'Education' },
      { name: 'volunteer_interests', label: 'Volunteer Interests', type: 'multi-select', category: 'Engagement', options: ['Mentoring', 'Events', 'Fundraising', 'Board Service'] },
      { name: 'employer', label: 'Employer', type: 'text', category: 'Professional' },
      { name: 'job_title', label: 'Job Title', type: 'text', category: 'Professional' },
      { name: 'industry', label: 'Industry', type: 'select', category: 'Professional', options: ['Technology', 'Finance', 'Healthcare', 'Education', 'Non-profit', 'Other'] },
      { name: 'birthday_month', label: 'Birthday Month', type: 'number', category: 'Personal' },
      { name: 'spouse_name', label: 'Spouse Name', type: 'text', category: 'Personal' },
      { name: 'legacy_interest', label: 'Legacy Interest', type: 'boolean', category: 'Giving' },
      { name: 'planned_giving_type', label: 'Planned Giving Type', type: 'select', category: 'Giving', options: ['Bequest', 'Trust', 'Annuity', 'Life Insurance'] },
      { name: 'event_preferences', label: 'Event Preferences', type: 'multi-select', category: 'Engagement', options: ['Reunions', 'Networking', 'Athletic Events', 'Cultural Events'] },
      { name: 'communication_frequency', label: 'Communication Frequency', type: 'select', category: 'Preferences', options: ['Weekly', 'Monthly', 'Quarterly', 'Annually'] },
      { name: 'newsletter_subscription', label: 'Newsletter Subscription', type: 'boolean', category: 'Preferences' },
      { name: 'social_media_handles', label: 'Social Media Handles', type: 'text', category: 'Contact' },
      { name: 'referral_source', label: 'Referral Source', type: 'text', category: 'Acquisition' },
      { name: 'first_gift_date', label: 'First Gift Date', type: 'date', category: 'Giving' },
      { name: 'lifetime_giving_goal', label: 'Lifetime Giving Goal', type: 'number', category: 'Giving' },
      { name: 'board_member', label: 'Board Member', type: 'boolean', category: 'Engagement' },
      { name: 'committee_memberships', label: 'Committee Memberships', type: 'multi-select', category: 'Engagement', options: ['Finance', 'Development', 'Alumni Relations', 'Advancement'] },
      { name: 'regional_chapter', label: 'Regional Chapter', type: 'text', category: 'Engagement' },
      { name: 'athletic_team', label: 'Athletic Team', type: 'text', category: 'Education' },
      { name: 'honor_society', label: 'Honor Society', type: 'boolean', category: 'Education' },
      { name: 'scholarship_recipient', label: 'Scholarship Recipient', type: 'boolean', category: 'Education' },
      { name: 'study_abroad', label: 'Study Abroad', type: 'boolean', category: 'Education' },
    ];
    const createdCustomFields = [];
    for (const def of customFieldDefs) {
      const field = await prisma.crmCustomFieldDefinition.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: def.name,
          label: def.label,
          type: def.type,
          category: def.category,
          options: def.options ? JSON.parse(JSON.stringify(def.options)) : null,
          isRequired: false,
          isActive: true,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        },
      });
      createdCustomFields.push(field);
    }
    console.log(`  ✓ Created ${createdCustomFields.length} custom field definitions`);

    // Custom Field Values (for 50% of constituents, 2-5 fields each)
    console.log('  Creating custom field values...');
    const customFieldValues = [];
    for (let i = 0; i < Math.floor(constituentRecords.length * 0.5); i++) {
      const constituent = constituentRecords[i];
      const numFields = Math.floor(Math.random() * 4) + 2; // 2-5 fields
      const selectedFields = createdCustomFields.sort(() => Math.random() - 0.5).slice(0, numFields);
      for (const field of selectedFields) {
        let value: any;
        if (field.type === 'number') {
          value = Math.floor(Math.random() * 50) + 1970; // Example: alumni year
        } else if (field.type === 'boolean') {
          value = Math.random() > 0.5;
        } else if (field.type === 'select') {
          const options = field.options as string[];
          value = options[Math.floor(Math.random() * options.length)];
        } else if (field.type === 'multi-select') {
          const options = field.options as string[];
          const count = Math.floor(Math.random() * 3) + 1;
          value = options.sort(() => Math.random() - 0.5).slice(0, count);
        } else if (field.type === 'date') {
          value = randomDate(twoYearsAgo, now).toISOString().split('T')[0];
        } else {
          value = `Sample ${field.label}`;
        }
        customFieldValues.push({
          fieldDefinitionId: field.id,
          constituentId: constituent.id,
          value: JSON.parse(JSON.stringify(value)),
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (customFieldValues.length > 0) {
      await prisma.crmCustomFieldValue.createMany({ data: customFieldValues });
    }
    console.log(`  ✓ Created ${customFieldValues.length} custom field values`);

    // Segments (15-20)
    console.log('  Creating segments...');
    const segmentNames = [
      'Major Donors ($10k+)',
      'Annual Fund Donors',
      'Lapsed Donors',
      'Young Alumni (2010-2024)',
      'Legacy Families',
      'Board Members',
      'Planned Giving Prospects',
      'Event Attendees',
      'Volunteers',
      'Scholarship Recipients',
      'Athletic Alumni',
      'Regional Chapter Members',
      'Corporate Partners',
      'Faculty & Staff',
      'Parents of Alumni',
      'Graduate School Alumni',
      'International Alumni',
      'First-Time Donors',
      'Recurring Gift Donors',
      'Matching Gift Participants',
    ];
    const segments = [];
    for (let i = 0; i < 18; i++) {
      const segment = await prisma.crmSegment.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: segmentNames[i],
          description: `Segment for ${segmentNames[i]}`,
          criteria: JSON.parse(JSON.stringify({ type: 'dynamic', filters: [] })),
          memberCount: 0,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        },
      });
      segments.push(segment);
    }
    console.log(`  ✓ Created ${segments.length} segments`);

    // Segment Members (add 20-40% of constituents to segments)
    console.log('  Creating segment members...');
    const segmentMembers = [];
    for (const segment of segments) {
      const memberCount = Math.floor(constituentRecords.length * (0.2 + Math.random() * 0.2));
      const selectedConstituents = constituentRecords.sort(() => Math.random() - 0.5).slice(0, memberCount);
      for (const constituent of selectedConstituents) {
        segmentMembers.push({
          segmentId: segment.id,
          constituentId: constituent.id,
          addedAt: randomDate(twoYearsAgo, now),
        });
      }
      // Update segment member count
      await prisma.crmSegment.update({
        where: { id: segment.id },
        data: { memberCount },
      });
    }
    if (segmentMembers.length > 0) {
      await prisma.crmSegmentMember.createMany({ data: segmentMembers });
    }
    console.log(`  ✓ Created ${segmentMembers.length} segment members`);

    // Soft Credits (10% of gifts)
    console.log('  Creating soft credits...');
    const softCreditReasons = ['spouse', 'board-member', 'influencer', 'other'];
    const softCredits = [];
    const giftsForSoftCredit = createdGifts.sort(() => Math.random() - 0.5).slice(0, Math.floor(createdGifts.length * 0.1));
    for (const gift of giftsForSoftCredit) {
      // Find a different constituent for soft credit
      const otherConstituents = constituentRecords.filter((c: { id: string }) => c.id !== gift.constituentId);
      if (otherConstituents.length > 0) {
        const softCreditConstituent = otherConstituents[Math.floor(Math.random() * otherConstituents.length)];
        softCredits.push({
          giftId: gift.id,
          constituentId: softCreditConstituent.id,
          amount: gift.amount * (0.3 + Math.random() * 0.4), // 30-70% of gift amount
          reason: softCreditReasons[Math.floor(Math.random() * softCreditReasons.length)],
          createdAt: gift.createdAt,
        });
      }
    }
    if (softCredits.length > 0) {
      await prisma.crmSoftCredit.createMany({ data: softCredits });
    }
    console.log(`  ✓ Created ${softCredits.length} soft credits`);

    // Matching Gifts (5% of gifts)
    console.log('  Creating matching gifts...');
    const matchingCompanies = [
      'Microsoft', 'Google', 'Apple', 'Amazon', 'IBM', 'Intel', 'Cisco', 'Oracle',
      'JP Morgan', 'Goldman Sachs', 'Bank of America', 'Wells Fargo',
      'Johnson & Johnson', 'Pfizer', 'Merck', 'UnitedHealth',
    ];
    const matchingGifts = [];
    const giftsForMatching = createdGifts.sort(() => Math.random() - 0.5).slice(0, Math.floor(createdGifts.length * 0.05));
    for (const gift of giftsForMatching) {
      const company = matchingCompanies[Math.floor(Math.random() * matchingCompanies.length)];
      const matchRatio = [1.0, 1.5, 2.0][Math.floor(Math.random() * 3)];
      const matchAmount = gift.amount * matchRatio;
      const statuses = ['pending', 'approved', 'received', 'denied'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      matchingGifts.push({
        giftId: gift.id,
        matchingCompanyId: null,
        matchingCompanyName: company,
        matchAmount,
        matchRatio,
        status,
        submittedAt: status !== 'pending' ? randomDate(gift.createdAt, now) : null,
        receivedAt: status === 'received' ? randomDate(gift.createdAt, now) : null,
        createdAt: gift.createdAt,
        updatedAt: randomDate(gift.createdAt, now),
      });
    }
    if (matchingGifts.length > 0) {
      await prisma.crmMatchingGift.createMany({ data: matchingGifts });
    }
    console.log(`  ✓ Created ${matchingGifts.length} matching gifts`);

    // Tributes (8% of gifts)
    console.log('  Creating tributes...');
    const tributeTypes = ['memorial', 'honor'];
    const tributes = [];
    const giftsForTribute = createdGifts.sort(() => Math.random() - 0.5).slice(0, Math.floor(createdGifts.length * 0.08));
    for (const gift of giftsForTribute) {
      const type = tributeTypes[Math.floor(Math.random() * tributeTypes.length)];
      const honoreeNames = [
        'John Smith', 'Mary Johnson', 'Robert Williams', 'Patricia Brown',
        'Michael Jones', 'Jennifer Garcia', 'David Miller', 'Linda Davis',
      ];
      const honoreeName = honoreeNames[Math.floor(Math.random() * honoreeNames.length)];
      tributes.push({
        giftId: gift.id,
        type,
        honoreeName,
        honoreeConstituentId: null, // Could link to actual constituent
        notificationSent: Math.random() > 0.3,
        notificationSentAt: Math.random() > 0.3 ? randomDate(gift.createdAt, now) : null,
        createdAt: gift.createdAt,
      });
    }
    if (tributes.length > 0) {
      await prisma.crmTribute.createMany({ data: tributes });
    }
    console.log(`  ✓ Created ${tributes.length} tributes`);

    // Receipts (90% of gifts)
    console.log('  Creating receipts...');
    const receipts = [];
    const giftsForReceipt = createdGifts.sort(() => Math.random() - 0.5).slice(0, Math.floor(createdGifts.length * 0.9));
    let receiptCounter = 10000;
    for (const gift of giftsForReceipt) {
      const receiptDate = randomDate(gift.createdAt, new Date(gift.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000));
      const methods = ['email', 'mail', 'none'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      receipts.push({
        giftId: gift.id,
        receiptNumber: `RCP-${receiptCounter++}`,
        receiptDate,
        amount: gift.amount,
        fiscalYear: gift.fiscalYear,
        method,
        sentAt: method !== 'none' ? randomDate(receiptDate, now) : null,
        createdAt: receiptDate,
      });
    }
    if (receipts.length > 0) {
      await prisma.crmReceipt.createMany({ data: receipts });
    }
    console.log(`  ✓ Created ${receipts.length} receipts`);

    // Payments (all gifts)
    console.log('  Creating payments...');
    const payments = [];
    const paymentMethodTypes = ['check', 'credit-card', 'wire', 'ach', 'stock', 'other'];
    for (const gift of createdGifts) {
      const statuses = ['pending', 'processed', 'failed', 'refunded'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      payments.push({
        giftId: gift.id,
        amount: gift.amount,
        paymentDate: gift.date,
        paymentMethod: paymentMethodTypes[Math.floor(Math.random() * paymentMethodTypes.length)],
        paymentReference: status === 'processed' ? `REF-${Math.floor(Math.random() * 1000000)}` : null,
        processedAt: status === 'processed' ? randomDate(gift.createdAt, now) : null,
        status,
        createdAt: gift.createdAt,
        updatedAt: randomDate(gift.createdAt, now),
      });
    }
    if (payments.length > 0) {
      await prisma.crmPayment.createMany({ data: payments });
    }
    console.log(`  ✓ Created ${payments.length} payments`);

    // ============================================================================
    // Phase C: Move Plans, Contact Methods, Tags, Events, Prospecting, Relationships
    // ============================================================================
    console.log('🌱 Generating Phase C seed data...');

    // Move Plans (for 30% of constituents with opportunities)
    console.log('  Creating move plans...');
    const movePlans = [];
    const constituentsWithOpportunities = personConstituents.filter((c: any, i: number) => i % 3 === 0); // ~30%
    for (const constituent of constituentsWithOpportunities.slice(0, 100)) {
      const startDate = randomDate(twoYearsAgo, now);
      const targetDate = new Date(startDate);
      targetDate.setMonth(targetDate.getMonth() + (Math.floor(Math.random() * 12) + 3)); // 3-15 months
      const statuses = ['draft', 'active', 'completed', 'cancelled'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const completedDate = status === 'completed' ? randomDate(startDate, now) : null;

      const movePlan = await prisma.crmMovePlan.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          name: `Move Plan for ${constituent.name}`,
          description: `Strategic move plan for ${constituent.name}`,
          status,
          startDate,
          targetDate,
          completedDate,
          createdAt: startDate,
          updatedAt: randomDate(startDate, now),
        },
      });
      movePlans.push(movePlan);

      // Add 3-8 steps per move plan
      const stepCount = Math.floor(Math.random() * 6) + 3;
      const stepTypes = ['research', 'outreach', 'proposal', 'follow-up', 'stewardship', 'other'];
      const stepStatuses = ['pending', 'in-progress', 'completed', 'skipped'];
      for (let i = 0; i < stepCount; i++) {
        const stepStatus = stepStatuses[Math.floor(Math.random() * stepStatuses.length)];
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (i * 30)); // Every 30 days
        const completedDate = stepStatus === 'completed' ? randomDate(dueDate, now) : null;

        await prisma.crmMoveStep.create({
          data: {
            movePlanId: movePlan.id,
            name: `Step ${i + 1}: ${stepTypes[Math.floor(Math.random() * stepTypes.length)]}`,
            description: `Move step ${i + 1}`,
            stepType: stepTypes[Math.floor(Math.random() * stepTypes.length)],
            status: stepStatus,
            dueDate,
            completedDate,
            notes: stepStatus === 'completed' ? 'Step completed successfully' : null,
            order: i,
            createdAt: startDate,
            updatedAt: randomDate(startDate, now),
          },
        });
      }
    }
    console.log(`  ✓ Created ${movePlans.length} move plans with steps`);

    // Addresses (for 70% of constituents and 50% of households)
    console.log('  Creating addresses...');
    const addresses = [];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    const cities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.7); i++) {
      const constituent = personConstituents[i];
      const addressType = ['home', 'work', 'mailing', 'other'][Math.floor(Math.random() * 4)];
      addresses.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId: constituent.id,
        householdId: null,
        type: addressType,
        street1: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Park', 'Maple', 'Elm', 'Cedar', 'Pine', 'Washington', 'Lincoln', 'Jefferson'][Math.floor(Math.random() * 10)]} St`,
        street2: Math.random() > 0.7 ? `Apt ${Math.floor(Math.random() * 200) + 1}` : null,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'US',
        isPrimary: i === 0,
        isActive: true,
        createdAt: randomDate(twoYearsAgo, now),
        updatedAt: randomDate(twoYearsAgo, now),
      });
    }
    // Add addresses for households
    for (let i = 0; i < Math.floor(households.length * 0.5); i++) {
      const household = households[i];
      addresses.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId: null,
        householdId: household.id,
        type: 'home',
        street1: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Park', 'Maple', 'Elm'][Math.floor(Math.random() * 5)]} Ave`,
        street2: null,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'US',
        isPrimary: true,
        isActive: true,
        createdAt: randomDate(twoYearsAgo, now),
        updatedAt: randomDate(twoYearsAgo, now),
      });
    }
    if (addresses.length > 0) {
      await prisma.crmAddress.createMany({ data: addresses });
    }
    console.log(`  ✓ Created ${addresses.length} addresses`);

    // Emails (for 80% of constituents, 1-2 per constituent)
    console.log('  Creating emails...');
    const emails = [];
    const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'university.edu'];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.8); i++) {
      const constituent = personConstituents[i];
      const emailCount = Math.floor(Math.random() * 2) + 1; // 1-2 emails
      for (let j = 0; j < emailCount; j++) {
        const emailType = ['personal', 'work', 'other'][Math.floor(Math.random() * 3)];
        const emailLocal = constituent.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
        emails.push({
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          email: `${emailLocal}${j > 0 ? j : ''}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`,
          type: emailType,
          isPrimary: j === 0,
          isActive: true,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (emails.length > 0) {
      await prisma.crmEmail.createMany({ data: emails });
    }
    console.log(`  ✓ Created ${emails.length} emails`);

    // Phones (for 85% of constituents, 1-2 per constituent)
    console.log('  Creating phones...');
    const phones = [];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.85); i++) {
      const constituent = personConstituents[i];
      const phoneCount = Math.floor(Math.random() * 2) + 1; // 1-2 phones
      for (let j = 0; j < phoneCount; j++) {
        const phoneType = ['mobile', 'home', 'work', 'other'][Math.floor(Math.random() * 4)];
        const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
        const exchange = Math.floor(Math.random() * 800) + 200;
        const number = Math.floor(Math.random() * 10000);
        phones.push({
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          phone: `(${areaCode}) ${exchange}-${String(number).padStart(4, '0')}`,
          type: phoneType,
          isPrimary: j === 0,
          isActive: true,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (phones.length > 0) {
      await prisma.crmPhone.createMany({ data: phones });
    }
    console.log(`  ✓ Created ${phones.length} phones`);

    // Tags (20-25 tags)
    console.log('  Creating tags...');
    const tagNames = [
      'Major Donor', 'Board Member', 'Volunteer', 'Alumni', 'Parent', 'Legacy Family',
      'Planned Giving', 'Recurring Donor', 'Event Attendee', 'Athletic Supporter',
      'Scholarship Donor', 'Capital Campaign', 'Annual Fund', 'Young Alumni', 'Regional Chapter',
      'Corporate Partner', 'Faculty', 'Staff', 'Alumni', 'International', 'First-Time Donor',
      'Lapsed Donor', 'High Capacity', 'High Affinity', 'Stewardship Priority',
    ];
    const tagCategories = ['Giving', 'Engagement', 'Demographic', 'Relationship', 'Status'];
    const tagColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'];
    const createdTags = [];
    for (let i = 0; i < 22; i++) {
      const tag = await prisma.crmTag.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: tagNames[i],
          category: tagCategories[i % tagCategories.length],
          color: tagColors[i % tagColors.length],
          description: `Tag for ${tagNames[i]}`,
          createdAt: randomDate(twoYearsAgo, now),
        },
      });
      createdTags.push(tag);
    }
    console.log(`  ✓ Created ${createdTags.length} tags`);

    // Constituent Tags (add 2-5 tags to 60% of constituents)
    console.log('  Creating constituent tags...');
    const constituentTags = [];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.6); i++) {
      const constituent = personConstituents[i];
      const tagCount = Math.floor(Math.random() * 4) + 2; // 2-5 tags
      const selectedTags = createdTags.sort(() => Math.random() - 0.5).slice(0, tagCount);
      for (const tag of selectedTags) {
        constituentTags.push({
          tagId: tag.id,
          constituentId: constituent.id,
          createdAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (constituentTags.length > 0) {
      await prisma.crmConstituentTag.createMany({ data: constituentTags });
    }
    console.log(`  ✓ Created ${constituentTags.length} constituent tags`);

    // Events (25 events over 2 years)
    console.log('  Creating events...');
    const eventTypes = ['reunion', 'networking', 'fundraiser', 'athletic', 'cultural', 'other'];
    const eventStatuses = ['draft', 'published', 'cancelled', 'completed'];
    const eventNames = [
      'Annual Gala', 'Alumni Reunion', 'Homecoming', 'Networking Mixer', 'Golf Tournament',
      'Scholarship Dinner', 'Athletic Hall of Fame', 'Cultural Festival', 'Volunteer Appreciation',
      'Capital Campaign Launch', 'Regional Reception', 'Young Alumni Happy Hour', 'Legacy Society Dinner',
      'Faculty Recognition', 'Alumni Showcase', 'Athletic Championship', 'Art Exhibition', 'Music Concert',
      'Theater Performance', 'Science Fair', 'Career Fair', 'Mentorship Program', 'Community Service Day',
      'Founders Day', 'Graduation Celebration',
    ];
    const events = [];
    for (let i = 0; i < 25; i++) {
      const startDate = randomDate(twoYearsAgo, now);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (Math.floor(Math.random() * 8) + 2)); // 2-10 hours
      const status = eventStatuses[Math.floor(Math.random() * eventStatuses.length)];
      const event = await prisma.crmEvent.create({
        data: {
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          name: eventNames[i],
          description: `Event: ${eventNames[i]}`,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          startDate,
          endDate,
          location: `${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]}`,
          capacity: Math.floor(Math.random() * 500) + 50,
          status,
          createdAt: randomDate(twoYearsAgo, startDate),
          updatedAt: randomDate(twoYearsAgo, now),
        },
      });
      events.push(event);
    }
    console.log(`  ✓ Created ${events.length} events`);

    // Event Participations (30-50% of constituents participate in 1-3 events)
    console.log('  Creating event participations...');
    const participations = [];
    for (const event of events) {
      const participationCount = Math.floor(personConstituents.length * (0.3 + Math.random() * 0.2));
      const selectedConstituents = personConstituents.sort(() => Math.random() - 0.5).slice(0, participationCount);
      for (const constituent of selectedConstituents) {
        const statuses = ['registered', 'attended', 'cancelled', 'no-show'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const registeredAt = randomDate(event.createdAt, event.startDate);
        const attendedAt = status === 'attended' ? randomDate(event.startDate, event.endDate || event.startDate) : null;
        participations.push({
          eventId: event.id,
          constituentId: constituent.id,
          status,
          registeredAt,
          attendedAt,
          notes: status === 'attended' ? 'Attended event' : null,
          createdAt: registeredAt,
          updatedAt: randomDate(registeredAt, now),
        });
      }
    }
    if (participations.length > 0) {
      await prisma.crmEventParticipation.createMany({ data: participations });
    }
    console.log(`  ✓ Created ${participations.length} event participations`);

    // Prospect Profiles (for 40% of constituents)
    console.log('  Creating prospect profiles...');
    const prospectProfiles = [];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.4); i++) {
      const constituent = personConstituents[i];
      const interests = ['Education', 'Athletics', 'Arts', 'Research', 'Scholarships', 'Facilities', 'Technology'];
      const selectedInterests = interests.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 1);
      prospectProfiles.push({
        workspace: CRM_MOCK_CTX.workspace,
        app: CRM_MOCK_CTX.app,
        constituentId: constituent.id,
        capacity: Math.floor(Math.random() * 500000) + 10000, // $10k-$500k
        inclination: Math.floor(Math.random() * 100),
        interests: JSON.parse(JSON.stringify(selectedInterests)),
        researchNotes: `Prospect research notes for ${constituent.name}`,
        lastResearchedAt: randomDate(twoYearsAgo, now),
        createdAt: randomDate(twoYearsAgo, now),
        updatedAt: randomDate(twoYearsAgo, now),
      });
    }
    if (prospectProfiles.length > 0) {
      await prisma.crmProspectProfile.createMany({ data: prospectProfiles });
    }
    console.log(`  ✓ Created ${prospectProfiles.length} prospect profiles`);

    // Ratings (for 50% of constituents, 1-3 ratings each)
    console.log('  Creating ratings...');
    const ratings = [];
    const ratingTypes = ['wealth', 'affinity', 'engagement'];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.5); i++) {
      const constituent = personConstituents[i];
      const ratingCount = Math.floor(Math.random() * 3) + 1; // 1-3 ratings
      const selectedTypes = ratingTypes.sort(() => Math.random() - 0.5).slice(0, ratingCount);
      for (const type of selectedTypes) {
        ratings.push({
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          type,
          score: Math.floor(Math.random() * 100),
          ratedBy: `user-${Math.floor(Math.random() * 10) + 1}`,
          ratedAt: randomDate(twoYearsAgo, now),
          notes: `${type} rating for ${constituent.name}`,
          createdAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (ratings.length > 0) {
      await prisma.crmRating.createMany({ data: ratings });
    }
    console.log(`  ✓ Created ${ratings.length} ratings`);

    // Assignments (for 60% of constituents, 1-2 officers)
    console.log('  Creating assignments...');
    const assignments = [];
    const officerIds = Array.from({ length: 15 }, (_, i) => `officer-${i + 1}`);
    const roles = ['primary', 'secondary', 'support'];
    for (let i = 0; i < Math.floor(personConstituents.length * 0.6); i++) {
      const constituent = personConstituents[i];
      const assignmentCount = Math.floor(Math.random() * 2) + 1; // 1-2 assignments
      const selectedOfficers = officerIds.sort(() => Math.random() - 0.5).slice(0, assignmentCount);
      for (let j = 0; j < selectedOfficers.length; j++) {
        const role = j === 0 ? 'primary' : roles[Math.floor(Math.random() * roles.length)];
        assignments.push({
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId: constituent.id,
          officerId: selectedOfficers[j],
          role,
          assignedBy: `user-${Math.floor(Math.random() * 10) + 1}`,
          notes: `${role} assignment for ${constituent.name}`,
          assignedAt: randomDate(twoYearsAgo, now),
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (assignments.length > 0) {
      await prisma.crmAssignment.createMany({ data: assignments });
    }
    console.log(`  ✓ Created ${assignments.length} assignments`);

    // Relationships (for 40% of constituents, 1-3 relationships each)
    console.log('  Creating relationships...');
    const relationships = [];
    const relationshipTypes = ['spouse', 'parent', 'child', 'sibling', 'colleague', 'friend', 'other'];
    const reciprocalMap: Record<string, string> = {
      'spouse': 'spouse',
      'parent': 'child',
      'child': 'parent',
      'sibling': 'sibling',
      'colleague': 'colleague',
      'friend': 'friend',
      'other': 'other',
    };
    for (let i = 0; i < Math.floor(personConstituents.length * 0.4); i++) {
      const constituent = personConstituents[i];
      const relationshipCount = Math.floor(Math.random() * 3) + 1; // 1-3 relationships
      const otherConstituents = personConstituents.filter((c: { id: string }) => c.id !== constituent.id);
      const selectedOthers = otherConstituents.sort(() => Math.random() - 0.5).slice(0, relationshipCount);
      for (const other of selectedOthers) {
        const type = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
        relationships.push({
          workspace: CRM_MOCK_CTX.workspace,
          app: CRM_MOCK_CTX.app,
          constituentId1: constituent.id,
          constituentId2: other.id,
          type,
          reciprocalType: reciprocalMap[type],
          startDate: randomDate(twoYearsAgo, now),
          endDate: null,
          isActive: true,
          notes: `${type} relationship`,
          createdAt: randomDate(twoYearsAgo, now),
          updatedAt: randomDate(twoYearsAgo, now),
        });
      }
    }
    if (relationships.length > 0) {
      await prisma.crmRelationship.createMany({ data: relationships });
    }
    console.log(`  ✓ Created ${relationships.length} relationships`);

    // ============================================================================
    // Validation and Sanity Checks
    // ============================================================================
    console.log('🔍 Running validation checks...');
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // 1. Check gift allocations sum to gift amounts
    console.log('  Checking gift allocations...');
    const allGifts = await prisma.crmGift.findMany();
    for (const gift of allGifts) {
      const allocations = await prisma.crmGiftAllocation.findMany({ where: { giftId: gift.id } });
      if (allocations.length > 0) {
        const allocationSum = allocations.reduce((sum: number, a: { amount: { toString: () => string } }) => sum + parseFloat(a.amount.toString()), 0);
        const giftAmount = parseFloat(gift.amount.toString());
        const difference = Math.abs(allocationSum - giftAmount);
        if (difference > 0.01) {
          // Allow small floating point differences
          validationErrors.push(
            `Gift ${gift.id}: Allocation sum (${allocationSum}) does not match gift amount (${giftAmount})`
          );
        }
      }
    }
    console.log(`  ✓ Checked ${allGifts.length} gifts for allocation integrity`);

    // 2. Check LYBUNT/SYBUNT calculations (Last Year/Some Year But Not This)
    console.log('  Checking LYBUNT/SYBUNT data...');
    const validationCurrentFy = getFiscalYear(now);
    const currentFyYear = parseInt(validationCurrentFy.replace('FY', ''));
    const lastFy = `FY${currentFyYear - 1}`;
    const twoYearsAgoFy = `FY${currentFyYear - 2}`;

    const currentFyGifts = allGifts.filter((g: { fiscalYear: string }) => g.fiscalYear === validationCurrentFy);
    const lastFyGifts = allGifts.filter((g: { fiscalYear: string }) => g.fiscalYear === lastFy);
    const twoYearsAgoGifts = allGifts.filter((g: { fiscalYear: string }) => g.fiscalYear === twoYearsAgoFy);

    const currentFyDonors = new Set(currentFyGifts.map((g: { constituentId: string }) => g.constituentId));
    const lastFyDonors = new Set(lastFyGifts.map((g: { constituentId: string }) => g.constituentId));
    const twoYearsAgoDonors = new Set(twoYearsAgoGifts.map((g: { constituentId: string }) => g.constituentId));

    // LYBUNT: Last Year But Not This (gave last year but not this year)
    const lybuntDonors = [...lastFyDonors].filter((id) => !currentFyDonors.has(id));
    // SYBUNT: Some Year But Not This (gave 2+ years ago but not last year or this year)
    const sybuntDonors = [...twoYearsAgoDonors].filter(
      (id) => !lastFyDonors.has(id) && !currentFyDonors.has(id)
    );

    if (lybuntDonors.length === 0 && lastFyDonors.size > 0) {
      validationWarnings.push('No LYBUNT donors found (expected some)');
    }
    if (sybuntDonors.length === 0 && twoYearsAgoDonors.size > 0) {
      validationWarnings.push('No SYBUNT donors found (expected some)');
    }
    console.log(`  ✓ LYBUNT: ${lybuntDonors.length} donors, SYBUNT: ${sybuntDonors.length} donors`);

    // 3. Check pipeline totals
    console.log('  Checking opportunity pipeline...');
    const allOpportunities = await prisma.crmOpportunity.findMany();
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

    if (pipelineTotal === 0 && openOpportunities.length > 0) {
      validationWarnings.push('Pipeline total is zero but open opportunities exist');
    }
    console.log(`  ✓ Pipeline: $${pipelineTotal.toFixed(2)}, Won: $${wonTotal.toFixed(2)}`);

    // 4. Check receipt coverage
    console.log('  Checking receipt coverage...');
    const allReceipts = await prisma.crmReceipt.findMany();
    const receiptedGifts = new Set(allReceipts.map((r: any) => r.giftId));
    const receiptCoverage = (receiptedGifts.size / allGifts.length) * 100;
    if (receiptCoverage < 80 && allGifts.length > 0) {
      validationWarnings.push(`Receipt coverage is ${receiptCoverage.toFixed(1)}% (expected ~90%)`);
    }
    console.log(`  ✓ Receipt coverage: ${receiptCoverage.toFixed(1)}%`);

    // 5. Check pledge fulfillment
    console.log('  Checking pledge fulfillment...');
    const allPledges = await prisma.crmPledge.findMany();
    for (const pledge of allPledges) {
      const amountPaid = parseFloat(pledge.amountPaid.toString());
      const totalAmount = parseFloat(pledge.totalAmount.toString());
      const amountRemaining = parseFloat(pledge.amountRemaining.toString());
      const calculatedRemaining = totalAmount - amountPaid;
      const difference = Math.abs(amountRemaining - calculatedRemaining);
      if (difference > 0.01) {
        validationErrors.push(
          `Pledge ${pledge.id}: Remaining amount (${amountRemaining}) does not match calculation (${calculatedRemaining})`
        );
      }
    }
    console.log(`  ✓ Checked ${allPledges.length} pledges`);

    // 6. Check move plan step counts
    console.log('  Checking move plan integrity...');
    const allMovePlans = await prisma.crmMovePlan.findMany();
    for (const plan of allMovePlans) {
      const steps = await prisma.crmMoveStep.findMany({ where: { movePlanId: plan.id } });
      if (steps.length === 0 && plan.status !== 'draft') {
        validationWarnings.push(`Move plan ${plan.id} has no steps but status is ${plan.status}`);
      }
    }
    console.log(`  ✓ Checked ${allMovePlans.length} move plans`);

    // 7. Check household member consistency
    console.log('  Checking household integrity...');
    const allHouseholds = await prisma.crmHousehold.findMany();
    for (const household of allHouseholds) {
      const members = await prisma.crmHouseholdMember.findMany({ where: { householdId: household.id } });
      if (members.length === 0) {
        validationWarnings.push(`Household ${household.id} has no members`);
      }
      if (household.primaryConstituentId) {
        const hasPrimary = members.some((m: any) => m.constituentId === household.primaryConstituentId);
        if (!hasPrimary) {
          validationWarnings.push(
            `Household ${household.id} primary constituent ${household.primaryConstituentId} is not a member`
          );
        }
      }
    }
    console.log(`  ✓ Checked ${allHouseholds.length} households`);

    // Summary
    if (validationErrors.length > 0) {
      console.error(`  ❌ Found ${validationErrors.length} validation errors:`);
      validationErrors.forEach((err) => console.error(`    - ${err}`));
    }
    if (validationWarnings.length > 0) {
      console.warn(`  ⚠️  Found ${validationWarnings.length} validation warnings:`);
      validationWarnings.forEach((warn) => console.warn(`    - ${warn}`));
    }
    if (validationErrors.length === 0 && validationWarnings.length === 0) {
      console.log('  ✅ All validation checks passed!');
    }

    console.log('✅ CRM Mock Phase A + Phase B + Phase C seed completed!');

    return NextResponse.json({
      success: true,
      message: 'CRM Mock Phase A + Phase B + Phase C data seeded successfully',
      counts: {
        constituents: constituentRecords.length,
        organizations: createdOrganizations.count,
        households: households.length,
        campaigns: campaigns.length,
        funds: funds.length,
        appeals: appeals.length,
        opportunities: opportunities.length,
        gifts: 2000,
        pledges: 200,
        recurringGifts: 100,
        interactions: interactions.length,
        auditLogs: auditLogs.length,
        // Phase B
        preferences: preferences.length,
        consents: consents.length,
        customFieldDefinitions: createdCustomFields.length,
        customFieldValues: customFieldValues.length,
        segments: segments.length,
        segmentMembers: segmentMembers.length,
        softCredits: softCredits.length,
        matchingGifts: matchingGifts.length,
        tributes: tributes.length,
        receipts: receipts.length,
        payments: payments.length,
        // Phase C
        movePlans: movePlans.length,
        addresses: addresses.length,
        emails: emails.length,
        phones: phones.length,
        tags: createdTags.length,
        constituentTags: constituentTags.length,
        events: events.length,
        eventParticipations: participations.length,
        prospectProfiles: prospectProfiles.length,
        ratings: ratings.length,
        assignments: assignments.length,
        relationships: relationships.length,
      },
      validation: {
        errors: validationErrors,
        warnings: validationWarnings,
        checks: {
          giftAllocations: allGifts.length,
          lybuntDonors: lybuntDonors.length,
          sybuntDonors: sybuntDonors.length,
          pipelineTotal: pipelineTotal,
          receiptCoverage: receiptCoverage,
          pledgesChecked: allPledges.length,
          movePlansChecked: allMovePlans.length,
          householdsChecked: allHouseholds.length,
        },
      },
    });
  } catch (error) {
    console.error('Error seeding CRM Mock data:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed data',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
