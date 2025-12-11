import { Suspense } from "react";
import { GuardrailsShell } from "@/components/shared/guardrails/GuardrailsShell";

export default function GuardrailsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <GuardrailsShell context="admin" />
    </Suspense>
  );
}
