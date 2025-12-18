/**
 * AI Quiz Generator
 * 
 * Generates quiz drafts using OpenAI with strict schema validation.
 * Admin-facing feature for creating initial quiz structures.
 */

import type { QuizQuestion, QuizOption, Trait, Skill, Program } from '../types';

export interface QuizGenerationInput {
  programCatalog: Program[];
  voiceToneRules?: string;
  maxQuestions?: number;
  targetMinutes?: number;
}

export interface QuizGenerationOutput {
  traitFramework: {
    recommendedTraits: Array<{
      trait_id: string;
      label: string;
      description: string;
      type: string;
    }>;
  };
  skillSignals: {
    recommendedSkills: Array<{
      skill_id: string;
      label: string;
      description: string;
      type: string;
    }>;
  };
  questions: Array<{
    question_id: string;
    text: string;
    type: 'single_select' | 'multi_select' | 'slider';
    required: boolean;
    order: number;
    options: Array<{
      option_id: string;
      text: string;
      trait_deltas: Record<string, number>;
      skill_deltas?: Record<string, number>;
    }>;
  }>;
}

/**
 * Generate quiz draft using AI
 * 
 * This is a placeholder implementation. In production, this would:
 * 1. Call OpenAI API with structured prompt
 * 2. Validate JSON schema output
 * 3. Return structured quiz data
 * 
 * For now, returns a mock structure that demonstrates the expected output format.
 */
export async function generateQuizDraft(
  input: QuizGenerationInput
): Promise<QuizGenerationOutput> {
  // TODO: Replace with actual OpenAI API call
  // For now, return a structured mock that demonstrates the format
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Extract program names and characteristics
  const programNames = input.programCatalog.map((p) => p.name).join(', ');
  const programTags = Array.from(
    new Set(input.programCatalog.flatMap((p) => p.tags))
  ).join(', ');

  // Generate mock quiz structure based on programs
  const questions: QuizGenerationOutput['questions'] = [
    {
      question_id: 'q1',
      text: 'How do you prefer to learn new concepts?',
      type: 'single_select',
      required: true,
      order: 1,
      options: [
        {
          option_id: 'opt1_1',
          text: 'Through visual diagrams and charts',
          trait_deltas: { learning_style_visual: 10 },
        },
        {
          option_id: 'opt1_2',
          text: 'By doing hands-on practice',
          trait_deltas: { learning_style_hands_on: 10 },
        },
        {
          option_id: 'opt1_3',
          text: 'Through reading and research',
          trait_deltas: { orientation_research: 10 },
        },
        {
          option_id: 'opt1_4',
          text: 'By applying to real problems',
          trait_deltas: { orientation_applied: 10 },
        },
      ],
    },
    {
      question_id: 'q2',
      text: 'What best describes your work style?',
      type: 'single_select',
      required: true,
      order: 2,
      options: [
        {
          option_id: 'opt2_1',
          text: 'I prefer working in teams',
          trait_deltas: { collaboration_preference: 10 },
        },
        {
          option_id: 'opt2_2',
          text: 'I like to take the lead',
          trait_deltas: { leadership_orientation: 10 },
        },
        {
          option_id: 'opt2_3',
          text: 'I work well independently',
          trait_deltas: { persistence: 8 },
        },
      ],
    },
    {
      question_id: 'q3',
      text: 'How confident are you with quantitative analysis?',
      type: 'slider',
      required: true,
      order: 3,
      options: [],
    },
  ];

  return {
    traitFramework: {
      recommendedTraits: [
        {
          trait_id: 'learning_style_visual',
          label: 'Visual Learner',
          description: 'Prefers visual aids and diagrams',
          type: 'learning_style',
        },
        {
          trait_id: 'learning_style_hands_on',
          label: 'Hands-On Learner',
          description: 'Learns best through practice and application',
          type: 'learning_style',
        },
        {
          trait_id: 'orientation_research',
          label: 'Research-Oriented',
          description: 'Enjoys research and theoretical exploration',
          type: 'orientation',
        },
        {
          trait_id: 'orientation_applied',
          label: 'Applied Focus',
          description: 'Prefers practical, real-world application',
          type: 'orientation',
        },
        {
          trait_id: 'collaboration_preference',
          label: 'Collaborative',
          description: 'Works well in teams and group settings',
          type: 'preference',
        },
        {
          trait_id: 'leadership_orientation',
          label: 'Leadership-Oriented',
          description: 'Takes initiative and leads others',
          type: 'personality',
        },
      ],
    },
    skillSignals: {
      recommendedSkills: [
        {
          skill_id: 'quantitative_confidence',
          label: 'Quantitative Skills',
          description: 'Confidence with math and data analysis',
          type: 'confidence',
        },
        {
          skill_id: 'writing_confidence',
          label: 'Writing & Communication',
          description: 'Confidence with written and verbal communication',
          type: 'confidence',
        },
      ],
    },
    questions: questions.slice(0, input.maxQuestions || 12),
  };
}

/**
 * Generate AI prompt for quiz generation
 */
export function buildQuizGenerationPrompt(input: QuizGenerationInput): string {
  const programNames = input.programCatalog.map((p) => p.name).join(', ');
  const programDescriptions = input.programCatalog
    .map((p) => `${p.name}: ${p.short_description}`)
    .join('\n');

  return `You are an admissions quiz designer. Create short, friendly questions to match graduate candidates to programs.

Programs to match:
${programDescriptions}

Constraints:
- Maximum questions: ${input.maxQuestions || 12}
- Target completion time: ${input.targetMinutes || 4} minutes
- Avoid jargon and sensitive attributes
- Keep questions friendly and non-intimidating
- Focus on learning style, work preferences, interests, and confidence levels

Voice & Tone Guidelines:
${input.voiceToneRules || 'Friendly, supportive, clear, and encouraging'}

Return JSON only with this structure:
{
  "traitFramework": {
    "recommendedTraits": [{"trait_id": "...", "label": "...", "description": "...", "type": "..."}]
  },
  "skillSignals": {
    "recommendedSkills": [{"skill_id": "...", "label": "...", "description": "...", "type": "..."}]
  },
  "questions": [{
    "question_id": "...",
    "text": "...",
    "type": "single_select|multi_select|slider",
    "required": true,
    "order": 1,
    "options": [{
      "option_id": "...",
      "text": "...",
      "trait_deltas": {"trait_id": number},
      "skill_deltas": {"skill_id": number}
    }]
  }]
}

No extra text, only valid JSON.`;
}

/**
 * Validate quiz generation output schema
 */
export function validateQuizGenerationOutput(
  output: unknown
): output is QuizGenerationOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const obj = output as Record<string, unknown>;

  // Validate traitFramework
  if (!obj.traitFramework || typeof obj.traitFramework !== 'object') {
    return false;
  }

  // Validate skillSignals
  if (!obj.skillSignals || typeof obj.skillSignals !== 'object') {
    return false;
  }

  // Validate questions array
  if (!Array.isArray(obj.questions)) {
    return false;
  }

  // Validate each question
  for (const question of obj.questions) {
    if (
      typeof question !== 'object' ||
      !question.question_id ||
      !question.text ||
      !['single_select', 'multi_select', 'slider'].includes(question.type)
    ) {
      return false;
    }
  }

  return true;
}

