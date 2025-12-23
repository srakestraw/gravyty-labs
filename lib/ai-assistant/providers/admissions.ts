/**
 * Admissions Data Provider Implementation
 * 
 * Wraps the existing dataClient to provide domain-scoped data access
 * for the AI Assistant. All Admissions data access must go through this provider.
 */

import { dataClient } from '@/lib/data';
import type { Contact } from '@/lib/contacts/types';
import type { QueueItem } from '@/lib/data/provider';
import type {
  AdmissionsDataProvider,
  UserContext,
  ProviderResponse,
  ApplicantSummary,
  ApplicantSearchResult,
  ApplicantSearchFilters,
  ApplicationChecklist,
  ApplicantTimeline,
  QueueSnapshot,
  QueueSnapshotFilters,
} from './types';
import { successResponse, errorResponse } from './types';

/**
 * Convert Contact to ApplicantSummary
 */
function contactToApplicantSummary(contact: Contact): ApplicantSummary {
  return {
    id: contact.id,
    name: `${contact.firstName} ${contact.lastName}`,
    email: contact.email,
    phone: contact.phone,
    status: contact.role === 'applicant' ? 'applicant' : contact.role,
    program: contact.primaryProgram,
  };
}

/**
 * Convert QueueItem to timeline event
 */
function queueItemToTimelineEvent(item: QueueItem): ApplicantTimeline['events'][0] {
  return {
    id: item.id,
    type: 'event',
    timestamp: item.createdAt,
    title: item.title,
    description: item.summary,
    actor: item.createdBy === 'agent' ? item.agentName : item.createdBy,
  };
}

