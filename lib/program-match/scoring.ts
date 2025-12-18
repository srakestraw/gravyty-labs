/**
 * Baseline Deterministic Scoring Engine for Program Match
 * 
 * This implements the deterministic matching algorithm that:
 * 1. Maps candidate responses to trait and skill signals
 * 2. Scores each program by weighted alignment
 * 3. Produces top 1-3 matches with confidence bands
 * 4. Generates template-based reasons
 */

import type {
  Program,
  QuizQuestion,
  QuizOption,
  ProgramMatch,
  ProgramMatchOutcome,
  ConfidenceBand,
  GlobalConfidence,
} from './types';

export interface CandidateSignals {
  traits: Record<string, number>; // trait_id -> score
  skills: Record<string, number>; // skill_id -> score
}

/**
 * Calculate candidate signals from quiz responses
 */
export function calculateCandidateSignals(
  questions: QuizQuestion[],
  responses: Record<string, string | string[]>
): CandidateSignals {
  const traits: Record<string, number> = {};
  const skills: Record<string, number> = {};

  // Process each response
  for (const question of questions) {
    const answer = responses[question.question_id];
    if (!answer) continue;

    // Handle single-select
    if (question.type === 'single_select' && typeof answer === 'string') {
      const option = question.options?.find((opt) => opt.option_id === answer);
      if (option) {
        // Add trait deltas
        if (option.trait_deltas) {
          for (const [traitId, delta] of Object.entries(option.trait_deltas)) {
            traits[traitId] = (traits[traitId] || 0) + delta;
          }
        }
        // Add skill deltas
        if (option.skill_deltas) {
          for (const [skillId, delta] of Object.entries(option.skill_deltas)) {
            skills[skillId] = (skills[skillId] || 0) + delta;
          }
        }
      }
    }

    // Handle multi-select
    if (question.type === 'multi_select' && Array.isArray(answer)) {
      for (const optionId of answer) {
        const option = question.options?.find((opt) => opt.option_id === optionId);
        if (option) {
          if (option.trait_deltas) {
            for (const [traitId, delta] of Object.entries(option.trait_deltas)) {
              traits[traitId] = (traits[traitId] || 0) + delta;
            }
          }
          if (option.skill_deltas) {
            for (const [skillId, delta] of Object.entries(option.skill_deltas)) {
              skills[skillId] = (skills[skillId] || 0) + delta;
            }
          }
        }
      }
    }

    // Handle slider (maps to skill confidence)
    if (question.type === 'slider' && typeof answer === 'string') {
      const value = parseInt(answer, 10);
      // Map slider value to quantitative confidence if question is about quantitative skills
      if (question.question_id.includes('quantitative') || question.question_id.includes('math')) {
        skills['quantitative_confidence'] = (skills['quantitative_confidence'] || 0) + value;
      } else if (question.question_id.includes('writing') || question.question_id.includes('communication')) {
        skills['writing_confidence'] = (skills['writing_confidence'] || 0) + value;
      }
    }
  }

  // Normalize signals (optional - can be adjusted)
  // For now, we'll use raw scores

  return { traits, skills };
}

/**
 * Calculate program alignment score
 */
export function calculateProgramScore(
  program: Program,
  candidateSignals: CandidateSignals
): {
  score: number;
  traitSignals: Record<string, number>;
  skillSignals: Record<string, number>;
} {
  let totalScore = 0;
  const traitSignals: Record<string, number> = {};
  const skillSignals: Record<string, number> = {};

  // Calculate trait alignment
  for (const [traitId, weight] of Object.entries(program.icp_trait_weights)) {
    const candidateValue = candidateSignals.traits[traitId] || 0;
    const alignment = candidateValue * weight;
    traitSignals[traitId] = alignment;
    totalScore += alignment;
  }

  // Calculate skill alignment
  for (const [skillId, weight] of Object.entries(program.icp_skill_weights)) {
    const candidateValue = candidateSignals.skills[skillId] || 0;
    const alignment = candidateValue * weight;
    skillSignals[skillId] = alignment;
    totalScore += alignment;
  }

  return {
    score: totalScore,
    traitSignals,
    skillSignals,
  };
}

