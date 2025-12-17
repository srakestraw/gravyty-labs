# Product Requirements Document: App Switcher

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** Draft  
**Owner:** Product & Engineering Team

---

## Executive Summary

This PRD defines the requirements, user stories, and technical specifications for the App Switcher feature in the Gravyty Labs platform. The App Switcher is a critical navigation component that enables users to seamlessly switch between different applications (apps) within the multi-app platform, including main applications (Home, Insights, Student Lifecycle, etc.) and SIM (Simulation) applications.

---

## 1. Problem Statement

### Current State

The App Switcher is a fully functional modal-based navigation component that allows users to:
- View and switch between main applications (Home, Insights, Student Lifecycle AI, AI Chatbots & Messaging, Career Services, Engagement Hub, Advancement & Philanthropy)
- Access SIM applications (Ellucian Banner, Ellucian Colleague, Slate, Salesforce, Canvas, Blackboard)
- Switch between Higher Ed and Nonprofit personas
- Navigate to sub-applications (pills) within apps like Student Lifecycle
- See active app state with visual indicators

### Current Limitations & Pain Points

1. **Hard-coded App Ordering**: App order is hard-coded in the component logic, making it difficult to customize per user or organization
2. **Limited Personalization**: No user preferences for favorite apps or custom ordering
3. **No Search Functionality**: Users must visually scan through apps to find what they need
4. **No Recent Apps**: No quick access to recently used applications
5. **Limited Accessibility**: Keyboard navigation could be improved
6. **No Analytics**: No tracking of app usage patterns
7. **Static App Registry**: Apps are defined in code, limiting dynamic app management
8. **No App Status Indicators**: No way to show app availability, maintenance status, or new features
9. **Limited Mobile Optimization**: Modal could be better optimized for mobile devices
10. **No App Grouping/Categorization**: Beyond main vs SIM, no additional grouping options

---

## 2. Goals and Objectives

### Primary Goals

1. **Enhanced User Experience**: Make app discovery and switching faster and more intuitive
2. **Personalization**: Enable users to customize their app experience
3. **Scalability**: Support dynamic app management and future app additions
4. **Accessibility**: Ensure the switcher is fully accessible to all users
5. **Performance**: Optimize for fast loading and smooth interactions

### Success Criteria

- ✅ Users can find and switch apps in under 2 seconds
- ✅ App switcher supports 20+ apps without performance degradation
- ✅ Keyboard navigation works for all interactive elements
- ✅ Mobile experience is optimized for touch interactions
- ✅ User preferences persist across sessions
- ✅ App usage analytics are collected (privacy-compliant)

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Core App Switching
- **Requirement**: Users must be able to view and switch between all available apps
- **Acceptance Criteria**:
  - Modal displays all apps organized by groups (main, SIM)
  - Apps show icon, label, description, and color
  - Active app is clearly indicated with checkmark
  - Clicking an app navigates to that app and closes the modal
  - ESC key closes the modal
  - Clicking backdrop closes the modal

#### FR2: Persona Switching
- **Requirement**: Users must be able to switch between Higher Ed and Nonprofit personas
- **Acceptance Criteria**:
  - Persona tabs are visible in modal header
  - Switching persona updates app list and descriptions
  - Current persona is visually indicated
  - Persona preference persists across sessions

#### FR3: App Pills (Sub-Apps)
- **Requirement**: Apps with pills (like Student Lifecycle) must show sub-app navigation
- **Acceptance Criteria**:
  - Pills are displayed below app description
  - Active pill is visually indicated
  - Clicking a pill navigates to that sub-app
  - Pills show chevron indicator

#### FR4: Role-Based Access Control
- **Requirement**: Apps requiring specific roles must be hidden from unauthorized users
- **Acceptance Criteria**:
  - Apps with `requiresRole: true` are filtered based on user permissions
  - Feature flags control app visibility
  - No broken links or error states for hidden apps

#### FR5: Responsive Design
- **Requirement**: App switcher must work on all device sizes
- **Acceptance Criteria**:
  - Mobile: Single column layout, optimized touch targets
  - Tablet: Two-column layout for main apps
  - Desktop: Full two-column layout with SIM sidebar
  - Modal is scrollable on smaller screens

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- Modal opens in < 100ms
- App list renders in < 200ms
- Smooth animations (60fps)

#### NFR2: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management

#### NFR3: Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari and Chrome

---

## 4. User Stories

### Epic 1: Core Functionality Enhancements

#### Story 1.1: App Search Functionality
**As a** user with access to many apps  
**I want to** search for apps by name or description  
**So that** I can quickly find the app I need without scrolling

**Acceptance Criteria:**
- Search input appears in modal header
- Search filters apps in real-time as user types
- Search matches app name, description, and keywords
- Search is case-insensitive
- Clear search button resets to full list
- Keyboard shortcut (Cmd/Ctrl + F) focuses search input

**Story Points:** 5

**Technical Notes:**
- Add search input to modal header
- Implement client-side filtering on app registry
- Add debounce for performance
- Highlight matching text in results

---

#### Story 1.2: Recent Apps Section
**As a** frequent user  
**I want to** see my recently used apps at the top  
**So that** I can quickly access my most-used applications

