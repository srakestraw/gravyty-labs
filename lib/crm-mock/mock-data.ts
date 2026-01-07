// CRM Mock Data Generator - Advancement-only, 2 years of data

import type {
  Constituent,
  Gift,
  Portfolio,
  PortfolioMember,
  Interaction,
  Task,
  Event,
  EventParticipation,
  Organization,
  Relationship,
} from './types';

// In-memory data storage
let constituents: Constituent[] = [];
let gifts: Gift[] = [];
let portfolios: Portfolio[] = [];
let portfolioMembers: PortfolioMember[] = [];
let interactions: Interaction[] = [];
let tasks: Task[] = [];
let events: Event[] = [];
let eventParticipations: EventParticipation[] = [];
let organizations: Organization[] = [];
let relationships: Relationship[] = [];

// Seed flag
let isSeeded = false;

// Helper: Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Get fiscal year from date (assuming July 1 start)
function getFiscalYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const fyYear = month >= 7 ? year + 1 : year;
  return `FY${fyYear}`;
}

// Helper: Generate name
function generateName(index: number): string {
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
    'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Jason', 'Rebecca', 'Edward', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
    'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Frank', 'Debra', 'Gregory', 'Rachel',
    'Raymond', 'Carolyn', 'Alexander', 'Janet', 'Patrick', 'Virginia', 'Jack', 'Maria',
    'Dennis', 'Heather', 'Jerry', 'Diane', 'Tyler', 'Julie', 'Aaron', 'Joyce',
    'Jose', 'Victoria', 'Adam', 'Kelly', 'Nathan', 'Christina', 'Henry', 'Joan',
    'Douglas', 'Evelyn', 'Zachary', 'Lauren', 'Peter', 'Judith', 'Kyle', 'Megan',
    'Noah', 'Cheryl', 'Ethan', 'Andrea', 'Jeremy', 'Hannah', 'Walter', 'Jacqueline',
    'Christian', 'Martha', 'Keith', 'Gloria', 'Roger', 'Teresa', 'Terry', 'Sara',
    'Gerald', 'Janice', 'Harold', 'Marie', 'Sean', 'Julia', 'Austin', 'Grace',
    'Carl', 'Judy', 'Arthur', 'Theresa', 'Lawrence', 'Madison', 'Dylan', 'Beverly',
    'Jesse', 'Denise', 'Jordan', 'Marilyn', 'Bryan', 'Amber', 'Billy', 'Danielle',
    'Joe', 'Brittany', 'Bruce', 'Diana', 'Gabriel', 'Abigail', 'Logan', 'Jane',
    'Alan', 'Lori', 'Juan', 'Mason', 'Wayne', 'Rose', 'Roy', 'Olivia', 'Ralph', 'Marie',
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
    'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
    'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards',
    'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers',
    'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
    'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
    'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
    'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
    'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell',
    'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons',
    'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
    'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Chavez', 'Gibson', 'Bryant',
    'Ellis', 'Stevens', 'Murray', 'Ford', 'Marshall', 'Owens', 'Mcdonald', 'Harrison',
    'Ruiz', 'Kennedy', 'Wells', 'Alvarez', 'Woods', 'Mendoza', 'Castillo', 'Olson',
    'Webb', 'Washington', 'Tucker', 'Freeman', 'Burns', 'Henry', 'Vasquez', 'Snyder',
    'Simpson', 'Crawford', 'Jimenez', 'Porter', 'Mason', 'Shaw', 'Gordon', 'Wagner',
    'Hunter', 'Romero', 'Hicks', 'Dixon', 'Hunt', 'Palmer', 'Robertson', 'Black',
    'Holmes', 'Stone', 'Meyer', 'Boyd', 'Mills', 'Warren', 'Fox', 'Rose', 'Rice',
    'Moreno', 'Schmidt', 'Patel', 'Ferguson', 'Nichols', 'Herrera', 'Medina', 'Ryan',
    'Fernandez', 'Weaver', 'Daniels', 'Stephens', 'Gardner', 'Payne', 'Kelley', 'Dunn',
    'Pierce', 'Arnold', 'Tran', 'Peterson', 'Hansen', 'Chen', 'Schneider', 'Bennett',
    'Klein', 'Griffin', 'Bishop', 'Carr', 'Gibson', 'Bishop', 'Larson', 'Bishop',
  ];

  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return `${firstName} ${lastName}`;
}

