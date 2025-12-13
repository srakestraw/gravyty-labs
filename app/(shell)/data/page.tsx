'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';

/**
 * Insights Hub - Reporting & Data
 * 
 * This hub provides access to:
 * - Reporting & Analytics
 * - Data sources, sync status, and integrations
 */

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Insights
        </h1>
        <p className="text-gray-600">
          Reporting and data across all products.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <FontAwesomeIcon icon="fa-solid fa-chart-bar" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporting & Analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Dashboards and metrics across products.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/data">Open Reporting</Link>
          </Button>
          {/* TODO: Update route when dedicated reporting/analytics page is available */}
        </div>

        <div className="rounded-lg border bg-white p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <FontAwesomeIcon icon="fa-solid fa-database" className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Data sources, sync status, and tables powering your insights.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/data">Open Data</Link>
          </Button>
        </div>
      </div>

      {/* TODO: Implement full Data workspace (integrations, connectors, monitoring). */}
    </div>
  );
}


