'use client';

/**
 * Gravyty Dashboard - V1 Implementation
 * 
 * This is the unified Home experience at /dashboard/ showing:
 * 1. Action Center (My Tasks & Alerts)
 * 2. AI Activity Overview
 * 3. Engagement & Fundraising KPIs
 * 4. Lifecycle Scorecard
 * 5. Quick Actions
 * 6. Recent Activity Feed
 * 
 * Components are located in: components/dashboard/
 * 
 * TODO: Replace mock data with real API integrations:
 * - ActionCenter: Wire to Data Cloud tasks/alerts API
 * - AiActivityOverview: Connect to /ai-assistants endpoint
 * - EngagementKpis: Pull from Data Cloud analytics API
 * - LifecycleScorecard: Connect to lifecycle metrics API
 * - RecentActivityFeed: Aggregate from all platform activity streams
 */

import { useAuth } from '@/lib/firebase/auth-context';
import { ActionCenter } from '@/components/dashboard/ActionCenter';
import { AiActivityOverview } from '@/components/dashboard/AiActivityOverview';
import { EngagementKpis } from '@/components/dashboard/EngagementKpis';
import { LifecycleScorecard } from '@/components/dashboard/LifecycleScorecard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Your unified dashboard for tasks, AI activity, engagement metrics, and platform activity.
        </p>
      </div>

      {/* Top Row: Action Center (Full Width) */}
      <div className="w-full">
        <ActionCenter />
      </div>

      {/* Second Row: AI Activity Overview (2/3) + Quick Actions (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AiActivityOverview />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Third Row: Engagement KPIs (1/2) + Lifecycle Scorecard (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EngagementKpis />
        </div>
        <div>
          <LifecycleScorecard />
        </div>
      </div>

      {/* Bottom Row: Recent Activity Feed (Full Width) */}
      <div className="w-full">
        <RecentActivityFeed />
      </div>
    </div>
  );
}
