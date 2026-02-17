# Business and Technical Brief: Admissions AI Assistant

**Purpose**: Business context, product value, and technical architecture for the Admissions AI Assistant.

**Audience**: Product, Design, Engineering, Stakeholders

**Scope**: Admissions AI Assistant end-to-end: chat UI, domain provider pattern, data access, query handling, and integration points.

**Non-goals**: LLM runtime integration (planned), tool execution routing, Advancement AI Assistant (separate brief)

**Key Terms**:
- **Domain Provider**: Interface that wraps data access for a specific domain (Admissions, Advancement)
- **ProviderResponse**: Standard envelope (data, sources, confidence, errors) for all provider methods
- **UserContext**: Runtime context (userId, tenantId, environment) passed to provider methods

**Links**:
- [Product Context](../../product/domains/admissions/context.md)
- [Shared AI Assistant Module](../../../../components/shared/ai-assistant/README.md)
- [Data Provider](../../../shared-services/data-provider/README.md)
- [Architecture](architecture.md)

**Ownership**: Engineering Team  
**Last Updated**: 2025-02-17

---

## 1. Business Overview

### 1.1 What Is Admissions AI Assistant?

Admissions AI Assistant is a **chat-based assistant** embedded in the Admissions workspace that helps admissions officers ask questions about applicants, applications, and queue items. It uses natural language to surface data without navigating multiple screens.

### 1.2 Value Proposition

| Stakeholder | Value |
|-------------|-------|
| **Admissions officers** | Quick lookup of applicant details, search, and queue status via natural language |
| **Operators** | Reduced context-switching; answers grounded in real data via Data Provider |
| **Institution** | Consistent data access patterns; foundation for future LLM-powered assistance |

### 1.3 North Star Metrics

- **Query volume** (primary)
- **Query success rate**: resolved vs error/fallback
- **Time to answer**: latency from submit to response

---

## 2. User Flow

### 2.1 Entry Point

- **Navigation**: Admissions → AI Assistant (`/admissions/assistant`)
- **Placeholder**: "Ask Admissions Assistant…"

### 2.2 Supported Queries (Phase 1)

| Intent | Example Prompts | Provider Method |
|--------|-----------------|------------------|
| Applicant summary | "get applicant abc123", "show applicant abc123" | `getApplicantSummary` |
| Search applicants | "search applicants john", "search applicants smith" | `searchApplicants` |
| Queue snapshot | "show queue", "queue snapshot" | `getQueueSnapshot` |

### 2.3 Response Format

- Markdown-formatted content
- Optional metadata: sources, confidence
- Error messages when provider returns errors

---

## 3. Technical Architecture

### 3.1 Data Provider Pattern

All Admissions AI Assistant data flows through the **domain-scoped Admissions Data Provider** (`lib/ai-assistant/providers/admissions.ts`). The assistant UI and query handler never call `dataClient` directly. The provider wraps `dataClient` and enforces context (`workspace: 'admissions'`, `app: 'student-lifecycle'`).

**Flow**:
```
AiAssistant Component → handleAssistantQuery → AdmissionsDataProvider
                                                      ↓
                                              dataClient (lib/data)
```

### 3.2 Core Types and Provider Interface

| Type | Purpose |
|------|---------|
| `ApplicantSummary` | id, name, email, phone, status, program |
| `ApplicantSearchResult` | applicants[], total, page, pageSize |
| `ApplicationChecklist` | applicantId, items[], overallStatus |
| `ApplicantTimeline` | applicantId, events[] |
| `QueueSnapshot` | totalItems, itemsByStatus, itemsByPriority, recentItems[] |

**AdmissionsDataProvider methods**:
- `getApplicantSummary(userContext, applicantId)` → ApplicantSummary
- `searchApplicants(userContext, query, filters?, pagination?)` → ApplicantSearchResult
- `getApplicationChecklist(userContext, applicantId)` → ApplicationChecklist
- `getTimeline(userContext, applicantId)` → ApplicantTimeline
- `getQueueSnapshot(userContext, filters?)` → QueueSnapshot

### 3.3 Query Handling (Phase 1)

- **Pattern matching**: Regex-based intent detection in `handleAssistantQuery`
- **No LLM**: Responses are deterministic from provider data
- **Fallback**: Default message listing supported intents when no pattern matches

### 3.4 File Inventory

| Location | File | Purpose |
|----------|------|---------|
| `app/(shell)/admissions/assistant/` | `page.tsx` | Admissions AI Assistant page; wires provider and AiAssistant |
| `components/shared/ai-assistant/` | `AiAssistant.tsx` | Shared chat UI and query orchestration |
| `lib/ai-assistant/providers/` | `admissions.ts` | Admissions provider implementation |
| `lib/ai-assistant/providers/` | `types.ts` | Provider interfaces, ApplicantSummary, etc. |
| `lib/ai-assistant/providers/` | `registry.ts` | Provider registry; getProviderForDomain |
| `lib/ai-assistant/` | `store.ts` | Zustand store for chat state |
| `lib/ai-assistant/` | `types.ts` | AssistantMessage, ASSISTANT_SYSTEM_PROMPT |

### 3.5 Key Data Provider Methods (via Admissions Provider)

| Provider Method | dataClient Usage |
|-----------------|------------------|
| `getApplicantSummary` | `dataClient.getContact(ctx, applicantId)` |
| `searchApplicants` | `dataClient.listContacts(ctx)` + filter |
| `getApplicationChecklist` | Mock structure (Phase 1); future: application data |
| `getTimeline` | `dataClient.listQueueItems(ctx)` filtered by person.id |
| `getQueueSnapshot` | `dataClient.listQueueItems(ctx)` + aggregate |

---

## 4. Dependencies

- **Data Provider** (`@/lib/data`): Single source for contacts, queue items
- **Shared AI Assistant** (`@/components/shared/ai-assistant`): Chat UI, store, query handler
- **Provider Registry** (`@/lib/ai-assistant/providers`): Domain provider injection
- **Firebase Auth**: User context (userId) for scoped data access

---

## 5. Enforcement

- **ESLint** (`.eslintrc.ai-assistant.js`): Forbids direct `fetch`, `dataClient`, mock imports in assistant components
- **Provider exemption**: Only `lib/ai-assistant/providers/*` may import `dataClient`
- **Tests**: `lib/ai-assistant/__tests__/enforcement.test.ts` validates no direct data access

---

## 6. Out of Scope (Current)

- LLM runtime integration
- Tool execution / function calling
- Application checklist (real data; currently mock)
- Timeline event types beyond queue items
- Advancement AI Assistant (separate domain)

---

## 7. Related Documentation

- [Shared AI Assistant README](../../../../components/shared/ai-assistant/README.md) — Component and provider pattern
- [Admissions Architecture](architecture.md)
- [Program Match Brief](program-match-brief.md)
