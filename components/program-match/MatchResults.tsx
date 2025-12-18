'use client';

import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@/components/ui/font-awesome-icon';
import type { ProgramMatchOutcome, Program } from '@/lib/program-match/types';

interface MatchResultsProps {
  outcome: ProgramMatchOutcome;
  programs: Program[];
  onCheckReadiness?: (programId: string) => void;
  onPrimaryCTA?: (programId: string) => void;
  onFeedback?: (helpful: boolean) => void;
  primaryCTALabel?: string;
  showReadinessOption?: boolean;
}

export function MatchResults({
  outcome,
  programs,
  onCheckReadiness,
  onPrimaryCTA,
  onFeedback,
  primaryCTALabel = 'Learn More',
  showReadinessOption = true,
}: MatchResultsProps) {
  const getProgram = (programId: string): Program | undefined => {
    return programs.find((p) => p.program_id === programId);
  };

  const getConfidenceBadgeClass = (band: string) => {
    switch (band) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'explore':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceLabel = (band: string) => {
    switch (band) {
      case 'strong':
        return 'Strong Match';
      case 'good':
        return 'Good Fit';
      case 'explore':
        return 'Explore';
      default:
        return band;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Program Matches
        </h2>
        <p className="text-gray-600">
          Based on your responses, here are the programs that best fit your goals and interests.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {outcome.ranked_programs.map((match, index) => {
          const program = getProgram(match.program_id);
          if (!program) return null;

          return (
            <div
              key={match.program_id}
              className="border-2 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{program.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{program.short_description}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full border text-sm font-semibold ${getConfidenceBadgeClass(
                    match.confidence_band
                  )}`}
                >
                  {getConfidenceLabel(match.confidence_band)}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Why this program fits:</h4>
                <ul className="space-y-2">
                  {match.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <FontAwesomeIcon
                        icon="fa-solid fa-check-circle"
                        className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
                      />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                {onPrimaryCTA && (
                  <Button
                    onClick={() => onPrimaryCTA(match.program_id)}
                    className="flex-1 min-w-[150px]"
                  >
                    {primaryCTALabel}
                  </Button>
                )}
                {showReadinessOption && onCheckReadiness && (
                  <Button
                    onClick={() => onCheckReadiness(match.program_id)}
                    variant="outline"
                    className="flex-1 min-w-[150px]"
                  >
                    Check Readiness
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onFeedback && (
        <div className="border-t pt-6 mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Was this helpful?</p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => onFeedback(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon="fa-solid fa-thumbs-up" className="h-4 w-4" />
                Yes
              </Button>
              <Button
                onClick={() => onFeedback(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon="fa-solid fa-thumbs-down" className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