**Acceptance Criteria:**
- Recent apps section appears above main apps
- Shows last 3-5 recently used apps
- Updates automatically when user switches apps
- Persists across browser sessions (localStorage)
- "Clear recent" option available
- Only shows apps user has access to

**Story Points:** 3

**Technical Notes:**
- Track app navigation events
- Store in localStorage with timestamp
- Sort by most recent
- Limit to 5 apps max

---

#### Story 1.3: Favorite Apps
**As a** user  
**I want to** mark apps as favorites  
**So that** I can pin my most important apps to the top

**Acceptance Criteria:**
- Star icon on each app card to toggle favorite
- Favorite apps appear in dedicated "Favorites" section
- Favorites persist across sessions
- Maximum 8 favorites allowed
- Visual indicator (star filled) for favorited apps
- Favorites section appears above recent apps

**Story Points:** 5

**Technical Notes:**
- Add favorite state to user preferences
- Store in localStorage or user profile (future)
- Update app card component with star icon
- Reorder apps based on favorite status

---

#### Story 1.4: Keyboard Navigation Improvements
**As a** power user  
**I want to** navigate the app switcher entirely with keyboard  
**So that** I can switch apps without using the mouse

**Acceptance Criteria:**
- Tab/Shift+Tab navigates between apps
- Arrow keys navigate within app grid
- Enter/Space selects app
- ESC closes modal
- Focus is trapped within modal when open
- Focus returns to trigger button when closed
- Visual focus indicators on all interactive elements

**Story Points:** 5

**Technical Notes:**
- Implement focus trap using focus-trap-react or similar
- Add keyboard event handlers
- Ensure proper tab order
- Add visible focus styles

---

### Epic 2: Personalization & Customization

#### Story 2.1: Custom App Ordering
**As a** user  
**I want to** reorder apps by dragging and dropping  
**So that** I can organize apps in my preferred order

**Acceptance Criteria:**
- Drag handle appears on hover for each app card
- Apps can be reordered within their group (main/SIM)
- Visual feedback during drag (ghost image, drop zones)
- New order persists across sessions
- Reset to default order option available
- Works on touch devices (long press to drag)

**Story Points:** 8

**Technical Notes:**
- Use react-beautiful-dnd or @dnd-kit/core
- Store order preference in localStorage
- Apply custom order when rendering apps
- Fallback to default order if no preference

---

#### Story 2.2: App Visibility Toggle
**As a** user  
**I want to** hide apps I don't use  
**So that** my app switcher shows only relevant apps

**Acceptance Criteria:**
- Hide button/icon on each app card
- Hidden apps don't appear in main view
- "Show hidden apps" toggle reveals hidden apps
- Hidden apps persist across sessions
- Can unhide apps from hidden view
- Admin apps cannot be hidden

**Story Points:** 3

**Technical Notes:**
- Add visibility state to user preferences
- Filter apps based on visibility preference
- Store in localStorage
- Add toggle UI for showing hidden apps

---

#### Story 2.3: App Group Customization
**As a** user  
**I want to** create custom app groups  
**So that** I can organize apps by my workflow

**Acceptance Criteria:**
- "Create Group" option in modal
- Can name custom groups
- Can add apps to custom groups via drag-and-drop
- Custom groups appear as collapsible sections
- Can delete custom groups
- Apps can belong to multiple groups
- Default groups (Main, SIM) cannot be deleted

**Story Points:** 13

**Technical Notes:**
- Design data structure for custom groups
- Store group definitions in localStorage or user profile
- Update app rendering logic to support custom groups
- Add UI for group management

---

### Epic 3: App Discovery & Information

#### Story 3.1: App Status Indicators
**As a** user  
**I want to** see app status (new, updated, maintenance)  
**So that** I know what's available and what to expect

**Acceptance Criteria:**
- Badge indicators on app cards:
  - "New" badge for recently added apps
  - "Updated" badge for apps with recent updates
  - "Maintenance" badge for apps under maintenance
- Badge tooltip shows additional details
- Status information comes from app registry
- Badges are dismissible (except maintenance)

**Story Points:** 5

**Technical Notes:**
- Add status fields to AppDefinition type
- Update app registry with status metadata
- Create badge component
- Track dismissed badges in localStorage

---

#### Story 3.2: App Descriptions & Help
**As a** new user  
**I want to** see detailed information about each app  
**So that** I understand what each app does

**Acceptance Criteria:**
- App descriptions are visible on cards
- "Learn more" link opens app documentation
- Tooltip on hover shows extended description
- "What's new" section for apps with recent updates
- Help icon links to app-specific help docs

**Story Points:** 3

**Technical Notes:**
- Ensure descriptions are in app registry
- Add help URL to AppDefinition type
- Create tooltip component for extended info
- Link to documentation

---

#### Story 3.3: App Usage Analytics (Backend)
**As a** product manager  
**I want to** track app usage patterns  
**So that** I can understand user behavior and improve the platform

**Acceptance Criteria:**
- App switch events are logged
- Track: app ID, timestamp, user ID, source (switcher vs direct navigation)
- Analytics are privacy-compliant (no PII)
- Dashboard shows app popularity metrics
- Can filter by date range, user segment

**Story Points:** 8

**Technical Notes:**
- Create analytics service/API endpoint
- Log events on app switch
- Store in analytics database
- Build admin dashboard (separate story)
- Ensure GDPR/privacy compliance

