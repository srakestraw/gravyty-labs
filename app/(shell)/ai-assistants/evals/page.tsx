"use client";

import { Suspense } from "react";
import { EvalsPageClient } from "@/components/shared/evals/EvalsPageClient";

export default function EvalsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EvalsPageClient basePath="/ai-assistants/evals" />
    </Suspense>
  );
}
