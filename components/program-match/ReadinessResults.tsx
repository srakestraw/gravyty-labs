'use client';

import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { ProgramMatchReadiness, PrepGuidance } from '@/lib/program-match/types';

interface ReadinessResultsProps {
  readiness: ProgramMatchReadiness;
  programName: string;
  onPrimaryCTA?: () => void;
  primaryCTALabel?: string;
}

export function ReadinessResults({
  readiness,
  programName,
  onPrimaryCTA,
  primaryCTALabel = 'Get Started',
}: ReadinessResultsProps) {
  const getBandLabel = (band: string) => {
    switch (band) {
      case 'ready':
        return 'Ready';
      case 'nearly_ready':
        return 'Nearly Ready';
      case 'explore_prep_path':
        return 'Explore Prep Path';
      default:
        return band;
    }
  };

  const getBandClass = (band: string) => {
    switch (band) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'nearly_ready':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'explore_prep_path':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBandIcon = (band: string) => {
    switch (band) {
      case 'ready':
        return 'fa-solid fa-check-circle';
      case 'nearly_ready':
        return 'fa-solid fa-circle-check';
      case 'explore_prep_path':
        return 'fa-solid fa-compass';
      default:
        return 'fa-solid fa-info-circle';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${getBandClass(readiness.readiness_band)}`}>
          <FontAwesomeIcon icon={getBandIcon(readiness.readiness_band)} className="h-5 w-5" />
          <span className="font-semibold">{getBandLabel(readiness.readiness_band)}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Readiness Assessment
        </h2>
        <p className="text-gray-600">
          {readiness.summary || `Here's your readiness assessment for ${programName}.`}
        </p>
      </div>

      {/* Prep Guidance */}
      {readiness.prep_guidance && readiness.prep_guidance.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recommended Preparation Steps
          </h3>
          <div className="space-y-4">
            {readiness.prep_guidance.map((guidance, index) => (
              <div key={guidance.guidance_id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{guidance.title}</h4>
                {guidance.description && (
                  <p className="text-gray-600 mb-3">{guidance.description}</p>
                )}
                {guidance.steps && guidance.steps.length > 0 && (
                  <ul className="space-y-2">
                    {guidance.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-gray-700">
                        <FontAwesomeIcon
                          icon="fa-solid fa-check"
                          className="h-4 w-4 text-primary mt-1 flex-shrink-0"
                        />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {readiness.next_steps && readiness.next_steps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Next Steps
          </h3>
          <ul className="space-y-2">
            {readiness.next_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-right"
                  className="h-4 w-4 text-primary mt-1 flex-shrink-0"
                />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary CTA */}
      {onPrimaryCTA && (
        <div className="text-center">
          <Button onClick={onPrimaryCTA} size="lg">
            {primaryCTALabel}
          </Button>
        </div>
      )}
    </div>
  );
}