---

### Epic 4: Performance & Technical Improvements

#### Story 4.1: Lazy Loading for App Icons
**As a** user  
**I want to** see the app switcher open quickly  
**So that** I don't wait for all icons to load

**Acceptance Criteria:**
- Modal opens immediately
- Icons load progressively
- Placeholder shown while icons load
- Smooth transition when icons appear
- No layout shift

**Story Points:** 3

**Technical Notes:**
- Implement lazy loading for FontAwesome icons
- Use React.lazy or similar
- Add loading placeholders
- Optimize icon bundle size

---

#### Story 4.2: Virtualized App List
**As a** user with many apps  
**I want to** scroll through apps smoothly  
**So that** performance doesn't degrade with many apps

**Acceptance Criteria:**
- Smooth scrolling with 50+ apps
- No performance degradation
- Works on mobile devices
- Maintains scroll position when filtering

**Story Points:** 5

**Technical Notes:**
- Use react-window or react-virtualized
- Only render visible app cards
- Maintain scroll position state
- Test with large app lists

---

#### Story 4.3: App Registry API
**As a** developer  
**I want to** fetch app registry from an API  
**So that** apps can be managed dynamically without code deployments

**Acceptance Criteria:**
- API endpoint returns app registry
- Supports persona filtering
- Supports role-based filtering
- Cached client-side for performance
- Falls back to static registry if API fails
- Versioned API for breaking changes

**Story Points:** 8

**Technical Notes:**
- Design API endpoint structure
- Create backend endpoint
- Update getAppRegistry to fetch from API
- Implement caching strategy
- Add error handling and fallback

---

### Epic 5: Mobile & Responsive Enhancements

#### Story 5.1: Mobile-Optimized Layout
**As a** mobile user  
**I want to** use the app switcher easily on my phone  
**So that** I can switch apps quickly

**Acceptance Criteria:**
- Single column layout on mobile
- Larger touch targets (min 44x44px)
- Swipe gestures to close modal
- Bottom sheet style on mobile (optional)
- Optimized for one-handed use
- SIM apps in separate scrollable section

**Story Points:** 5

**Technical Notes:**
- Update responsive breakpoints
- Increase touch target sizes
- Add swipe gesture handlers
- Consider bottom sheet component
- Test on various mobile devices

---

#### Story 5.2: Mobile App Shortcuts
**As a** mobile user  
**I want to** add app shortcuts to my home screen  
**So that** I can access apps directly

**Acceptance Criteria:**
- "Add to Home Screen" option for each app
- Generates PWA manifest entries
- Works on iOS and Android
- Custom app icons and names
- Opens app directly when launched

**Story Points:** 8

**Technical Notes:**
- Implement Web App Manifest
- Add service worker for offline support
- Generate app-specific manifests
- Handle iOS-specific meta tags
- Test on iOS and Android devices

---

### Epic 6: Accessibility & Internationalization

#### Story 6.1: Screen Reader Support
**As a** visually impaired user  
**I want to** use the app switcher with a screen reader  
**So that** I can navigate the platform independently

**Acceptance Criteria:**
- All interactive elements have ARIA labels
- Modal has proper ARIA role and attributes
- App cards are announced correctly
- Focus management is clear
- Keyboard shortcuts are announced
- Status changes are announced

**Story Points:** 5

**Technical Notes:**
- Add ARIA labels to all elements
- Use aria-modal, aria-labelledby
- Test with NVDA, JAWS, VoiceOver
- Add live regions for dynamic content
- Ensure proper heading hierarchy

---

#### Story 6.2: Internationalization (i18n)
**As a** non-English speaker  
**I want to** see app names and descriptions in my language  
**So that** I can understand what each app does

**Acceptance Criteria:**
- App labels support multiple languages
- Descriptions are translated
- Language preference persists
- Fallback to English if translation missing
- RTL language support (if needed)

**Story Points:** 8

**Technical Notes:**
- Set up i18n framework (next-intl or similar)
- Extract all strings to translation files
- Update app registry to support translations
- Add language switcher (if not in header)
- Test with multiple languages

---

### Epic 7: Advanced Features

#### Story 7.1: App Quick Actions
**As a** user  
**I want to** perform quick actions from the app switcher  
**So that** I can access common tasks without opening the app

**Acceptance Criteria:**
- Right-click or long-press shows context menu
- Quick actions vary by app (e.g., "New Contact", "View Reports")
- Actions are configurable per app
- Keyboard shortcut for quick actions
- Actions open in new tab or modal

**Story Points:** 8

**Technical Notes:**
- Design quick action API/structure
- Add context menu component
- Define actions per app in registry
- Handle action execution
- Add keyboard shortcuts

---

#### Story 7.2: App Notifications Badge
**As a** user  
**I want to** see notification counts on apps  
**So that** I know which apps need my attention

**Acceptance Criteria:**
- Badge shows notification count on app card
- Count updates in real-time
- Badge is color-coded by priority
- Clicking app clears badge (if configured)
- Badge appears on trigger button for active app

**Story Points:** 5

**Technical Notes:**
- Design notification API
- Subscribe to notification updates
- Update app card with badge component
- Handle badge clearing logic
- Real-time updates via WebSocket or polling

---

