import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CRM seed (Advancement only)...');

  // Clear existing CRM data
  console.log('🧹 Clearing existing CRM data...');
  await prisma.crmInteraction.deleteMany();
  await prisma.crmOpportunity.deleteMany();
  await prisma.crmOrganization.deleteMany();
  await prisma.crmConstituent.deleteMany();

  // Seed data for Advancement workspace only
  const workspace = 'advancement';
  const app = 'pipeline';

  console.log(`📦 Seeding ${workspace}/${app}...`);

  // Generate constituents (alumni, parents, donors, etc.)
  const constituents: any[] = [];
  const constituentNames = [
    'Sarah Chen', 'Michael Rodriguez', 'Emily Johnson', 'David Kim', 'Jessica Martinez',
    'James Wilson', 'Maria Garcia', 'Robert Brown', 'Jennifer Lee', 'William Taylor',
    'Linda Anderson', 'Christopher Moore', 'Patricia Jackson', 'Daniel White', 'Barbara Harris',
    'Matthew Martin', 'Susan Thompson', 'Anthony Garcia', 'Karen Martinez', 'Mark Robinson',
    'Nancy Clark', 'Steven Lewis', 'Lisa Walker', 'Kevin Hall', 'Michelle Young',
    'Brian King', 'Amy Wright', 'Jason Lopez', 'Angela Hill', 'Ryan Scott',
  ];
  
  for (let i = 0; i < 30; i++) {
    const isOrg = i % 5 === 0;
    constituents.push({
      workspace,
      app,
      name: isOrg ? `${constituentNames[i]} Foundation` : constituentNames[i],
      type: isOrg ? 'organization' : 'person',
      email: `${constituentNames[i].toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `555-${String(i + 1).padStart(4, '0')}`,
    });
  }
  
  const createdConstituents = await prisma.crmConstituent.createMany({
    data: constituents,
  });
  console.log(`  ✓ Created ${createdConstituents.count} constituents`);

  // Get created constituents for relationships
  const constituentRecords = await prisma.crmConstituent.findMany({
    where: { workspace, app },
  });

  // Generate organizations (households, corporations, foundations)
  const organizations: any[] = [];
  const orgTypes: ('household' | 'corporation' | 'foundation' | 'nonprofit')[] = ['household', 'corporation', 'foundation', 'nonprofit'];
  const orgNames = [
    'Smith Household', 'TechCorp Industries', 'Johnson Foundation', 'Community Nonprofit',
    'Williams Family', 'Global Corp', 'Education Foundation', 'Local Charity',
    'Brown Household', 'Innovation Inc',
  ];
  
  for (let i = 0; i < 10; i++) {
    organizations.push({
      workspace,
      app,
      name: orgNames[i] || `Organization ${i + 1}`,
      type: orgTypes[i % orgTypes.length],
    });
  }
  
  const createdOrganizations = await prisma.crmOrganization.createMany({
    data: organizations,
  });
  console.log(`  ✓ Created ${createdOrganizations.count} organizations`);

  // Get created organizations for relationships
  const organizationRecords = await prisma.crmOrganization.findMany({
    where: { workspace, app },
  });

  // Generate opportunities (fundraising asks) linked to constituents/organizations
  const opportunities: any[] = [];
  const stages: ('prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed')[] = ['prospecting', 'cultivation', 'solicitation', 'stewardship', 'closed'];
  const statuses: ('open' | 'won' | 'lost' | 'closed')[] = ['open', 'won', 'lost', 'closed'];
  const opportunityNames = [
    'Annual Fund Campaign', 'Capital Campaign Gift', 'Scholarship Endowment', 'Building Renovation',
    'Program Support', 'Research Grant', 'Event Sponsorship', 'Planned Giving',
    'Matching Gift', 'Corporate Partnership',
  ];

  for (let i = 0; i < 20; i++) {
    const constituent = constituentRecords[i % constituentRecords.length];
    const organization = organizationRecords[i % organizationRecords.length];
    opportunities.push({
      workspace,
      app,
      name: `${opportunityNames[i % opportunityNames.length]} ${i + 1}`,
      stage: stages[i % stages.length],
      status: statuses[i % statuses.length],
      constituentId: constituent?.id,
      organizationId: organization?.id,
      amount: Math.floor(Math.random() * 100000) + 5000,
    });
  }
  
  const createdOpportunities = await prisma.crmOpportunity.createMany({
    data: opportunities,
  });
  console.log(`  ✓ Created ${createdOpportunities.count} opportunities`);

  // Get created opportunities for interactions
  const opportunityRecords = await prisma.crmOpportunity.findMany({
    where: { workspace, app },
  });

  // Generate interactions with realistic timestamps
  const interactions: any[] = [];
  const interactionTypes: ('call' | 'email' | 'meeting' | 'note' | 'task')[] = ['call', 'email', 'meeting', 'note', 'task'];
  const interactionSubjects = [
    'Initial outreach call', 'Follow-up email', 'Donor meeting scheduled', 'Thank you note sent',
    'Proposal discussion', 'Stewardship update', 'Event invitation', 'Next steps planning',
    'Cultivation touchpoint', 'Solicitation call',
  ];
  
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    // Generate timestamps over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    const constituent = constituentRecords[i % constituentRecords.length];
    const organization = organizationRecords[i % organizationRecords.length];
    const opportunity = opportunityRecords[i % opportunityRecords.length];

    interactions.push({
      workspace,
      app,
      type: interactionTypes[i % interactionTypes.length],
      subject: `${interactionSubjects[i % interactionSubjects.length]} ${i + 1}`,
      constituentId: constituent?.id,
      organizationId: organization?.id,
      opportunityId: opportunity?.id,
      createdAt,
    });
  }
  
  const createdInteractions = await prisma.crmInteraction.createMany({
    data: interactions,
  });
  console.log(`  ✓ Created ${createdInteractions.count} interactions`);

  console.log('✅ CRM seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding CRM data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
