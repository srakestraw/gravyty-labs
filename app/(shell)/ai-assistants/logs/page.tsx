"use client";

import { Suspense } from "react";
import { LogsPageClient } from "@/components/shared/logs/LogsPageClient";

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LogsPageClient basePath="/ai-assistants/logs" />
    </Suspense>
  );
}