#### Story 7.3: App Workspace Context
**As a** user in Student Lifecycle  
**I want to** see workspace context in the app switcher  
**So that** I understand which workspace I'm switching to

**Acceptance Criteria:**
- Workspace indicator shown for workspace-specific apps
- Current workspace highlighted
- Can switch workspace from app switcher
- Workspace context preserved when switching apps
- Workspace switcher integrated into modal

**Story Points:** 5

**Technical Notes:**
- Integrate WorkspaceSwitcher into modal
- Show workspace context per app
- Handle workspace switching logic
- Update navigation to preserve workspace

---

## 5. Technical Architecture

### Current Architecture

- **Component**: `app/(shell)/components/app-switcher.tsx`
- **Registry**: `lib/apps/registry.ts` (static app definitions)
- **Types**: `lib/apps/types.ts` (AppDefinition interface)
- **State Management**: Zustand (`usePlatformStore`)
- **Active State**: `lib/apps/active.ts` (active app detection)

### Proposed Enhancements

1. **User Preferences Service**
   - Store favorites, order, visibility in localStorage (short-term)
   - Migrate to user profile API (long-term)

2. **App Registry API**
   - REST endpoint for dynamic app management
   - Caching layer for performance
   - Versioning for breaking changes

3. **Analytics Service**
   - Event tracking for app switches
   - Privacy-compliant data collection
   - Dashboard for insights

4. **Search Service**
   - Client-side search (initial)
   - Server-side search with indexing (future)

---

## 6. Design Considerations

### UI/UX Principles

1. **Consistency**: Follow existing design system and patterns
2. **Performance**: Fast, responsive interactions
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Mobile-First**: Optimize for mobile experience
5. **Progressive Enhancement**: Core functionality works without JS

### Visual Design

- Maintain current card-based layout
- Use existing color system and spacing
- Follow FontAwesome icon guidelines
- Ensure proper contrast ratios
- Support dark mode (if implemented)

---

## 7. Dependencies & Integrations

### Current Dependencies
- React/Next.js
- Zustand (state management)
- FontAwesome Pro (icons)
- Tailwind CSS (styling)

### New Dependencies (Potential)
- `react-beautiful-dnd` or `@dnd-kit/core` (drag and drop)
- `react-window` (virtualization)
- `focus-trap-react` (focus management)
- `next-intl` (internationalization)
- Analytics SDK (usage tracking)

---

## 8. Test Plan

### 8.1 Test Strategy Overview

**Testing Levels:**
- **Unit Tests**: Component logic, utilities, hooks (Target: 90%+ coverage)
- **Integration Tests**: Component interactions, state management (Target: 80%+ coverage)
- **E2E Tests**: Complete user flows (Target: Critical paths 100%)
- **Accessibility Tests**: WCAG 2.1 AA compliance (Target: 100%)
- **Performance Tests**: Load time, responsiveness (Target: Meet NFRs)
- **Cross-Browser Tests**: Chrome, Firefox, Safari, Edge (Target: Latest 2 versions)

**Test Tools:**
- **Unit/Integration**: Jest, React Testing Library, Vitest
- **E2E**: Playwright or Cypress
- **Accessibility**: axe-core, WAVE, Lighthouse
- **Performance**: Lighthouse CI, WebPageTest
- **Visual Regression**: Percy or Chromatic (optional)

---

### 8.2 Unit Test Cases

#### TC-U1: App Registry Filtering
**File**: `lib/apps/registry.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-U1.1 | Filter apps by persona (higher-ed) | Returns only higher-ed apps |
| TC-U1.2 | Filter apps by persona (nonprofit) | Returns only nonprofit apps |
| TC-U1.3 | Filter apps by group (main) | Returns only main apps |
| TC-U1.4 | Filter apps by group (sim) | Returns only SIM apps |
| TC-U1.5 | Filter apps with requiresRole flag | Returns only role-required apps when user has permission |
| TC-U1.6 | Filter apps without requiresRole flag | Returns all apps regardless of role |
| TC-U1.7 | Handle missing persona parameter | Defaults to 'higher-ed' |
| TC-U1.8 | Handle invalid persona parameter | Defaults to 'higher-ed' |

#### TC-U2: Active App Detection
**File**: `lib/apps/active.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-U2.1 | Detect active app by exact pathname match | Returns correct app ID |
| TC-U2.2 | Detect active app by pathname prefix | Returns correct app ID for nested routes |
| TC-U2.3 | Detect active app by activeAppId store value | Returns correct app ID |
| TC-U2.4 | Handle special case: home/dashboard mapping | Maps 'dashboard' to 'home' app |
| TC-U2.5 | Handle special case: ai-assistants routes | Maps to 'ai-chatbots-messaging' |
| TC-U2.6 | Handle special case: student-lifecycle routes | Maps to 'student-lifecycle' app |
| TC-U2.7 | Detect active pill within app | Returns correct pill ID |
| TC-U2.8 | Handle no active app | Returns null |
| TC-U2.9 | Handle multiple matching apps | Returns best match (longest path) |

