/**
 * Readiness Assessment Scoring Engine
 * 
 * Implements rubric-based scoring for readiness assessments:
 * 1. Maps responses to dimension scores
 * 2. Calculates weighted dimension scores
 * 3. Determines readiness band (Ready, Nearly Ready, Explore Prep Path)
 * 4. Identifies gaps and recommends prep guidance
 */

import type {
  ReadinessRubric,
  ReadinessQuestion,
  ReadinessOption,
  ReadinessDimension,
  ReadinessBand,
  PrepGuidance,
  ProgramMatchReadiness,
} from './types';

export interface ReadinessResponse {
  question_id: string;
  answer: string | string[];
}

/**
 * Calculate dimension scores from readiness responses
 */
export function calculateDimensionScores(
  questions: ReadinessQuestion[],
  responses: Record<string, string | string[]>
): Record<string, number> {
  const dimensionScores: Record<string, number> = {};

  for (const question of questions) {
    const answer = responses[question.question_id];
    if (!answer) continue;

    // Handle single-select
    if (question.type === 'single_select' && typeof answer === 'string') {
      const option = question.options?.find((opt) => opt.option_id === answer);
      if (option && option.dimension_scores) {
        for (const [dimensionId, score] of Object.entries(option.dimension_scores)) {
          dimensionScores[dimensionId] = (dimensionScores[dimensionId] || 0) + score;
        }
      }
    }

    // Handle multi-select
    if (question.type === 'multi_select' && Array.isArray(answer)) {
      for (const optionId of answer) {
        const option = question.options?.find((opt) => opt.option_id === optionId);
        if (option && option.dimension_scores) {
          for (const [dimensionId, score] of Object.entries(option.dimension_scores)) {
            dimensionScores[dimensionId] = (dimensionScores[dimensionId] || 0) + score;
          }
        }
      }
    }

    // Handle slider/confidence (maps directly to dimension via question mappings)
    if ((question.type === 'slider' || question.type === 'confidence') && typeof answer === 'string') {
      const value = parseInt(answer, 10);
      // Map to dimensions based on question dimension_mappings
      for (const [dimensionId, multiplier] of Object.entries(question.dimension_mappings)) {
        dimensionScores[dimensionId] = (dimensionScores[dimensionId] || 0) + (value * multiplier);
      }
    }
  }

  return dimensionScores;
}

/**
 * Calculate weighted readiness score from dimension scores
 */
export function calculateWeightedScore(
  rubric: ReadinessRubric,
  dimensionScores: Record<string, number>
): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const dimension of rubric.dimensions) {
    const score = dimensionScores[dimension.dimension_id] || 0;
    // Normalize score to 0-3 range (assuming max level is 3)
    const normalizedScore = Math.min(score / 3, 1); // Cap at 1.0
    totalScore += normalizedScore * dimension.weight;
    totalWeight += dimension.weight;
  }

  // Return weighted average (0-1 scale)
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Determine readiness band from weighted score
 */
export function determineReadinessBand(
  rubric: ReadinessRubric,
  weightedScore: number
): ReadinessBand {
  // Convert weighted score (0-1) to 0-3 scale for comparison
  const scoreOnScale = weightedScore * 3;

  if (scoreOnScale >= rubric.band_thresholds.ready) {
    return 'ready';
  } else if (scoreOnScale >= rubric.band_thresholds.nearly_ready) {
    return 'nearly_ready';
  } else {
    return 'explore_prep_path';
  }
}

/**
 * Identify gaps and recommend prep guidance
 */
export function identifyPrepGuidance(
  rubric: ReadinessRubric,
  dimensionScores: Record<string, number>,
  prepGuidanceLibrary: PrepGuidance[]
): PrepGuidance[] {
  const gaps: string[] = [];

  // Find dimensions with low scores (below threshold)
  for (const dimension of rubric.dimensions) {
    const score = dimensionScores[dimension.dimension_id] || 0;
    const normalizedScore = score / 3; // Normalize to 0-1

    // If dimension score is below 0.6 (60% of max), consider it a gap
    if (normalizedScore < 0.6) {
      gaps.push(dimension.dimension_id);
    }
  }

  // Find prep guidance that addresses these gaps
  const relevantGuidance = prepGuidanceLibrary.filter((guidance) => {
    // Check if guidance addresses any of the gap dimensions
    return guidance.gap_dimensions.some((dimId) => gaps.includes(dimId));
  });

  // If no specific guidance matches, return general prep guidance
  if (relevantGuidance.length === 0) {
    return prepGuidanceLibrary.filter((g) => g.gap_dimensions.length === 0).slice(0, 3);
  }

  return relevantGuidance.slice(0, 3); // Return top 3
}

/**
 * Generate readiness summary text
 */
export function generateReadinessSummary(
  band: ReadinessBand,
  programName: string
): string {
  switch (band) {
    case 'ready':
      return `You're ready to succeed in ${programName}! Your background and experience align well with what we're looking for.`;
    case 'nearly_ready':
      return `You're nearly ready for ${programName}. A few preparation steps will help you excel in the program.`;
    case 'explore_prep_path':
      return `Let's explore a preparation path for ${programName}. We'll help you build the skills and knowledge needed to succeed.`;
    default:
      return `Based on your responses, here's your readiness assessment for ${programName}.`;
  }
}

/**
 * Generate next steps based on readiness band
 */
export function generateNextSteps(
  band: ReadinessBand,
  prepGuidance: PrepGuidance[]
): string[] {
  const steps: string[] = [];

  switch (band) {
    case 'ready':
      steps.push('Review program requirements and application deadlines');
      steps.push('Connect with program advisors to discuss your goals');
      steps.push('Prepare your application materials');
      break;
    case 'nearly_ready':
      if (prepGuidance.length > 0) {
        steps.push(...prepGuidance[0].steps.slice(0, 2));
      }
      steps.push('Schedule a consultation with admissions to discuss your preparation plan');
      break;
    case 'explore_prep_path':
      if (prepGuidance.length > 0) {
        steps.push(...prepGuidance[0].steps);
      }
      steps.push('Connect with our preparation program advisors');
      break;
  }

  return steps;
}

/**
 * Main readiness scoring function
 */
export function scoreReadiness(
  rubric: ReadinessRubric,
  questions: ReadinessQuestion[],
  responses: Record<string, string | string[]>,
  prepGuidanceLibrary: PrepGuidance[],
  programName: string
): ProgramMatchReadiness {
  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(questions, responses);

  // Calculate weighted score
  const weightedScore = calculateWeightedScore(rubric, dimensionScores);

  // Determine readiness band
  const band = determineReadinessBand(rubric, weightedScore);

  // Identify prep guidance
  const prepGuidance = identifyPrepGuidance(rubric, dimensionScores, prepGuidanceLibrary);

  // Generate summary and next steps
  const summary = generateReadinessSummary(band, programName);
  const nextSteps = generateNextSteps(band, prepGuidance);

  return {
    lead_id: '', // Will be set by caller
    program_id: rubric.program_id,
    readiness_band: band,
    dimension_scores: dimensionScores,
    prep_guidance_ids: prepGuidance.map((g) => g.guidance_id),
    prep_guidance: prepGuidance,
    summary,
    next_steps: nextSteps,
    completed_at: new Date().toISOString(),
  };
}

