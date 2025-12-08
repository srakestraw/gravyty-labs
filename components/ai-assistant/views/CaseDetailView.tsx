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
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleAction = (action: string) => {
    // For now, just show an alert
    alert(`Action: ${action}`);
  };

  return (
    <SlideUpSection className="max-w-7xl mx-auto px-4">
      <div className="space-y-6 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-left" className="h-4 w-4" />
          Back to priority cases
        </Button>

        <div className="sticky top-0 bg-background border-b border-border pb-4 z-10 -mx-4 px-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon="fa-solid fa-user-circle" className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Application Process Agent
              </h2>
              <p className="text-muted-foreground mt-1">{caseDetail.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Person Summary */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-info-circle" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Person Summary</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="font-medium text-foreground">{caseDetail.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Program</div>
                  <div className="font-medium text-foreground">{caseDetail.program}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Advisor</div>
                  <div className="font-medium text-foreground">{caseDetail.advisor}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Priority</div>
                  <span
                    className={cn(
                      'inline-block px-2.5 py-1 text-xs font-medium rounded-full border',
                      getPriorityColor(caseDetail.priority)
                    )}
                  >
                    {caseDetail.priority}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Activity</div>
                  <div className="font-medium text-foreground">{caseDetail.lastActivity}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                    {caseDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-file-lines" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Overview</h3>
              </div>
              <p className="text-foreground leading-relaxed">{caseDetail.overview}</p>
            </div>

            {/* Current Findings */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Current Findings</h3>
              </div>
              <ul className="space-y-3">
                {caseDetail.currentFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why Stalled */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Why Stalled</h3>
              </div>
              <ul className="space-y-3">
                {caseDetail.whyStalled.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Actions Taken */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-clock-rotate-left" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Recent Actions Taken</h3>
              </div>
              <ul className="space-y-4">
                {caseDetail.recentActions.map((action, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="min-w-[90px]">
                      <span className="text-xs text-muted-foreground font-medium">{action.timestamp}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground mb-1">{action.action}</div>
                      <div className="text-sm text-muted-foreground">{action.detail}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* What Happens Next */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">What Happens Next</h3>
              </div>
              <p className="text-foreground leading-relaxed">{caseDetail.whatHappensNext}</p>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon="fa-solid fa-list-check" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Recommended Next Steps</h3>
              </div>
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
            <div className="bg-background border border-border rounded-lg p-6 sticky top-20 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon="fa-solid fa-timeline" className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Agent Activity Timeline</h3>
              </div>
              <StaggerList className="space-y-4">
                {caseDetail.timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0 relative"
                  >
                    <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="text-xs text-muted-foreground mb-1 font-medium">{item.timestamp}</div>
                    <div className="font-medium text-foreground mb-1">{item.action}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{item.detail}</div>
                  </motion.div>
                ))}
              </StaggerList>
            </div>
          </div>
        </div>
      </div>
    </SlideUpSection>
  );
}