#### TC-U3: Search Filtering Algorithm
**File**: `lib/apps/search.test.ts` (new)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-U3.1 | Search by app name (exact match) | Returns matching apps |
| TC-U3.2 | Search by app name (partial match) | Returns matching apps |
| TC-U3.3 | Search by app description | Returns apps with matching description |
| TC-U3.4 | Search is case-insensitive | Returns matches regardless of case |
| TC-U3.5 | Search with special characters | Handles special characters correctly |
| TC-U3.6 | Search with empty string | Returns all apps |
| TC-U3.7 | Search with no matches | Returns empty array |
| TC-U3.8 | Search highlights matching text | Returns apps with highlighted matches |

#### TC-U4: User Preferences Storage
**File**: `lib/apps/preferences.test.ts` (new)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-U4.1 | Save favorite apps | Stores favorites in localStorage |
| TC-U4.2 | Retrieve favorite apps | Returns saved favorites |
| TC-U4.3 | Remove favorite app | Removes from favorites |
| TC-U4.4 | Save app order preference | Stores custom order |
| TC-U4.5 | Retrieve app order preference | Returns custom order |
| TC-U4.6 | Save hidden apps | Stores hidden app IDs |
| TC-U4.7 | Handle corrupted localStorage data | Falls back to defaults |
| TC-U4.8 | Handle localStorage quota exceeded | Gracefully handles error |
| TC-U4.9 | Clear all preferences | Resets to defaults |

#### TC-U5: Component Utilities
**File**: `app/(shell)/components/app-switcher.utils.test.ts` (new)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-U5.1 | Split apps into columns | Returns apps in correct column order |
| TC-U5.2 | Filter visible apps by role | Returns only accessible apps |
| TC-U5.3 | Sort apps by custom order | Returns apps in specified order |
| TC-U5.4 | Group apps by custom groups | Returns apps grouped correctly |
| TC-U5.5 | Calculate recent apps | Returns apps sorted by recency |

---

### 8.3 Integration Test Cases

#### TC-I1: App Switcher Component Rendering
**File**: `app/(shell)/components/app-switcher.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I1.1 | Render trigger button | Button is visible and clickable |
| TC-I1.2 | Open modal on button click | Modal opens and displays apps |
| TC-I1.3 | Close modal on backdrop click | Modal closes |
| TC-I1.4 | Close modal on ESC key | Modal closes |
| TC-I1.5 | Close modal on close button | Modal closes |
| TC-I1.6 | Render all main apps | All accessible main apps are displayed |
| TC-I1.7 | Render all SIM apps | All SIM apps are displayed |
| TC-I1.8 | Render admin app in footer | Admin app appears in footer |
| TC-I1.9 | Hide apps user doesn't have access to | Role-restricted apps are hidden |
| TC-I1.10 | Display active app indicator | Active app shows checkmark |

#### TC-I2: App Selection & Navigation
**File**: `app/(shell)/components/app-switcher.navigation.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I2.1 | Click app card navigates to app | Router navigates to app href |
| TC-I2.2 | Click app updates activeApp store | Store is updated with app data |
| TC-I2.3 | Click app closes modal | Modal closes after navigation |
| TC-I2.4 | Click pill navigates to pill href | Router navigates to pill href |
| TC-I2.5 | Click pill updates activeApp store | Store is updated with parent app |
| TC-I2.6 | Click pill closes modal | Modal closes after navigation |
| TC-I2.7 | Prevent navigation on disabled apps | No navigation occurs |
| TC-I2.8 | Handle navigation errors | Error is handled gracefully |

#### TC-I3: Persona Switching
**File**: `app/(shell)/components/app-switcher.persona.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I3.1 | Switch to Higher Ed persona | Apps update to Higher Ed versions |
| TC-I3.2 | Switch to Nonprofit persona | Apps update to Nonprofit versions |
| TC-I3.3 | Persona tabs show active state | Active persona is highlighted |
| TC-I3.4 | Persona preference persists | Selected persona persists on reload |
| TC-I3.5 | App descriptions update with persona | Descriptions match selected persona |
| TC-I3.6 | App pills update with persona | Pills match selected persona |

#### TC-I4: Search Functionality
**File**: `app/(shell)/components/app-switcher.search.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I4.1 | Type in search input filters apps | Apps filter in real-time |
| TC-I4.2 | Search matches app names | Matching apps are shown |
| TC-I4.3 | Search matches descriptions | Apps with matching descriptions shown |
| TC-I4.4 | Clear search resets list | All apps are shown again |
| TC-I4.5 | Search is case-insensitive | Case doesn't affect results |
| TC-I4.6 | Empty search shows all apps | All apps displayed |
| TC-I4.7 | No results shows empty state | Empty state message displayed |
| TC-I4.8 | Keyboard shortcut focuses search | Cmd/Ctrl+F focuses input |

#### TC-I5: Recent Apps
**File**: `app/(shell)/components/app-switcher.recent.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I5.1 | Recent apps section appears | Section is visible |
| TC-I5.2 | Recent apps are displayed | Last 3-5 apps shown |
| TC-I5.3 | App switch updates recent apps | New app added to recent |
| TC-I5.4 | Recent apps persist across sessions | Stored in localStorage |
| TC-I5.5 | Clear recent removes all | Recent section hidden |
| TC-I5.6 | Recent apps respect access control | Only accessible apps shown |

#### TC-I6: Favorite Apps
**File**: `app/(shell)/components/app-switcher.favorites.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I6.1 | Star icon appears on app cards | Star icon is visible |
| TC-I6.2 | Click star adds to favorites | App added to favorites section |
| TC-I6.3 | Click filled star removes favorite | App removed from favorites |
| TC-I6.4 | Favorites section appears | Section visible when favorites exist |
| TC-I6.5 | Favorites persist across sessions | Stored in localStorage |
| TC-I6.6 | Maximum 8 favorites enforced | 9th favorite not added |
| TC-I6.7 | Favorites appear above recent apps | Correct order maintained |

