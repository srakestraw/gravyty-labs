# Needs Confirmation

**Purpose**: List of items that could not be fully verified in code and need confirmation

**Last Updated**: 2025-12-22

---

## Queue Documentation

### Verified ✅
- Route entry points (verified in `app/(shell)/` routes)
- Component boundaries (verified in `components/shared/queue/`)
- Actions supported (verified in `QueuePageClient.tsx` - `applyActionToItem` function)
- Keyboard shortcuts (verified in `QueuePageClient.tsx` - `useHotkeys` call)
- Review Mode behavior (verified in `useQueueReviewController.ts` and `ReviewModeShell.tsx`)
- Focus Mode behavior (verified in `QueuePageClient.tsx` and `FocusModePage.tsx`)
- Game Plan integration (verified in `QueuePageClient.tsx` - Game Plan loading logic)
- Data provider methods (verified in `lib/data/provider.ts`)
- Objective matching logic (verified in `QueuePageClient.tsx` - `itemMatchesObjective` function)
- Detail renderer registry (verified in `detail-renderers/registry.ts`)

### Needs Confirmation ⚠️

1. **API Persistence**: 
   - **Location**: `components/shared/queue/QueuePageClient.tsx` line 538
   - **Issue**: TODO comment indicates API call to persist actions is not yet implemented
   - **Action Needed**: Confirm if API persistence is implemented elsewhere or still TODO

2. **Command Center Game Plan Relationship**:
   - **Location**: `components/shared/ai-platform/AdmissionsOperatorCommandCenter.tsx`
   - **Issue**: Queue uses Team Game Plan, Command Center uses Operator Game Plan - relationship not fully documented
   - **Action Needed**: Verify how these two Game Plans relate and document the relationship

3. **Workbench Mode Feature Flag**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx` line 147
   - **Issue**: Feature flag `queueFocusWorkbenchV2` - verify if this is enabled in production
   - **Action Needed**: Confirm feature flag status

4. **Review Mode Feature Flag**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx` line 146
   - **Issue**: Feature flag `queueReviewMode` - verify if this is enabled in production
   - **Action Needed**: Confirm feature flag status

5. **Segment Context Resolution**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx` lines 182-189
   - **Issue**: Uses `getSegmentFromSearchParams` and mock data fallback
   - **Action Needed**: Verify segment resolution logic is correct

6. **Auto-advance Timing**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx` lines 544-557
   - **Issue**: Uses `setTimeout` with 100ms delay for auto-advance
   - **Action Needed**: Verify if this timing is correct or needs adjustment

7. **Undo Stack Limit**:
   - **Location**: `components/shared/queue/useQueueReviewController.ts` line 150
   - **Issue**: Undo stack limited to 10 actions
   - **Action Needed**: Verify if this limit is intentional and sufficient

8. **Objective Completion Status**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx` lines 247-253, 278-283
   - **Issue**: Completion status extracted from operator game plan items
   - **Action Needed**: Verify this mapping is correct and complete

---

## Domain Documentation

### Verified ✅
- Queue entry points (verified in route files)
- Default filters (verified as `undefined` in route files)
- Game Plan objectives (verified in `QueuePageClient.tsx` objective matching)

### Needs Confirmation ⚠️

1. **Admissions Context**:
   - **File**: `docs/product/domains/admissions/context.md`
   - **Issue**: File exists but content may need verification against actual implementation
   - **Action Needed**: Review and verify context.md content

2. **Advancement Pipeline**:
   - **File**: `docs/product/domains/advancement/README.md`
   - **Issue**: Pipeline is documented as part of Advancement - verify if it should be separate domain
   - **Action Needed**: Confirm if Pipeline should be separate domain or subdomain

---

## Shared Services

### Needs Confirmation ⚠️

1. **Data Provider Implementation**:
   - **Location**: `lib/data/index.ts`
   - **Issue**: Currently uses mock provider - verify if HTTP/MCP providers are implemented
   - **Action Needed**: Confirm provider implementation status

2. **Command Center Working Modes**:
   - **Location**: `lib/command-center/workingModeUtils.ts`
   - **Issue**: Working mode logic - verify if all modes are implemented
   - **Action Needed**: Review working mode implementation

---

## General

### Needs Confirmation ⚠️

1. **Feature Flags**:
   - **Location**: `lib/features.ts`
   - **Issue**: Feature flag system - verify which flags are active
   - **Action Needed**: Document active feature flags

2. **URL Parameter Persistence**:
   - **Location**: `components/shared/queue/QueuePageClient.tsx`
   - **Issue**: URL parameters preserved when toggling Focus Mode
   - **Action Needed**: Verify all URL parameters are correctly preserved

---

## How to Resolve

For each item marked "Needs Confirmation":
1. Review the source file(s) listed
2. Test the behavior in the application
3. Update the relevant documentation
4. Remove the item from this list

---

## Update Triggers

This document must be updated when:
- New unverified items are discovered
- Items are confirmed and removed
- New code paths are added that need verification