/**
 * Determine confidence band for a match
 */
export function determineConfidenceBand(
  score: number,
  topScore: number,
  runnerUpScore: number | null,
  completeness: number // 0-1, how many key signals were provided
): ConfidenceBand {
  // Strong match: high score, good separation from runner-up, high completeness
  if (score >= topScore * 0.9 && completeness >= 0.7) {
    if (runnerUpScore === null || score >= runnerUpScore * 1.2) {
      return 'strong';
    }
    if (score >= runnerUpScore * 1.1) {
      return 'strong';
    }
  }

  // Good fit: decent score and completeness
  if (score >= topScore * 0.7 && completeness >= 0.5) {
    return 'good';
  }

  // Explore: lower score or incomplete signals
  return 'explore';
}

/**
 * Calculate global confidence
 */
export function calculateGlobalConfidence(
  topMatches: Array<{ score: number; confidence: ConfidenceBand }>,
  completeness: number
): GlobalConfidence {
  if (topMatches.length === 0) return 'low';

  const topMatch = topMatches[0];
  const hasStrongMatch = topMatch.confidence === 'strong';
  const hasGoodSeparation = topMatches.length === 1 || 
    (topMatches.length > 1 && topMatch.score >= (topMatches[1].score || 0) * 1.2);

  if (hasStrongMatch && hasGoodSeparation && completeness >= 0.7) {
    return 'high';
  }

  if (topMatch.confidence === 'good' && completeness >= 0.5) {
    return 'medium';
  }

  return 'low';
}

/**
 * Generate template-based reasons for a program match
 */
export function generateTemplateReasons(
  program: Program,
  candidateSignals: CandidateSignals,
  traitSignals: Record<string, number>,
  skillSignals: Record<string, number>,
  traitLabels: Record<string, string>,
  skillLabels: Record<string, string>
): string[] {
  const reasons: string[] = [];

  // Find top aligned traits
  const topTraits = Object.entries(traitSignals)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  // Find top aligned skills
  const topSkills = Object.entries(skillSignals)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 2);

  // Generate trait-based reasons
  for (const [traitId, alignment] of topTraits) {
    const traitLabel = traitLabels[traitId] || traitId;
    const programName = program.name;
    
    if (alignment > 0.15) {
      reasons.push(`Your ${traitLabel.toLowerCase()} aligns well with our ${programName} program`);
    } else if (alignment > 0.1) {
      reasons.push(`Your ${traitLabel.toLowerCase()} is a good fit for ${programName}`);
    }
  }

  // Generate skill-based reasons
  for (const [skillId, alignment] of topSkills) {
    const skillLabel = skillLabels[skillId] || skillId;
    const programName = program.name;
    
    if (alignment > 0.2) {
      reasons.push(`Your ${skillLabel.toLowerCase()} strengths match what we're looking for in ${programName}`);
    }
  }

  // Add program-specific reasons based on tags
  if (program.tags.includes('leadership') && candidateSignals.traits['leadership_orientation']) {
    reasons.push(`Our ${program.name} emphasizes leadership development, which matches your orientation`);
  }

  if (program.tags.includes('research') && candidateSignals.traits['orientation_research']) {
    reasons.push(`Your research interests align with our ${program.name} focus`);
  }

  // Ensure we have at least 3 reasons, pad with generic ones if needed
  while (reasons.length < 3) {
    reasons.push(`Our ${program.name} could be a great fit based on your responses`);
  }

  return reasons.slice(0, 5); // Return top 5 reasons
}

/**
 * Main scoring function: score all programs and return top matches
 * 
 * Can optionally use AI assistance if enabled and available.
 */