#### TC-I7: Custom Ordering
**File**: `app/(shell)/components/app-switcher.ordering.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I7.1 | Drag handle appears on hover | Handle visible on hover |
| TC-I7.2 | Drag app reorders list | App moves to new position |
| TC-I7.3 | Drop app in new position | App stays in new position |
| TC-I7.4 | Custom order persists | Order saved to localStorage |
| TC-I7.5 | Reset to default order | Default order restored |
| TC-I7.6 | Drag works on touch devices | Long press initiates drag |

#### TC-I8: App Visibility Toggle
**File**: `app/(shell)/components/app-switcher.visibility.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-I8.1 | Hide button appears on app card | Button visible |
| TC-I8.2 | Hide app removes from view | App no longer displayed |
| TC-I8.3 | Show hidden apps toggle | Hidden apps section appears |
| TC-I8.4 | Unhide app restores visibility | App appears in main view |
| TC-I8.5 | Hidden apps persist | Preference saved |
| TC-I8.6 | Admin apps cannot be hidden | Hide button disabled |

---

### 8.4 End-to-End Test Cases

#### TC-E2E1: Complete App Switching Flow
**File**: `e2e/app-switcher.spec.ts`

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E1.1 | Switch from Home to Student Lifecycle | 1. Open app switcher<br>2. Click Student Lifecycle<br>3. Verify navigation | Navigates to /student-lifecycle |
| TC-E2E1.2 | Switch to app with pills | 1. Open switcher<br>2. Click Student Lifecycle pill<br>3. Verify navigation | Navigates to pill route |
| TC-E2E1.3 | Switch apps multiple times | 1. Switch to App A<br>2. Switch to App B<br>3. Switch to App C | Each switch navigates correctly |
| TC-E2E1.4 | Switch and verify active state | 1. Switch to app<br>2. Reopen switcher<br>3. Verify checkmark | Active app shows checkmark |

#### TC-E2E2: Search and Filter Flow
**File**: `e2e/app-switcher-search.spec.ts`

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E2.1 | Search for app by name | 1. Open switcher<br>2. Type app name<br>3. Verify results | Matching apps displayed |
| TC-E2E2.2 | Search with no results | 1. Type non-existent app<br>2. Verify empty state | Empty state shown |
| TC-E2E2.3 | Clear search | 1. Type search<br>2. Clear search<br>3. Verify | All apps shown |

#### TC-E2E3: Personalization Flow
**File**: `e2e/app-switcher-personalization.spec.ts`

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E3.1 | Add favorite app | 1. Open switcher<br>2. Click star<br>3. Verify favorite | App in favorites section |
| TC-E2E3.2 | Reorder apps | 1. Drag app<br>2. Drop in new position<br>3. Verify order | Order persists |
| TC-E2E3.3 | Hide app | 1. Hide app<br>2. Verify hidden<br>3. Reload page | App remains hidden |

#### TC-E2E4: Persona Switching Flow
**File**: `e2e/app-switcher-persona.spec.ts`

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E4.1 | Switch to Nonprofit persona | 1. Open switcher<br>2. Click Nonprofit tab<br>3. Verify apps | Apps update to Nonprofit |
| TC-E2E4.2 | Persona persists | 1. Switch persona<br>2. Close switcher<br>3. Reload page | Persona persists |

#### TC-E2E5: Mobile Flow
**File**: `e2e/app-switcher-mobile.spec.ts`

| Test Case | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| TC-E2E5.1 | Open switcher on mobile | 1. Resize to mobile<br>2. Click trigger<br>3. Verify layout | Single column layout |
| TC-E2E5.2 | Swipe to close | 1. Open switcher<br>2. Swipe down<br>3. Verify | Modal closes |
| TC-E2E5.3 | Touch targets | 1. Verify button sizes<br>2. Test taps | All targets ≥44x44px |

---

### 8.5 Accessibility Test Cases

#### TC-A11Y1: Keyboard Navigation
**File**: `e2e/app-switcher-a11y-keyboard.spec.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-A11Y1.1 | Tab through all apps | Focus moves sequentially |
| TC-A11Y1.2 | Shift+Tab reverses focus | Focus moves backwards |
| TC-A11Y1.3 | Arrow keys navigate grid | Focus moves in grid pattern |
| TC-A11Y1.4 | Enter selects app | App is selected |
| TC-A11Y1.5 | Space selects app | App is selected |
| TC-A11Y1.6 | ESC closes modal | Modal closes |
| TC-A11Y1.7 | Focus trap in modal | Focus cannot escape modal |
| TC-A11Y1.8 | Focus returns to trigger | Focus restored on close |

#### TC-A11Y2: Screen Reader Support
**File**: `e2e/app-switcher-a11y-screenreader.spec.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-A11Y2.1 | Modal announced | Screen reader announces modal |
| TC-A11Y2.2 | App names announced | Each app name read |
| TC-A11Y2.3 | App descriptions announced | Descriptions read when focused |
| TC-A11Y2.4 | Active state announced | "Active" or "Current" announced |
| TC-A11Y2.5 | Button labels announced | All buttons have labels |
| TC-A11Y2.6 | Search input labeled | Input has accessible label |
| TC-A11Y2.7 | Persona tabs announced | Tabs announced as tablist |

