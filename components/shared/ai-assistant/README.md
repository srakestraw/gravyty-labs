# Shared AI Assistant Module

**Purpose**: Reusable AI Assistant component with mandatory Data Provider pattern for domain-scoped data access.

**Audience**: Engineers

**Last Updated**: 2025-01-XX

---

## Overview

The Shared AI Assistant module provides a reusable AI Assistant component that can be embedded across multiple product areas (Admissions, Advancement, etc.). It enforces a strict rule: **all data access must go through domain-scoped Data Providers**.

### Key Principles

1. **No Direct Data Access**: The AI Assistant UI, orchestration, and tools cannot directly call APIs, fetch data, or import app services.
2. **Domain-Scoped Providers**: Each domain (Admissions, Advancement) has its own provider interface.
3. **Provider Injection**: Providers are injected at composition time, not hard-coded.
4. **Standard Response Envelope**: All provider methods return a consistent response format.

---

## Architecture

```
AI Assistant Component
  ↓
Domain Provider Interface (AdmissionsDataProvider | AdvancementDataProvider)
  ↓
Provider Implementation (wraps dataClient)
  ↓
Data Provider (lib/data)
```

---

## How to Embed the AI Assistant

### Basic Usage

```tsx
import { AiAssistant } from '@/components/shared/ai-assistant/AiAssistant';
import { createProviderRegistry, getProviderForDomain } from '@/lib/ai-assistant/providers/registry';

function MyPage() {
  const { user } = useAuth();
  
  const providerRegistry = useMemo(() => createProviderRegistry(), []);
  const provider = useMemo(
    () => getProviderForDomain(providerRegistry, 'admissions', {
      userId: user?.uid,
      tenantId: 'admissions',
    }),
    [providerRegistry, user]
  );

  const userContext = {
    userId: user?.uid,
    tenantId: 'admissions',
    environment: 'development',
  };

  return (
    <AiAssistant
      domain="admissions"
      userContext={userContext}
      provider={provider}
      placeholder="Ask Admissions Assistant…"
    />
  );
}
```

### Props

- `domain`: `'admissions' | 'advancement'` - The domain context
- `userContext`: User context object (userId, tenantId, etc.)
- `provider`: Domain-scoped provider instance (from registry)
- `placeholder`: Optional placeholder text for input
- `className`: Optional CSS class name

---

## How to Implement a New Domain Provider

### 1. Define Provider Interface

Add methods to the domain provider interface in `lib/ai-assistant/providers/types.ts`:

```typescript
export interface MyDomainDataProvider {
  getMyData(userContext: UserContext, id: string): Promise<ProviderResponse<MyDataType>>;
  // ... more methods
}
```

### 2. Implement Provider

Create `lib/ai-assistant/providers/mydomain.ts`:

```typescript
import { dataClient } from '@/lib/data';
import type { MyDomainDataProvider, UserContext, ProviderResponse } from './types';
import { successResponse, errorResponse } from './types';

export class MyDomainDataProviderImpl implements MyDomainDataProvider {
  async getMyData(
    userContext: UserContext,
    id: string
  ): Promise<ProviderResponse<MyDataType>> {
    try {
      const ctx = {
        workspace: 'my-workspace',
        app: 'my-app',
        userId: userContext.userId,
      };

      // Use dataClient here (this is the ONLY place direct data access is allowed)
      const data = await dataClient.someMethod(ctx, id);
      
      return successResponse(data, {
        sources: [{ type: 'my-source', id }],
        confidence: 'high',
      });
    } catch (error) {
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
```

### 3. Register Provider

Update `lib/ai-assistant/providers/registry.ts`:

```typescript
import { MyDomainDataProviderImpl } from './mydomain';

export interface DomainProvider {
  admissions: AdmissionsDataProvider;
  advancement: AdvancementDataProvider;
  mydomain: MyDomainDataProvider; // Add here
}

export function createProviderRegistry(): DomainProvider {
  return {
    admissions: new AdmissionsDataProviderImpl(),
    advancement: new AdvancementDataProviderImpl(),
    mydomain: new MyDomainDataProviderImpl(), // Add here
  };
}
```

### 4. Update Domain Type

Update `lib/ai-assistant/providers/types.ts`:

```typescript
export type Domain = 'admissions' | 'advancement' | 'mydomain';
```

---

## How to Add New Provider Endpoints Safely

### Step 1: Add Method to Interface

In `lib/ai-assistant/providers/types.ts`:

```typescript
export interface AdmissionsDataProvider {
  // ... existing methods
  
  getNewFeature(
    userContext: UserContext,
    params: NewFeatureParams
  ): Promise<ProviderResponse<NewFeatureData>>;
}
```

### Step 2: Implement Method

In `lib/ai-assistant/providers/admissions.ts`:

```typescript
async getNewFeature(
  userContext: UserContext,
  params: NewFeatureParams
): Promise<ProviderResponse<NewFeatureData>> {
  try {
    const ctx = {
      workspace: 'admissions',
      app: 'student-lifecycle',
      userId: userContext.userId,
    };

    // Call dataClient here (ONLY place for direct data access)
    const data = await dataClient.someNewMethod(ctx, params);
    
    return successResponse(data, {
      sources: [{ type: 'feature', id: params.id }],
      confidence: 'high',
    });
  } catch (error) {
    return errorResponse({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

### Step 3: Use in Assistant

Update `components/shared/ai-assistant/AiAssistant.tsx` to handle the new method in `handleAssistantQuery`.

---

## Enforcement Rules

### Lint Rules

The module includes ESLint rules (`.eslintrc.ai-assistant.js`) that prevent:
- Direct `fetch()` calls
- Direct `dataClient` imports in components
- Direct mock data imports
- Direct service imports

### Tests

Run enforcement tests:

```bash
npm test -- lib/ai-assistant/__tests__/enforcement.test.ts
```

These tests verify that:
- No direct fetch calls exist in AI Assistant code
- No direct dataClient imports exist in components
- No direct mock data imports exist

### Provider Files Are Exempt

Files in `lib/ai-assistant/providers/` are **allowed** to use `dataClient` directly. This is the only exception.

---

## Phase 1 Status

### ✅ Completed

- Admissions provider implementation (wired to existing dataClient)
- Advancement provider stub (feature-flagged, returns "not implemented")
- Shared AI Assistant component
- Provider registry and injection
- Enforcement tests
- Admissions page integration

### 🚧 Future Phases

- LLM runtime integration
- Tool execution routing
- Advanced chat features
- Advancement Pipeline implementation

---

## File Structure

```
lib/ai-assistant/
  ├── providers/
  │   ├── types.ts              # Provider interfaces and types
  │   ├── admissions.ts         # Admissions provider implementation
  │   ├── advancement.ts        # Advancement provider stub
  │   └── registry.ts            # Provider registry
  ├── types.ts                   # Assistant types (messages, state)
  ├── store.ts                   # Zustand store for chat state
  └── __tests__/
      └── enforcement.test.ts    # Enforcement tests

components/shared/ai-assistant/
  ├── AiAssistant.tsx            # Main component
  └── README.md                  # This file

app/(shell)/
  └── admissions/
      └── assistant/
          └── page.tsx           # Admissions integration example
```

---

## Runtime Prompt Instructions

The AI Assistant includes a system prompt that instructs the LLM:

> "You are an AI Assistant embedded in this product. You must use the provided Data Provider for all product data access. Do not invent facts. If you do not have sufficient data, call the Data Provider method that retrieves it. If the domain provider returns Not Implemented (Advancement - Pipeline), clearly tell the user that this capability is planned for a later phase and offer what you can do with available data."

This prompt is automatically included when the assistant initializes.

---

## Troubleshooting

### "Provider not found" error

Ensure the provider is registered in `registry.ts` and the domain type includes it.

### "Feature not enabled" error (Advancement)

Set `features.advancementPipelineAssistantEnabled = true` in `lib/features.ts` (Phase 1: still returns stubs).

### Enforcement test failures

Check that:
1. No `fetch()` calls exist outside provider files
2. No direct `dataClient` imports exist in components
3. All data access goes through provider methods

---

## See Also

- [Data Provider Service](../../../../docs/shared-services/data-provider/README.md) - General data provider pattern
- [Admissions Domain](../../../../docs/product/domains/admissions/context.md) - Admissions domain context