// Helper: Generate email
function generateEmail(name: string, index: number): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}${index}@example.org`;
}

// Helper: Generate phone
function generatePhone(index: number): string {
  const area = 200 + (index % 800);
  const exchange = 100 + (Math.floor(index / 100) % 900);
  const number = index % 10000;
  return `${area}-${exchange}-${String(number).padStart(4, '0')}`;
}

// Generate seed data
export function generateSeedData(): void {
  if (isSeeded) return;

  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 24);

  // Generate 300 constituents
  constituents = Array.from({ length: 300 }, (_, i) => {
    const createdAt = randomDate(twoYearsAgo, now);
    return {
      id: `const_${i + 1}`,
      name: generateName(i),
      email: generateEmail(generateName(i), i),
      phone: generatePhone(i),
      type: i % 10 === 0 ? 'organization' : 'person' as 'person' | 'organization',
      propensity: Math.floor(Math.random() * 100),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });

  // Generate 30 organizations (including households)
  organizations = Array.from({ length: 30 }, (_, i) => {
    const types: Array<'household' | 'corporation' | 'foundation' | 'nonprofit'> = [
      'household', 'household', 'household', // 30% households
      'corporation', 'corporation', 'corporation', 'corporation', 'corporation',
      'foundation', 'foundation', 'foundation',
      'nonprofit', 'nonprofit', 'nonprofit',
    ];
    const createdAt = randomDate(twoYearsAgo, now);
    return {
      id: `org_${i + 1}`,
      name: `Organization ${i + 1}`,
      type: types[i % types.length],
      createdAt: createdAt.toISOString(),
    };
  });

  // Generate 2,000 gifts (won opportunities) over 2 years
  gifts = [];
  const giftAmounts = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const funds = ['Annual Fund', 'Scholarship Fund', 'Capital Campaign', 'Endowment', 'General'];

  for (let i = 0; i < 2000; i++) {
    const constituent = constituents[Math.floor(Math.random() * constituents.length)];
    const date = randomDate(twoYearsAgo, now);
    gifts.push({
      id: `gift_${i + 1}`,
      constituentId: constituent.id,
      amount: giftAmounts[Math.floor(Math.random() * giftAmounts.length)],
      date: date.toISOString(),
      fiscalYear: getFiscalYear(date),
      paymentMethod: 'check' as const,
      isAnonymous: false,
      isTribute: false,
      isMatchingGift: false,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  // Generate 1,500 interactions (30% with sentiment)
  interactions = [];
  const interactionTypes: Array<'call' | 'email' | 'meeting' | 'note' | 'task'> = ['call', 'email', 'meeting', 'note', 'task'];
  const subjects = [
    'Thank you call', 'Follow-up email', 'Stewardship meeting', 'Gift acknowledgment',
    'Event invitation', 'Annual appeal', 'Portfolio review', 'Donor visit',
    'Phone conversation', 'Email exchange', 'In-person meeting', 'Thank you note',
  ];
  const sentiments: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];

  for (let i = 0; i < 1500; i++) {
    const constituent = constituents[Math.floor(Math.random() * constituents.length)];
    const date = randomDate(twoYearsAgo, now);
    const hasSentiment = Math.random() < 0.3; // 30% have sentiment
    const interaction: Interaction = {
      id: `interaction_${i + 1}`,
      type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      constituentId: constituent.id,
      createdAt: date.toISOString(),
    };

    if (hasSentiment) {
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      interaction.sentiment = sentiment;
      interaction.sentimentScore = sentiment === 'positive' ? Math.random() * 0.5 + 0.5 :
        sentiment === 'negative' ? Math.random() * 0.5 - 1 : Math.random() * 0.4 - 0.2;
    }

    interactions.push(interaction);
  }

  // Generate 1,000 tasks (subset of interactions)
  tasks = [];
  const taskSubjects = [
    'Follow up on gift proposal', 'Schedule donor meeting', 'Send thank you note',
    'Update constituent record', 'Research prospect', 'Prepare stewardship report',
    'Call about event RSVP', 'Send annual report', 'Schedule site visit',
  ];
  const taskStatuses: Array<'open' | 'completed' | 'cancelled'> = ['open', 'completed', 'completed', 'completed', 'cancelled'];

  for (let i = 0; i < 1000; i++) {
    const constituent = constituents[Math.floor(Math.random() * constituents.length)];
    const date = randomDate(twoYearsAgo, now);
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);

    tasks.push({
      id: `task_${i + 1}`,
      type: 'task',
      subject: taskSubjects[Math.floor(Math.random() * taskSubjects.length)],
      constituentId: constituent.id,
      officerId: `officer_${Math.floor(Math.random() * 5) + 1}`,
      dueDate: dueDate.toISOString(),
      status: taskStatuses[Math.floor(Math.random() * taskStatuses.length)],
      createdAt: date.toISOString(),
    });
  }

  // Generate 25 events
  events = [];
  const eventTypes: Array<'reception' | 'dinner' | 'webinar' | 'volunteer' | 'other'> = ['reception', 'dinner', 'webinar', 'volunteer', 'other'];
  const eventNames = [
    'Annual Gala', 'Donor Appreciation Reception', 'Scholarship Dinner', 'Virtual Webinar Series',
    'Volunteer Recognition Event', 'Founders Day Celebration', 'Alumni Reunion', 'Board Meeting',
    'Campus Tour', 'Stewardship Luncheon', 'Giving Day Event', 'Legacy Society Reception',
  ];
  const locations = ['Main Campus', 'Downtown Office', 'Virtual', 'Hotel Ballroom', 'Alumni Center'];

  for (let i = 0; i < 25; i++) {
    const date = randomDate(twoYearsAgo, now);
    events.push({
      id: `event_${i + 1}`,
      name: eventNames[Math.floor(Math.random() * eventNames.length)],
      date: date.toISOString(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: date.toISOString(),
    });
  }

  // Generate event participations
  eventParticipations = [];
  const participationStatuses: Array<'registered' | 'attended' | 'cancelled' | 'no-show'> = ['registered', 'attended', 'attended', 'attended', 'cancelled', 'no-show'];

  for (const event of events) {
    const participantCount = Math.floor(Math.random() * 50) + 10; // 10-60 participants per event
    for (let i = 0; i < participantCount; i++) {
      const constituent = constituents[Math.floor(Math.random() * constituents.length)];
      const registeredAt = new Date(event.date);
      registeredAt.setDate(registeredAt.getDate() - Math.floor(Math.random() * 30));

      eventParticipations.push({
        id: `participation_${event.id}_${i + 1}`,
        eventId: event.id,
        constituentId: constituent.id,
        status: participationStatuses[Math.floor(Math.random() * participationStatuses.length)],
        registeredAt: registeredAt.toISOString(),
      });
    }
  }

  // Generate 5 portfolios
  const officerNames = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Thompson'];
  portfolios = Array.from({ length: 5 }, (_, i) => {
    const createdAt = randomDate(twoYearsAgo, now);
    return {
      id: `portfolio_${i + 1}`,
      name: `${officerNames[i]}'s Portfolio`,
      officerId: `officer_${i + 1}`,
      officerName: officerNames[i],
      description: `Portfolio managed by ${officerNames[i]}`,
      createdAt: createdAt.toISOString(),
    };
  });

  // Generate portfolio members (assign constituents to portfolios)
  portfolioMembers = [];
  for (let i = 0; i < constituents.length; i++) {
    if (Math.random() < 0.7) { // 70% of constituents assigned to portfolios
      const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)];
      const assignedAt = randomDate(twoYearsAgo, now);
      portfolioMembers.push({
        id: `pm_${i + 1}`,
        portfolioId: portfolio.id,
        constituentId: constituents[i].id,
        assignedAt: assignedAt.toISOString(),
      });
    }
  }

  // Generate relationships
  relationships = [];
  const relationshipTypes: Array<'spouse' | 'parent' | 'child' | 'sibling' | 'colleague' | 'board_member' | 'employee' | 'other'> = [
    'spouse', 'parent', 'child', 'sibling', 'colleague', 'board_member', 'employee', 'other',
  ];

  for (let i = 0; i < 200; i++) {
    const constituent1 = constituents[Math.floor(Math.random() * constituents.length)];
    const constituent2 = constituents[Math.floor(Math.random() * constituents.length)];
    if (constituent1.id !== constituent2.id) {
      const createdAt = randomDate(twoYearsAgo, now);
      relationships.push({
        id: `rel_${i + 1}`,
        constituentId: constituent1.id,
        relatedConstituentId: constituent2.id,
        type: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
        createdAt: createdAt.toISOString(),
      });
    }
  }

  isSeeded = true;
}

