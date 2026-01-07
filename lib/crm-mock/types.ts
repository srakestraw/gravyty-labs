// CRM Mock Types - Advancement-only CRM Mock Data Provider
// Full Advancement CRM canonical data model

export interface CRMContext {
  workspace?: string; // Optional for mock, defaults to 'advancement'
  app?: string; // Optional for mock, defaults to 'crm-mock'
  userId?: string; // Current user ID for filtering
}

// ============================================================================
// Common Types
// ============================================================================

export interface SourceSystemRef {
  system: 'salesforce' | 'blackbaud' | 'other';
  externalId: string;
  lastSyncedAt?: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  userId?: string;
  changes?: Record<string, { old?: any; new?: any }>;
  createdAt: string;
}

// ============================================================================
// Identity Domain
// ============================================================================

export interface Constituent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'person' | 'organization';
  propensity: number; // 0-100 score (computed)
  householdId?: string; // For persons, link to household
  createdAt: string;
  updatedAt: string;
  sourceSystemRef?: SourceSystemRef;
}

export interface Household {
  id: string;
  name: string; // Household name (e.g., "Smith Family")
  primaryConstituentId?: string; // Primary contact
  createdAt: string;
  updatedAt: string;
  sourceSystemRef?: SourceSystemRef;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  constituentId: string;
  role: 'primary' | 'spouse' | 'child' | 'other';
  createdAt: string;
}

