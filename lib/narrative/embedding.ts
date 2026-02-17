/**
 * Embedding for Narrative Context (Phase 3).
 * Uses OpenAI text-embedding-3-small when OPENAI_API_KEY is set; else stub.
 * Same model for both narrative assets and context; dimension consistent.
 */

import OpenAI from 'openai';

/** OpenAI text-embedding-3-small dimension. */
export const EMBEDDING_DIMENSION = 1536;

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

/**
 * embeds text. Uses OpenAI when OPENAI_API_KEY is set; else returns zero vector.
 * Contract: same model for both narrative assets and context.
 */
export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  if (!openai) return new Array(EMBEDDING_DIMENSION).fill(0);

  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8191),
  });
  const vec = res.data[0]?.embedding;
  return vec ?? new Array(EMBEDDING_DIMENSION).fill(0);
}

/** Stub: returns zero vector. Use embedText for real embeddings. */
export function embedTextStub(_text: string): number[] {
  return new Array(EMBEDDING_DIMENSION).fill(0);
}
