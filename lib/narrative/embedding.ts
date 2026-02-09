/**
 * Embedding stub for Narrative Context (Phase 3).
 * Replace with real embedding service (same model as narrative assets for cosine similarity).
 */

/** Dimension must match narrative asset embeddings. Default placeholder. */
export const EMBEDDING_DIMENSION = 384;

/**
 * Stub: returns zero vector. Replace with call to embedding API.
 * Contract: same model for both narrative assets and context; dimension consistent.
 */
export function embedTextStub(_text: string): number[] {
  return new Array(EMBEDDING_DIMENSION).fill(0);
}