#### TC-A11Y3: ARIA Attributes
**File**: `app/(shell)/components/app-switcher.a11y.test.tsx`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-A11Y3.1 | Modal has aria-modal | Attribute present |
| TC-A11Y3.2 | Modal has aria-labelledby | Points to title |
| TC-A11Y3.3 | App cards have role | role="button" or "link" |
| TC-A11Y3.4 | Search has aria-label | Label present |
| TC-A11Y3.5 | Tabs have proper roles | role="tablist", "tab" |
| TC-A11Y3.6 | Live regions for updates | aria-live for dynamic content |

#### TC-A11Y4: Visual Accessibility
**File**: `e2e/app-switcher-a11y-visual.spec.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-A11Y4.1 | Color contrast ratios | Meets WCAG AA (4.5:1) |
| TC-A11Y4.2 | Focus indicators visible | Clear focus outline |
| TC-A11Y4.3 | Text size | Minimum 14px or scalable |
| TC-A11Y4.4 | Icon + text labels | Icons have text labels |
| TC-A11Y4.5 | Color not sole indicator | Info conveyed beyond color |

---

### 8.6 Performance Test Cases

#### TC-PERF1: Load Performance
**File**: `e2e/app-switcher-performance.spec.ts`

| Test Case | Description | Metric | Target |
|-----------|-------------|--------|--------|
| TC-PERF1.1 | Modal open time | Time to first render | < 100ms |
| TC-PERF1.2 | App list render time | Time to render all apps | < 200ms |
| TC-PERF1.3 | Search response time | Time to filter results | < 50ms |
| TC-PERF1.4 | Icon load time | Time to load all icons | < 500ms |
| TC-PERF1.5 | Bundle size impact | JS bundle increase | < 50KB |

#### TC-PERF2: Runtime Performance
**File**: `e2e/app-switcher-performance-runtime.spec.ts`

| Test Case | Description | Metric | Target |
|-----------|-------------|--------|--------|
| TC-PERF2.1 | Scroll performance | FPS during scroll | ≥ 60fps |
| TC-PERF2.2 | Animation smoothness | FPS during animations | ≥ 60fps |
| TC-PERF2.3 | Memory usage | Memory footprint | < 50MB |
| TC-PERF2.4 | Large app list (50+) | Render time | < 500ms |

#### TC-PERF3: Network Performance
**File**: `e2e/app-switcher-performance-network.spec.ts`

| Test Case | Description | Metric | Target |
|-----------|-------------|--------|--------|
| TC-PERF3.1 | API registry load | Time to fetch | < 200ms |
| TC-PERF3.2 | API caching | Cache hit rate | > 80% |
| TC-PERF3.3 | Offline fallback | Works offline | Yes |

---

### 8.7 Cross-Browser Test Cases

#### TC-BROWSER1: Browser Compatibility
**File**: `e2e/app-switcher-browsers.spec.ts`

| Test Case | Browser | Description | Expected Result |
|-----------|---------|-------------|-----------------|
| TC-BROWSER1.1 | Chrome (latest) | All functionality | All tests pass |
| TC-BROWSER1.2 | Firefox (latest) | All functionality | All tests pass |
| TC-BROWSER1.3 | Safari (latest) | All functionality | All tests pass |
| TC-BROWSER1.4 | Edge (latest) | All functionality | All tests pass |
| TC-BROWSER1.5 | Chrome Mobile | Mobile features | All tests pass |
| TC-BROWSER1.6 | Safari iOS | Mobile features | All tests pass |

---

### 8.8 Regression Test Cases

#### TC-REG1: Existing Functionality
**File**: `e2e/app-switcher-regression.spec.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-REG1.1 | Existing app switching works | No regression |
| TC-REG1.2 | Persona switching works | No regression |
| TC-REG1.3 | Role-based filtering works | No regression |
| TC-REG1.4 | Active app detection works | No regression |
| TC-REG1.5 | Pill navigation works | No regression |
| TC-REG1.6 | Modal open/close works | No regression |

---

### 8.9 Test Data Requirements

#### Test Users
- **Admin User**: Full access to all apps
- **Standard User**: Access to non-role-restricted apps
- **Role-Restricted User**: Access to role-required apps
- **New User**: No preferences set
- **Returning User**: With saved preferences

#### Test Apps
- **Main Apps**: All 8 main apps (Home, Insights, Student Lifecycle, etc.)
- **SIM Apps**: All 6 SIM apps (Banner, Colleague, Slate, etc.)
- **Apps with Pills**: Student Lifecycle (5 pills)
- **Role-Restricted Apps**: AI Chatbots & Messaging, Student Lifecycle

#### Test Scenarios
- **Empty State**: No apps available
- **Single App**: Only one app available
- **Many Apps**: 20+ apps
- **All Apps Hidden**: User has hidden all apps
- **All Apps Favorited**: User has favorited max apps

