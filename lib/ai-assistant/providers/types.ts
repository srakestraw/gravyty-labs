/**
 * Domain-scoped Data Provider interfaces for AI Assistant
 * 
 * These providers enforce that all AI Assistant data access goes through
 * domain-specific interfaces, preventing direct API/data access.
 */

export type Domain = 'admissions' | 'advancement';

export interface UserContext {
  userId?: string;
  tenantId?: string;
  orgId?: string;
  role?: string;
  permissions?: string[];
  environment?: 'development' | 'staging' | 'production';
}

/**
 * Standard response envelope for all provider methods
 */
export interface ProviderResponse<T> {
  data: T | null;
  sources?: Array<{
    type: string;
    id: string;
    name?: string;
  }>;
  confidence?: 'high' | 'medium' | 'low';
  errors?: ProviderError[];
  cacheHint?: {
    ttl?: number; // Time to live in seconds
    key?: string;
  };
}

export interface ProviderError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Helper to create a successful response
 */
export function successResponse<T>(data: T, options?: {
  sources?: ProviderResponse<T>['sources'];
  confidence?: ProviderResponse<T>['confidence'];
  cacheHint?: ProviderResponse<T>['cacheHint'];
}): ProviderResponse<T> {
  return {
    data,
    sources: options?.sources,
    confidence: options?.confidence,
    cacheHint: options?.cacheHint,
    errors: undefined,
  };
}

/**
 * Helper to create an error response
 */
export function errorResponse<T>(error: ProviderError, options?: {
  sources?: ProviderResponse<T>['sources'];
}): ProviderResponse<T> {
  return {
    data: null,
    sources: options?.sources,
    errors: [error],
  };
}

/**
 * Helper to create a "not implemented" error response
 */
export function notImplementedResponse<T>(feature: string): ProviderResponse<T> {
  return errorResponse<T>({
    code: 'NOT_IMPLEMENTED',
    message: `${feature} is planned for a later phase and is not yet available.`,
  });
}

// ============================================================================
// Admissions Data Provider Interface
// ============================================================================

export interface ApplicantSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  program?: string;
  applicationDate?: string;
  lastActivityDate?: string;
}

export interface ApplicantSearchFilters {
  status?: string[];
  program?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface ApplicantSearchResult {
  applicants: ApplicantSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  status: 'complete' | 'pending' | 'not_started';
  dueDate?: string;
  completedDate?: string;
}

export interface ApplicationChecklist {
  applicantId: string;
  items: ApplicationChecklistItem[];
  overallStatus: 'complete' | 'in_progress' | 'not_started';
}

export interface TimelineEvent {
  id: string;
  type: 'note' | 'status_change' | 'event' | 'communication';
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
}

export interface ApplicantTimeline {
  applicantId: string;
  events: TimelineEvent[];
}

export interface QueueSnapshotFilters {
  status?: string[];
  priority?: string[];
  assignee?: string;
}

export interface QueueSnapshot {
  totalItems: number;
  itemsByStatus: Record<string, number>;
  itemsByPriority: Record<string, number>;
  recentItems: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee?: string;
  }>;
}

export interface AdmissionsDataProvider {
  /**
   * Get summary information for a specific applicant
   */
  getApplicantSummary(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicantSummary>>;

  /**
   * Search applicants with filters and pagination
   */
  searchApplicants(
    userContext: UserContext,
    query: string,
    filters?: ApplicantSearchFilters,
    pagination?: { page: number; pageSize: number }
  ): Promise<ProviderResponse<ApplicantSearchResult>>;

  /**
   * Get application checklist for an applicant
   */
  getApplicationChecklist(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicationChecklist>>;

  /**
   * Get timeline (notes, events, status changes) for an applicant
   */
  getTimeline(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicantTimeline>>;

  /**
   * Get queue snapshot with filters
   */
  getQueueSnapshot(
    userContext: UserContext,
    filters?: QueueSnapshotFilters
  ): Promise<ProviderResponse<QueueSnapshot>>;
}

// ============================================================================
// Advancement Data Provider Interface (Stub for Phase 1)
// ============================================================================

export interface DonorSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalGiving?: number;
  lastGiftDate?: string;
  lastGiftAmount?: number;
}

export interface ProspectSearchFilters {
  givingTier?: string[];
  lastGiftDate?: {
    start?: string;
    end?: string;
  };
}

export interface ProspectSearchResult {
  prospects: DonorSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PipelineSnapshotFilters {
  stage?: string[];
  owner?: string;
}

export interface PipelineSnapshot {
  totalProspects: number;
  prospectsByStage: Record<string, number>;
  recentActivity: Array<{
    id: string;
    title: string;
    stage: string;
    owner?: string;
  }>;
}

export interface AdvancementDataProvider {
  /**
   * Get summary information for a specific donor
   * Phase 1: Returns "not implemented" error
   */
  getDonorSummary(
    userContext: UserContext,
    donorId: string
  ): Promise<ProviderResponse<DonorSummary>>;

  /**
   * Search prospects with filters and pagination
   * Phase 1: Returns empty result with stub marker
   */
  searchProspects(
    userContext: UserContext,
    query: string,
    filters?: ProspectSearchFilters,
    pagination?: { page: number; pageSize: number }
  ): Promise<ProviderResponse<ProspectSearchResult>>;

  /**
   * Get pipeline snapshot with filters
   * Phase 1: Returns "not implemented" error
   */
  getPipelineSnapshot(
    userContext: UserContext,
    filters?: PipelineSnapshotFilters
  ): Promise<ProviderResponse<PipelineSnapshot>>;
}