// Reset data
export function resetData(): void {
  constituents = [];
  gifts = [];
  portfolios = [];
  portfolioMembers = [];
  interactions = [];
  tasks = [];
  events = [];
  eventParticipations = [];
  organizations = [];
  relationships = [];
  isSeeded = false;
}

// Getters
export function getConstituents(): Constituent[] {
  return constituents;
}

export function getGifts(): Gift[] {
  return gifts;
}

export function getPortfolios(): Portfolio[] {
  return portfolios;
}

export function getPortfolioMembers(): PortfolioMember[] {
  return portfolioMembers;
}

export function getInteractions(): Interaction[] {
  return interactions;
}

export function getTasks(): Task[] {
  return tasks;
}

export function getEvents(): Event[] {
  return events;
}

export function getEventParticipations(): EventParticipation[] {
  return eventParticipations;
}

export function getOrganizations(): Organization[] {
  return organizations;
}

export function getRelationships(): Relationship[] {
  return relationships;
}

// Mutators for portfolios
export function createPortfolio(portfolio: Omit<Portfolio, 'id' | 'createdAt'>): Portfolio {
  const now = new Date();
  const newPortfolio: Portfolio = {
    ...portfolio,
    id: `portfolio_${portfolios.length + 1}_${Date.now()}`,
    createdAt: now.toISOString(),
  };
  portfolios.push(newPortfolio);
  return newPortfolio;
}

export function addPortfolioMembers(portfolioId: string, constituentIds: string[]): void {
  const now = new Date();
  const existingMemberIds = new Set(
    portfolioMembers
      .filter((pm) => pm.portfolioId === portfolioId)
      .map((pm) => pm.constituentId)
  );

  constituentIds.forEach((constituentId) => {
    if (!existingMemberIds.has(constituentId)) {
      portfolioMembers.push({
        id: `pm_${portfolioId}_${constituentId}_${Date.now()}`,
        portfolioId,
        constituentId,
        assignedAt: now.toISOString(),
      });
    }
  });
}

export function removePortfolioMember(portfolioId: string, constituentId: string): void {
  const index = portfolioMembers.findIndex(
    (pm) => pm.portfolioId === portfolioId && pm.constituentId === constituentId
  );
  if (index !== -1) {
    portfolioMembers.splice(index, 1);
  }
}