export async function scorePrograms(
  programs: Program[],
  questions: QuizQuestion[],
  responses: Record<string, string | string[]>,
  traitLabels: Record<string, string> = {},
  skillLabels: Record<string, string> = {},
  options?: {
    useAI?: boolean;
    voiceToneProfile?: string;
  }
): Promise<ProgramMatchOutcome> {
  // Calculate candidate signals
  const candidateSignals = calculateCandidateSignals(questions, responses);

  // Calculate completeness (how many questions were answered)
  const answeredCount = Object.keys(responses).length;
  const totalRequired = questions.filter((q) => q.required).length;
  const completeness = totalRequired > 0 ? answeredCount / totalRequired : 1;

  // Score each program
  const programScores = programs.map((program) => {
    const { score, traitSignals, skillSignals } = calculateProgramScore(program, candidateSignals);
    return {
      program,
      score,
      traitSignals,
      skillSignals,
    };
  });

  // Sort by score (descending)
  programScores.sort((a, b) => b.score - a.score);

  // Get top 3
  const top3 = programScores.slice(0, 3);
  const topScore = top3[0]?.score || 0;
  const runnerUpScore = top3[1]?.score || null;

  // Determine confidence bands
  const matches: ProgramMatch[] = top3.map((item, index) => {
    const confidence = determineConfidenceBand(
      item.score,
      topScore,
      index === 0 ? runnerUpScore : topScore,
      completeness
    );

    const reasons = generateTemplateReasons(
      item.program,
      candidateSignals,
      item.traitSignals,
      item.skillSignals,
      traitLabels,
      skillLabels
    );

    return {
      program_id: item.program.program_id,
      confidence_band: confidence,
      reasons,
      trait_signals: item.traitSignals,
      skill_signals: item.skillSignals,
    };
  });

  // Calculate global confidence
  const globalConfidence = calculateGlobalConfidence(
    matches.map((m) => ({ score: top3.find((p) => p.program.program_id === m.program_id)?.score || 0, confidence: m.confidence_band })),
    completeness
  );

  // Find top trait and skill signals across all matches
  const allTraitSignals: Record<string, number> = {};
  const allSkillSignals: Record<string, number> = {};

  for (const match of matches) {
    if (match.trait_signals) {
      for (const [traitId, value] of Object.entries(match.trait_signals)) {
        allTraitSignals[traitId] = (allTraitSignals[traitId] || 0) + value;
      }
    }
    if (match.skill_signals) {
      for (const [skillId, value] of Object.entries(match.skill_signals)) {
        allSkillSignals[skillId] = (allSkillSignals[skillId] || 0) + value;
      }
    }
  }

  // Get top signals
  const topTraitSignals = Object.entries(allTraitSignals)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)
    .reduce((acc, [id, value]) => ({ ...acc, [id]: value }), {});

  const topSkillSignals = Object.entries(allSkillSignals)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)
    .reduce((acc, [id, value]) => ({ ...acc, [id]: value }), {});

  const baselineOutcome: ProgramMatchOutcome = {
    lead_id: '', // Will be set by caller
    ranked_programs: matches,
    global_confidence: globalConfidence,
    generated_by: 'baseline',
    top_trait_signals: topTraitSignals,
    top_skill_signals: topSkillSignals,
    session_context: {
      questions_answered: answeredCount,
      total_questions: questions.length,
    },
    created_at: new Date().toISOString(),
  };

  // Try AI assistance if enabled
  if (options?.useAI) {
    try {
      const { generateAIScoring, mergeAIScoring } = await import('./ai/scoring-assist');
      
      const aiInput = {
        candidateResponses: responses, // No PII included
        programCatalog: programs,
        baselineScores: baselineOutcome,
        voiceToneProfile: options.voiceToneProfile,
      };

      const aiOutput = await generateAIScoring(aiInput);
      
      if (aiOutput) {
        return mergeAIScoring(baselineOutcome, aiOutput);
      }
    } catch (error) {
      // Log error but don't block - fall back to baseline
      console.error('AI scoring failed, using baseline:', error);
    }
  }

  return baselineOutcome;
}

