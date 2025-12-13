import type { AppDefinition, AppId } from './types';

export function isAppActive(appHref: string, pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === appHref) return true;
  return pathname.startsWith(appHref.endsWith('/') ? appHref : appHref + '/');
}

export function getActivePillId(app: AppDefinition, pathname: string): string | null {
  const pills = app.pills ?? [];
  if (!pathname || pills.length === 0) return null;

  let best: { id: string; len: number } | null = null;
  for (const pill of pills) {
    if (!pill.href) continue;
    if (isAppActive(pill.href, pathname)) {
      const len = pill.href.length;
      if (!best || len > best.len) best = { id: pill.id, len };
    }
  }

  return best?.id ?? null;
}

// Match by longest href prefix across the provided apps.
export function getActiveAppId(pathname: string, apps: AppDefinition[]): AppId | null {
  if (!pathname) return null;

  let best: { id: AppId; len: number } | null = null;
  for (const app of apps) {
    const href = app.href;
    if (!href) continue;
    if (pathname === href || pathname.startsWith(href.endsWith('/') ? href : href + '/')) {
      const len = href.length;
      if (!best || len > best.len) best = { id: app.id, len };
    }
  }

  return best?.id ?? null;
}

// Preserves the existing App Switcher active-state behavior (activeApp store + pathname fallbacks).
export function isAppActiveInSwitcher(params: {
  app: AppDefinition;
  activeAppId: string | undefined;
  pathname: string | null;
}): boolean {
  const { app, activeAppId, pathname } = params;

  if (activeAppId && activeAppId === app.id) return true;

  // Existing special cases from app-switcher.tsx
  if (app.id.includes('home') && activeAppId === 'dashboard') return true;
  if (app.id === 'ai-chatbots-messaging' && !!pathname?.startsWith('/ai-assistants/assistant')) return true;
  if (
    app.id === 'engagement-hub' &&
    (activeAppId === 'community' || activeAppId === 'alumni-engagement' || activeAppId === 'graduway-community')
  ) {
    return true;
  }
  if (
    app.id === 'advancement-philanthropy' &&
    (activeAppId === 'advancement' ||
      activeAppId === 'annual-giving' ||
      activeAppId === 'pipeline-outreach' ||
      activeAppId === 'stewardship-gratavid')
  ) {
    return true;
  }
  if (app.id === 'career-services' && (activeAppId === 'career' || activeAppId === 'career-hub')) return true;
  if (app.id === 'insights' && (activeAppId === 'data' || activeAppId === 'reporting-analytics')) return true;
  if (app.id === 'admin-settings' && (activeAppId === 'admin' || activeAppId === 'ai-control-center' || activeAppId === 'settings'))
    return true;

  // Student Lifecycle app boundary: keep active for all /student-lifecycle routes.
  if (app.id === 'student-lifecycle' && !!pathname?.startsWith('/student-lifecycle')) return true;

  // Pill routes should keep the top-level app active.
  if (pathname && app.pills && getActivePillId(app, pathname)) return true;

  return false;
}


