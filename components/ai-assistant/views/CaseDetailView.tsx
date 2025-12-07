'use client';

import { SlideUpSection, StaggerList } from '@/components/ui/animations';
import { CaseDetail } from '@/data/ai-assistant';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CaseDetailViewProps {
  caseDetail: CaseDetail;
  onBack: () => void;
}

export function CaseDetailView({ caseDetail, onBack }: CaseDetailViewProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAction = (action: string) => {
    // For now, just show an alert
    alert(`Action: ${action}`);
  };

  return (
    <SlideUpSection className="max-w-7xl mx-auto">
      <div className="space-y-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-4 w-4" />
          Back to high-priority cases
        </button>

        <div className="sticky top-0 bg-white border-b border-gray-200 pb-4 z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Viewing the Application Process Agent for {caseDetail.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Person Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{caseDetail.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Program</div>
                  <div className="font-medium text-gray-900">{caseDetail.program}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Advisor</div>
                  <div className="font-medium text-gray-900">{caseDetail.advisor}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Priority</div>
                  <span
                    className={cn(
                      'inline-block px-2 py-1 text-xs font-medium rounded-full',
                      getPriorityColor(caseDetail.priority)
                    )}
                  >
                    {caseDetail.priority}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Activity</div>
                  <div className="font-medium text-gray-900">{caseDetail.lastActivity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    {caseDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
              <p className="text-gray-700">{caseDetail.overview}</p>
            </div>

            {/* Current Findings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Findings</h3>
              <ul className="space-y-2">
                {caseDetail.currentFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why Stalled */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Stalled</h3>
              <ul className="space-y-2">
                {caseDetail.whyStalled.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Actions Taken */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Actions Taken</h3>
              <ul className="space-y-3">
                {caseDetail.recentActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-sm text-gray-500 min-w-[80px]">{action.timestamp}</span>
                    <div>
                      <div className="font-medium text-gray-900">{action.action}</div>
                      <div className="text-sm text-gray-600">{action.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* What Happens Next */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Happens Next</h3>
              <p className="text-gray-700">{caseDetail.whatHappensNext}</p>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
              <div className="flex flex-wrap gap-2">
                {caseDetail.recommendedNextSteps.map((step, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAction(step.action)}
                    variant="outline"
                    size="sm"
                  >
                    {step.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Activity Timeline</h3>
              <StaggerList className="space-y-4">
                {caseDetail.timeline.map((item, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                    <div className="text-xs text-gray-500 mb-1">{item.timestamp}</div>
                    <div className="font-medium text-gray-900 mb-1">{item.action}</div>
                    <div className="text-sm text-gray-600">{item.detail}</div>
                  </div>
                ))}
              </StaggerList>
            </div>
          </div>
        </div>
      </div>
    </SlideUpSection>
  );
}


