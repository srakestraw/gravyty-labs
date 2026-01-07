// CRM Mock - Advancement-only CRM Mock UI using database-backed CRM Unified provider

export { crmMockProvider } from './adapter';
export type {
  // Core
  CRMContext,
  SourceSystemRef,
  AuditLog,
  
  // Identity Domain
  Constituent,
  ConstituentDetail,
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
  Gift,
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
  
  // Legacy/Simplified Types
  Portfolio,
  PortfolioMember,
  Interaction,
  Task,
  Event,
  EventParticipation,
  Organization,
  Relationship,
  LapsedDonor,
  
  // Filters & Options
  ConstituentFilters,
  OpportunityFilters,
  GiftFilters,
  PagingOptions,
  SortOptions,
  
  // Reporting Types
  LYBUNTReport,
  SYBUNTReport,
  PipelineForecast,
  RetentionReport,
} from './types';