export class AdmissionsDataProviderImpl implements AdmissionsDataProvider {
  async getApplicantSummary(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicantSummary>> {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        userId: userContext.userId,
      };

      const contact = await dataClient.getContact(ctx, applicantId);
      
      if (!contact) {
        return errorResponse({
          code: 'NOT_FOUND',
          message: `Applicant with ID ${applicantId} not found`,
        });
      }

      // Filter to applicants only
      if (contact.role !== 'applicant' && contact.role !== 'prospect') {
        return errorResponse({
          code: 'INVALID_TYPE',
          message: `Contact ${applicantId} is not an applicant`,
        });
      }

      const summary = contactToApplicantSummary(contact);

      return successResponse(summary, {
        sources: [{
          type: 'contact',
          id: contact.id,
          name: summary.name,
        }],
        confidence: 'high',
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) },
      });
    }
  }

  async searchApplicants(
    userContext: UserContext,
    query: string,
    filters?: ApplicantSearchFilters,
    pagination?: { page: number; pageSize: number }
  ): Promise<ProviderResponse<ApplicantSearchResult>> {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        userId: userContext.userId,
      };

      const allContacts = await dataClient.listContacts(ctx);
      
      // Filter to applicants/prospects
      let applicants = allContacts.filter(
        c => c.role === 'applicant' || c.role === 'prospect'
      );

      // Apply text search
      if (query.trim()) {
        const queryLower = query.toLowerCase();
        applicants = applicants.filter(
          c =>
            c.firstName.toLowerCase().includes(queryLower) ||
            c.lastName.toLowerCase().includes(queryLower) ||
            c.email?.toLowerCase().includes(queryLower) ||
            c.phone?.includes(query)
        );
      }

      // Apply filters
      if (filters?.status?.length) {
        applicants = applicants.filter(c => filters.status!.includes(c.role));
      }
      if (filters?.program?.length) {
        applicants = applicants.filter(
          c => c.primaryProgram && filters.program!.includes(c.primaryProgram)
        );
      }

      const total = applicants.length;

      // Apply pagination
      const page = pagination?.page ?? 1;
      const pageSize = pagination?.pageSize ?? 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedApplicants = applicants.slice(start, end);

      const result: ApplicantSearchResult = {
        applicants: paginatedApplicants.map(contactToApplicantSummary),
        total,
        page,
        pageSize,
      };

      return successResponse(result, {
        confidence: 'high',
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) },
      });
    }
  }

  async getApplicationChecklist(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicationChecklist>> {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        userId: userContext.userId,
      };

      const contact = await dataClient.getContact(ctx, applicantId);
      
      if (!contact || (contact.role !== 'applicant' && contact.role !== 'prospect')) {
        return errorResponse({
          code: 'NOT_FOUND',
          message: `Applicant with ID ${applicantId} not found`,
        });
      }

      // For Phase 1, return a mock checklist structure
      // In future phases, this would come from actual application data
      const checklist: ApplicationChecklist = {
        applicantId,
        items: [
          {
            id: 'application_form',
            label: 'Application Form',
            status: 'complete',
            completedDate: new Date().toISOString(),
          },
          {
            id: 'transcripts',
            label: 'Official Transcripts',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'recommendations',
            label: 'Letters of Recommendation',
            status: 'not_started',
          },
        ],
        overallStatus: 'in_progress',
      };

      return successResponse(checklist, {
        sources: [{
          type: 'application',
          id: applicantId,
        }],
        confidence: 'medium', // Mock data
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) },
      });
    }
  }

  async getTimeline(
    userContext: UserContext,
    applicantId: string
  ): Promise<ProviderResponse<ApplicantTimeline>> {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        mode: 'operator',
        userId: userContext.userId,
      };

      // Get queue items related to this applicant
      const queueItems = await dataClient.listQueueItems(ctx);
      const applicantItems = queueItems.filter(
        item => item.person?.id === applicantId
      );

      // Convert queue items to timeline events
      const events = applicantItems.map(queueItemToTimelineEvent);

      // Sort by timestamp (newest first)
      events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const timeline: ApplicantTimeline = {
        applicantId,
        events,
      };

      return successResponse(timeline, {
        sources: [{
          type: 'queue',
          id: applicantId,
        }],
        confidence: 'high',
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) },
      });
    }
  }

  async getQueueSnapshot(
    userContext: UserContext,
    filters?: QueueSnapshotFilters
  ): Promise<ProviderResponse<QueueSnapshot>> {
    try {
      const ctx = {
        workspace: 'admissions',
        app: 'student-lifecycle',
        mode: 'operator',
        userId: userContext.userId,
      };

      let queueItems = await dataClient.listQueueItems(ctx);

      // Apply filters
      if (filters?.status?.length) {
        queueItems = queueItems.filter(item => 
          filters.status!.includes(item.status)
        );
      }
      if (filters?.priority?.length) {
        queueItems = queueItems.filter(item => 
          filters.priority!.includes(item.severity)
        );
      }
      if (filters?.assignee) {
        if (filters.assignee === 'Me' && userContext.userId) {
          queueItems = queueItems.filter(item => 
            item.assignedTo === userContext.userId
          );
        } else if (filters.assignee === 'Unassigned') {
          queueItems = queueItems.filter(item => !item.assignedTo);
        }
      }

      // Build snapshot
      const itemsByStatus: Record<string, number> = {};
      const itemsByPriority: Record<string, number> = {};

      queueItems.forEach(item => {
        itemsByStatus[item.status] = (itemsByStatus[item.status] || 0) + 1;
        itemsByPriority[item.severity] = (itemsByPriority[item.severity] || 0) + 1;
      });

      // Get recent items (last 10)
      const recentItems = queueItems
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10)
        .map(item => ({
          id: item.id,
          title: item.title,
          status: item.status,
          priority: item.severity,
          assignee: item.assignedTo,
        }));

      const snapshot: QueueSnapshot = {
        totalItems: queueItems.length,
        itemsByStatus,
        itemsByPriority,
        recentItems,
      };

      return successResponse(snapshot, {
        sources: [{
          type: 'queue',
          id: 'admissions',
        }],
        confidence: 'high',
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: String(error) },
      });
    }
  }
}

