/**
 * AI-Assisted Scoring and Reasons Generation
 * 
 * Provides AI assistance for:
 * 1. Adjusting ranking when baseline scores are close
 * 2. Generating candidate-friendly reasons aligned to Voice and Tone
 * 3. Suggesting follow-up questions when confidence is low
 * 
 * All outputs are schema-validated with deterministic fallback.
 */

import type {
  ProgramMatch,
  ProgramMatchOutcome,
  ConfidenceBand,
  GlobalConfidence,
  Program,
} from '../types';

export interface AIScoringInput {
  candidateResponses: Record<string, string | string[]>; // No PII
  programCatalog: Program[];
  baselineScores: ProgramMatchOutcome;
  voiceToneProfile?: string;
}

export interface AIScoringOutput {
  ranked_programs: Array<{
    program_id: string;
    confidence_band: ConfidenceBand;
    reasons: string[];
  }>;
  global_confidence: GlobalConfidence;
  recommended_followups?: Array<{
    question_id: string;
    rationale: string;
  }>;
}

/**
 * AI-assisted scoring with schema validation
 * 
 * This enhances baseline scoring by:
 * 1. Adjusting rankings when scores are very close
 * 2. Generating more personalized, candidate-friendly reasons
 * 3. Suggesting follow-up questions when confidence is low
 */
export async function generateAIScoring(
  input: AIScoringInput
): Promise<AIScoringOutput | null> {
  // TODO: Replace with actual OpenAI API call
  // For now, return null to use baseline fallback
  
  // In production, this would:
  // 1. Build prompt with candidate responses (no PII), programs, baseline scores
  // 2. Call OpenAI with strict JSON schema
  // 3. Validate output against schema
  // 4. Return enhanced scoring or null if validation fails

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // For now, return null to demonstrate fallback behavior
  // In production, this would parse and validate OpenAI response
  return null;
}

/**
 * Build AI scoring prompt
 */
export function buildAIScoringPrompt(input: AIScoringInput): string {
  const programDescriptions = input.programCatalog
    .map(
      (p) =>
        `${p.program_id}: ${p.name} - ${p.short_description}. Traits: ${Object.keys(p.icp_trait_weights).join(', ')}`
    )
    .join('\n');

  const baselineSummary = input.baselineScores.ranked_programs
    .map(
      (m, i) =>
        `${i + 1}. ${m.program_id} (${m.confidence_band}, score: ${(input.baselineScores as any).scores?.[m.program_id] || 'N/A'})`
    )
    .join('\n');

  return `You are a graduate program matching engine. Rank programs based only on provided candidate responses and program definitions. Do not invent facts. Output valid JSON only.

Candidate Responses (no PII):
${JSON.stringify(input.candidateResponses, null, 2)}

Program Catalog:
${programDescriptions}

Baseline Scores:
${baselineSummary}

Voice & Tone Profile:
${input.voiceToneProfile || 'Friendly, supportive, clear'}

Output JSON schema:
{
  "ranked_programs": [
    {
      "program_id": "string",
      "confidence_band": "strong|good|explore",
      "reasons": ["string", "string", "string"]
    }
  ],
  "global_confidence": "high|medium|low",
  "recommended_followups": [
    {
      "question_id": "string",
      "rationale": "string"
    }
  ]
}

Rules:
- Only use provided programs and signals
- Reasons must be grounded in candidate responses
- Reasons must align with voice and tone profile
- If confidence is low, suggest 1-2 follow-up questions
- Output valid JSON only, no extra text.`;
}

/**
 * Validate AI scoring output schema
 */
export function validateAIScoringOutput(
  output: unknown
): output is AIScoringOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const obj = output as Record<string, unknown>;

  // Validate ranked_programs
  if (!Array.isArray(obj.ranked_programs)) {
    return false;
  }

  for (const program of obj.ranked_programs) {
    if (
      typeof program !== 'object' ||
      !program.program_id ||
      !['strong', 'good', 'explore'].includes(program.confidence_band) ||
      !Array.isArray(program.reasons)
    ) {
      return false;
    }
  }

  // Validate global_confidence
  if (!['high', 'medium', 'low'].includes(obj.global_confidence as string)) {
    return false;
  }

  // Validate recommended_followups (optional)
  if (obj.recommended_followups !== undefined) {
    if (!Array.isArray(obj.recommended_followups)) {
      return false;
    }
    for (const followup of obj.recommended_followups) {
      if (
        typeof followup !== 'object' ||
        !followup.question_id ||
        !followup.rationale
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Merge AI scoring with baseline (with fallback)
 */
export function mergeAIScoring(
  baseline: ProgramMatchOutcome,
  aiOutput: AIScoringOutput | null
): ProgramMatchOutcome {
  // If AI output is invalid or null, return baseline
  if (!aiOutput || !validateAIScoringOutput(aiOutput)) {
    return baseline;
  }

  // Merge AI-enhanced reasons with baseline structure
  const merged: ProgramMatchOutcome = {
    ...baseline,
    generated_by: 'ai',
    ranked_programs: baseline.ranked_programs.map((baselineMatch, index) => {
      const aiMatch = aiOutput.ranked_programs.find(
        (m) => m.program_id === baselineMatch.program_id
      );

      if (aiMatch) {
        return {
          ...baselineMatch,
          confidence_band: aiMatch.confidence_band,
          reasons: aiMatch.reasons, // Use AI-generated reasons
        };
      }

      return baselineMatch; // Fallback to baseline if AI didn't provide match
    }),
    global_confidence: aiOutput.global_confidence,
  };

  return merged;
}

