'use server';

import { dataClient } from '@/lib/data';
import type { ProgramMatchDraftConfig } from '@/lib/data/provider';

export async function publishProgramMatchAction(
  draftConfig?: ProgramMatchDraftConfig | null,
  quizId?: string | null
) {
  const ctx = {
    workspace: 'admissions' as const,
    app: 'student-lifecycle' as const,
  };
  const snapshot = await dataClient.publishProgramMatchDraft(ctx, { draftConfig });
  if (quizId) {
    try {
      await dataClient.publishProgramMatchQuizDraft(ctx, quizId);
    } catch {
      // Quiz publish is best-effort
    }
  }
  return snapshot;
}