---

### 8.10 Test Environment Setup

#### Development Environment
- **Local**: `npm run test` (unit/integration)
- **Watch Mode**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`

#### CI/CD Environment
- **Unit Tests**: Run on every commit
- **Integration Tests**: Run on PR
- **E2E Tests**: Run on PR and merge
- **Performance Tests**: Run nightly
- **Accessibility Tests**: Run on PR

#### Test Environments
- **Local**: Development server
- **Staging**: Staging environment
- **Production**: Production (smoke tests only)

---

### 8.11 Test Execution Plan

#### Phase 1: Unit Tests (Week 1)
- Write unit tests for all utilities
- Target: 90%+ coverage
- Run: On every commit

#### Phase 2: Integration Tests (Week 2)
- Write integration tests for components
- Target: 80%+ coverage
- Run: On PR creation

#### Phase 3: E2E Tests (Week 3)
- Write E2E tests for critical paths
- Target: 100% critical path coverage
- Run: On PR merge

#### Phase 4: Accessibility Tests (Week 4)
- Run accessibility audit
- Fix all WCAG AA violations
- Run: On PR, before release

#### Phase 5: Performance Tests (Ongoing)
- Set up performance monitoring
- Run: Nightly, before release

#### Phase 6: Cross-Browser Tests (Before Release)
- Run on all supported browsers
- Fix browser-specific issues
- Run: Before each release

---

### 8.12 Test Coverage Requirements

| Component/File | Unit Coverage | Integration Coverage | E2E Coverage |
|----------------|--------------|---------------------|--------------|
| `lib/apps/registry.ts` | 100% | N/A | N/A |
| `lib/apps/active.ts` | 100% | N/A | N/A |
| `lib/apps/search.ts` | 100% | N/A | N/A |
| `lib/apps/preferences.ts` | 100% | N/A | N/A |
| `app-switcher.tsx` | 90% | 80% | Critical paths |
| **Overall** | **90%+** | **80%+** | **Critical paths 100%** |

---

### 8.13 Test Reporting

#### Test Reports
- **Unit/Integration**: Coverage reports (HTML)
- **E2E**: Test results with screenshots/videos
- **Accessibility**: Violation reports (JSON/HTML)
- **Performance**: Lighthouse reports, metrics dashboard

#### Reporting Tools
- **Coverage**: Jest/Vitest coverage reports
- **E2E**: Playwright/Cypress HTML reports
- **Accessibility**: axe-core reports
- **Performance**: Lighthouse CI reports

---

### 8.14 Bug Triage & Test Maintenance

#### Bug Severity
- **P0 (Critical)**: Blocks core functionality, fix immediately
- **P1 (High)**: Major feature broken, fix in current sprint
- **P2 (Medium)**: Minor feature issue, fix in next sprint
- **P3 (Low)**: Cosmetic issue, fix when time permits

#### Test Maintenance
- Review and update tests quarterly
- Remove obsolete tests
- Add tests for new features
- Refactor flaky tests
- Update test data as needed

---

## 9. Migration & Rollout Plan

### Phase 1: Core Enhancements (Weeks 1-4)
- Search functionality
- Recent apps
- Keyboard navigation improvements
- Performance optimizations

### Phase 2: Personalization (Weeks 5-8)
- Favorite apps
- Custom ordering
- App visibility toggle

### Phase 3: Advanced Features (Weeks 9-12)
- App status indicators
- Quick actions
- Notification badges
- Analytics integration

### Phase 4: Mobile & i18n (Weeks 13-16)
- Mobile optimizations
- Internationalization
- PWA shortcuts

---

## 10. Success Metrics

### User Engagement
- App switcher usage frequency
- Time to find and switch apps
- Most frequently used apps
- User satisfaction score

### Performance Metrics
- Modal open time (< 100ms target)
- Search response time (< 50ms target)
- Scroll performance (60fps)
- Bundle size impact

### Business Metrics
- App discovery rate
- Feature adoption (favorites, search)
- User retention
- Support ticket reduction

---

## 11. Open Questions & Future Considerations

1. **App Marketplace**: Should third-party apps be installable?
2. **App Permissions**: Should apps have granular permission controls?
3. **App Versioning**: How to handle app updates and versioning?
4. **Multi-Tenancy**: How to handle app visibility per organization?
5. **App Recommendations**: Should we suggest apps based on usage?
6. **App Bundles**: Should related apps be grouped/bundled?

---

## 12. Appendix

### Story Points Reference

Story points use Fibonacci sequence (1, 2, 3, 5, 8, 13):
- **1-2**: Trivial changes, < 1 day
- **3**: Small feature, 1-2 days
- **5**: Medium feature, 3-5 days
- **8**: Large feature, 1-2 weeks
- **13**: Very large feature, 2-3 weeks

### Total Story Points Summary

- Epic 1 (Core Enhancements): 18 points
- Epic 2 (Personalization): 24 points
- Epic 3 (Discovery): 16 points
- Epic 4 (Performance): 16 points
- Epic 5 (Mobile): 13 points
- Epic 6 (A11y & i18n): 13 points
- Epic 7 (Advanced): 18 points

**Total: 118 story points**

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Product Team | Initial PRD creation |

