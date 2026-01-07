'use client';

/**
 * SIM Apps Page - Stub Implementation
 * 
 * TODO: Implement SIM Apps index and navigation (Banner/Colleague/Slate/Canvas SIM).
 */

export default function SimAppsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SIM Apps
        </h1>
        <p className="text-gray-600">
          Access simulated SIS, CRM, and LMS environments for testing and AI training.
        </p>
      </div>

      {/* SIM Apps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          href="/crm-mock"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CRM Mock</h3>
          <p className="text-sm text-gray-600">
            Mock Advancement CRM for testing, demos, and AI training.
          </p>
        </a>
      </div>
    </div>
  );
}