export interface Address {
  id: string;
  constituentId?: string;
  householdId?: string;
  type: 'home' | 'work' | 'mailing' | 'other';
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  constituentId: string;
  address: string;
  type: 'personal' | 'work' | 'other';
  isPrimary: boolean;
  isOptedOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Phone {
  id: string;
  constituentId: string;
  number: string;
  type: 'home' | 'work' | 'mobile' | 'other';
  isPrimary: boolean;
  isOptedOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  id: string;
  constituentId: string;
  preferredContactMethod: 'email' | 'phone' | 'mail' | 'none';
  preferredContactTime?: string;
  preferredLanguage?: string;
  doNotCall: boolean;
  doNotEmail: boolean;
  doNotMail: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Consent {
  id: string;
  constituentId: string;
  type: 'marketing' | 'research' | 'sharing' | 'other';
  status: 'granted' | 'denied' | 'pending';
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
  createdAt: string;
}

export interface ConstituentTag {
  id: string;
  constituentId: string;
  tagId: string;
  createdAt: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>; // JSON criteria
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentMember {
  id: string;
  segmentId: string;
  constituentId: string;
  addedAt: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';
  category?: string;
  options?: string[]; // For select/multi-select
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  fieldDefinitionId: string;
  constituentId: string;
  value: string | number | boolean | string[]; // JSON value
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Prospecting Domain
// ============================================================================

export interface ProspectProfile {
  id: string;
  constituentId: string;
  capacity: number; // Estimated giving capacity (dollars)
  inclination: number; // 0-100 score
  interests: string[]; // Areas of interest
  researchNotes?: string;
  lastResearchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  constituentId: string;
  type: 'wealth' | 'affinity' | 'engagement';
  value?: string; // e.g., 'A', 'B', 'C' or 'High', 'Medium', 'Low'
  score?: number; // 0-100 score (alternative to value)
  source?: string; // How rating was determined
  notes?: string; // Rating notes
  effectiveDate: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  constituentId: string;
  officerId: string;
  officerName?: string;
  type: 'primary' | 'secondary' | 'tertiary';
  assignedAt: string;
  assignedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Moves Management Domain
// ============================================================================

export interface Opportunity {
  id: string;
  name: string;
  constituentId?: string;
  organizationId?: string;
  stage: 'prospecting' | 'cultivation' | 'solicitation' | 'stewardship' | 'closed';
  status: 'open' | 'won' | 'lost' | 'closed';
  amount?: number; // Ask amount
  expectedAmount?: number; // Forecast expected amount
  expectedCloseDate?: string; // ISO date
  probability?: number; // 0-100 percentage
  fundId?: string; // Fund/Designation
  fundName?: string; // Fund name (populated from relation)
  appealId?: string; // Appeal
  appealName?: string; // Appeal name (populated from relation)
  campaignId?: string; // Campaign
  campaignName?: string; // Campaign name (populated from relation)
  closeDate?: string; // Actual close date
  closeReason?: string; // If lost/closed
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sourceSystemRef?: SourceSystemRef;
}

export interface StageHistory {
  id: string;
  opportunityId: string;
  stage: string;
  status: string;
  changedAt: string;
  changedBy?: string;
  notes?: string;
}

export interface MovePlan {
  id: string;
  name: string;
  description?: string; // Description of the move plan
  constituentId: string;
  opportunityId?: string; // Optional link to opportunity
  goal: string; // Goal of the move plan
  startDate?: string; // ISO date
  targetDate?: string; // ISO date
  completedDate?: string; // ISO date
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  officerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoveStep {
  id: string;
  movePlanId: string;
  name: string;
  description?: string;
  stepType: 'research' | 'outreach' | 'meeting' | 'proposal' | 'follow-up' | 'other';
  dueDate?: string; // ISO date
  completedAt?: string; // ISO date
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  assignedTo?: string; // Officer ID
  notes?: string;
  order: number; // Step order in plan
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Gifts Domain
// ============================================================================

export interface Gift {
  id: string;
  constituentId: string;
  amount: number;
  date: string; // ISO date string
  fiscalYear: string; // e.g., 'FY2024'
  fundId?: string; // Primary fund
  fundName?: string; // Fund name (populated from relation)
  appealId?: string; // Appeal
  appealName?: string; // Appeal name (populated from relation)
  campaignId?: string; // Campaign
  campaignName?: string; // Campaign name (populated from relation)
  paymentMethod: 'check' | 'credit-card' | 'wire' | 'stock' | 'other';
  paymentReference?: string; // Check number, transaction ID, etc.
  isAnonymous: boolean;
  isTribute: boolean;
  isMatchingGift: boolean;
  receiptId?: string; // Link to receipt
  createdAt: string;
  updatedAt: string;
  sourceSystemRef?: SourceSystemRef;
}

export interface GiftAllocation {
  id: string;
  giftId: string;
  fundId: string;
  fundName?: string;
  designationId?: string;
  designationName?: string;
  amount: number; // Portion of gift allocated to this fund/designation
  createdAt: string;
}

export interface SoftCredit {
  id: string;
  giftId: string;
  constituentId: string; // Constituent receiving soft credit
  amount: number; // Soft credit amount (may be partial)
  reason: 'spouse' | 'board-member' | 'influencer' | 'other';
  createdAt: string;
}

export interface Pledge {
  id: string;
  constituentId: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  pledgeDate: string; // ISO date
  dueDate?: string; // ISO date
  fundId?: string;
  appealId?: string;
  campaignId?: string;
  status: 'active' | 'fulfilled' | 'cancelled' | 'overdue';
  paymentSchedule?: 'one-time' | 'installments' | 'recurring';
  createdAt: string;
  updatedAt: string;
}

export interface RecurringGiftSchedule {
  id: string;
  constituentId: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  startDate: string; // ISO date
  endDate?: string; // ISO date (if set to end)
  fundId?: string;
  paymentMethod: 'credit-card' | 'ach' | 'check';
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  nextGiftDate?: string; // ISO date
  lastGiftDate?: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  pledgeId: string;
  amount: number;
  dueDate: string; // ISO date
  paidDate?: string; // ISO date
  giftId?: string; // Link to gift if paid
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  giftId: string;
  amount: number;
  paymentDate: string; // ISO date
  paymentMethod: 'check' | 'credit-card' | 'wire' | 'ach' | 'stock' | 'other';
  paymentReference?: string;
  processedAt?: string; // ISO date
  status: 'pending' | 'processed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Tribute {
  id: string;
  giftId: string;
  type: 'memorial' | 'honor';
  honoreeName: string;
  honoreeConstituentId?: string; // If honoree is a constituent
  notificationSent: boolean;
  notificationSentAt?: string;
  createdAt: string;
}

export interface MatchingGift {
  id: string;
  giftId: string;
  matchingCompanyId?: string; // Company providing match
  matchingCompanyName: string;
  matchAmount: number;
  matchRatio: number; // e.g., 1.0 for 1:1 match, 2.0 for 2:1 match
  status: 'pending' | 'approved' | 'received' | 'denied';
  submittedAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  giftId: string;
  receiptNumber: string;
  receiptDate: string; // ISO date
  amount: number;
  fiscalYear: string;
  method: 'email' | 'mail' | 'none';
  sentAt?: string; // ISO date
  createdAt: string;
}

// ============================================================================
// Campaign Structure Domain
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  fiscalYear: string; // e.g., 'FY2024'
  goal?: number; // Campaign goal amount
  amountRaised?: number; // Amount raised so far
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  sourceSystemRef?: SourceSystemRef;
}

export interface Appeal {
  id: string;
  name: string;
  description?: string;
  campaignId?: string; // Optional parent campaign
  campaignName?: string; // Campaign name (populated from relation)
  fundId?: string; // Default fund for appeal
  fundName?: string; // Fund name (populated from relation)
  startDate: string; // ISO date
  endDate?: string; // ISO date
  fiscalYear: string;
  goal?: number;
  amountRaised?: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Fund {
  id: string;
  name: string;
  code?: string; // Fund code
  description?: string;
  type: 'unrestricted' | 'restricted' | 'endowment' | 'scholarship' | 'other';
  isActive: boolean;
  parentFundId?: string; // For fund hierarchies
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  fundId: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  name: string; // e.g., 'FY2024'
  startDate: string; // ISO date (July 1)
  endDate: string; // ISO date (June 30)
  isActive: boolean;
  createdAt: string;
}

// ============================================================================
// Legacy/Simplified Types (for backward compatibility)
// ============================================================================

// Portfolio (simplified, may be replaced by Assignment)
export interface Portfolio {
  id: string;
  name: string;
  officerId?: string;
  officerName?: string;
  description?: string;
  createdAt: string;
}

export interface PortfolioMember {
  id: string;
  portfolioId: string;
  constituentId: string;
  assignedAt: string;
}

// Interaction with Sentiment
export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  constituentId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number; // -1 to 1
  createdAt: string;
}

// Task (special type of interaction)
export interface Task {
  id: string;
  type: 'task';
  subject: string;
  constituentId?: string;
  officerId?: string;
  dueDate?: string;
  status: 'open' | 'completed' | 'cancelled';
  createdAt: string;
}

// Event
export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  type: 'reception' | 'dinner' | 'webinar' | 'volunteer' | 'other';
  location?: string;
  createdAt: string;
}

// Event Participation
export interface EventParticipation {
  id: string;
  eventId: string;
  constituentId: string;
  status: 'registered' | 'attended' | 'cancelled' | 'no-show';
  registeredAt: string;
}

// Organization
export interface Organization {
  id: string;
  name: string;
  type: 'household' | 'corporation' | 'foundation' | 'nonprofit';
  createdAt: string;
}

// Relationship
export interface Relationship {
  id: string;
  constituentId?: string; // Legacy field - use constituentId1/constituentId2 instead
  relatedConstituentId?: string; // Legacy field
  organizationId?: string;
  constituentId1?: string; // First constituent in relationship (from database)
  constituentId2?: string; // Second constituent in relationship (from database)
  type: 'spouse' | 'parent' | 'child' | 'sibling' | 'colleague' | 'board_member' | 'employee' | 'other';
  reciprocalType?: string; // Reverse relationship type
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  isActive?: boolean;
  notes?: string;
  createdAt: string;
}

// Lapsed Donor (computed)
export interface LapsedDonor {
  constituentId: string;
  name: string;
  email?: string;
  priorFyTotal: number;
  lastGiftDate: string;
  lastGiftAmount: number;
  propensity: number;
  lastTouchDate?: string;
  lastTouchType?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

// ============================================================================
// Enhanced Constituent Detail (for Constituent 360)
// ============================================================================

export interface ConstituentDetail extends Constituent {
  // Household
  household?: Household;
  householdMembers?: Constituent[];
  
  // Contact Information
  addresses?: Address[];
  emails?: Email[];
  phones?: Phone[];
  
  // Preferences & Consent
  preferences?: Preferences;
  consents?: Consent[];
  
  // Tags & Segments
  tags?: Tag[];
  segments?: Segment[];
  customFields?: CustomFieldValue[];
  
  // Prospecting
  prospectProfile?: ProspectProfile;
  ratings?: Rating[];
  assignments?: Assignment[];
  
  // Opportunities & Move Plans
  opportunities?: Opportunity[];
  movePlans?: MovePlan[];
  
  // Giving
  lastGift?: {
    date: string;
    amount: number;
  };
  currentFyTotal: number;
  priorFyTotal: number;
  lifetimeTotal?: number;
  gifts?: Gift[];
  pledges?: Pledge[];
  recurringGifts?: RecurringGiftSchedule[];
  
  // Engagement
  lastInteraction?: {
    date: string;
    type: string;
    subject: string;
  };
  sentimentTrend?: 'improving' | 'stable' | 'declining';
  
  // Relationships
  relationships?: Relationship[];
}

// ============================================================================
// Filters & Options
// ============================================================================

export interface ConstituentFilters {
  propensityMin?: number;
  propensityMax?: number;
  lastGiftDays?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  eventAttendanceDays?: number;
  capacityMin?: number;
  capacityMax?: number;
  rating?: string;
  tagId?: string;
  segmentId?: string;
  officerId?: string;
}

export interface OpportunityFilters {
  stage?: string;
  status?: 'open' | 'won' | 'lost' | 'closed';
  constituentId?: string;
  fundId?: string;
  campaignId?: string;
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface GiftFilters {
  constituentId?: string;
  fiscalYear?: string;
  fundId?: string;
  campaignId?: string;
  appealId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface PagingOptions {
  page?: number;
  pageSize?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Reporting Types
// ============================================================================

export interface LYBUNTReport {
  constituentId: string;
  name: string;
  lastYearTotal: number; // Last fiscal year total
  thisYearTotal: number; // Current fiscal year total
  lastGiftDate: string;
  lastGiftAmount: number;
}

export interface SYBUNTReport {
  constituentId: string;
  name: string;
  someYearTotal: number; // Some year but not this year total
  thisYearTotal: number; // Current fiscal year total
  lastGiftDate: string;
  lastGiftAmount: number;
}

export interface PipelineForecast {
  fiscalYear: string;
  stage: string;
  opportunityCount: number;
  totalAskAmount: number;
  totalExpectedAmount: number; // Weighted by probability
  weightedTotal: number; // Sum of (expectedAmount * probability / 100)
}

export interface RetentionReport {
  fiscalYear: string;
  newDonors: number;
  retainedDonors: number;
  lapsedDonors: number;
  retentionRate: number; // Percentage
}
