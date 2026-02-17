/**
 * Webhook dispatcher: simulated by default; real call only when AGENTS_ENABLE_REAL_WEBHOOK.
 * TODO: Real HTTP call to connector baseUrl + path when feature flag on.
 */

import type { Agent } from "../../api-types";
import { getWebhookConnector } from "../../store";
import { isRealWebhookEnabled } from "../feature-flags";
import { createAgentActionLog, createApprovalRequest, appendAuditLog } from "../../store";
import { redactPayloadPreview } from "@/lib/security/redaction";
import type { ActionPlanItem } from "../types";
import type { AgentActionLogStatus } from "../../api-types";

export interface WebhookDispatchResult {
  actionLogId: string;
  status: AgentActionLogStatus;
  approvalRequestId?: string;
  error?: string;
}

export function dispatchWebhook(
  agentId: string,
  workspaceId: string,
  runId: string,
  plan: ActionPlanItem,
  requiresApproval: boolean,
  mode: "DRY_RUN" | "LIVE"
): WebhookDispatchResult {
  const connectorId = plan.connectorId ?? agentId;
  const connector = getWebhookConnector(connectorId);
  const payloadRedacted = JSON.stringify({
    type: "webhook",
    connectorId: plan.connectorId,
    targetPath: (plan.payload?.path as string) ?? "[redacted]",
  });

  let status: AgentActionLogStatus = "DRAFTED";
  let approvalRequestId: string | undefined;
  let error: string | undefined;

  if (!connector && plan.connectorId) {
    status = "FAILED";
    error = "Connector not found";
  } else if (requiresApproval) {
    const req = createApprovalRequest(
      workspaceId,
      agentId,
      "WEBHOOK",
      redactPayloadPreview(plan.payload),
      runId
    );
    approvalRequestId = req.id;
    status = "PENDING_APPROVAL";
  } else if (mode === "LIVE" && isRealWebhookEnabled() && connector) {
    // TODO: Real HTTP call to connector.baseUrl + allowed path
    status = "EXECUTED";
    appendAuditLog({
      workspaceId,
      actorId: null,
      actionType: "OUTBOUND_ACTION_ATTEMPTED",
      entityType: "run",
      entityId: runId,
      diffSummary: `Webhook simulated for connector ${connector.name}`,
      metadata: { connectorId: connector.id, runId },
    });
  } else {
    status = "EXECUTED"; // simulated
  }

  const log = createAgentActionLog({
    agentId,
    workspaceId,
    runId,
    actionType: "WEBHOOK",
    status,
    payloadRedactedJson: payloadRedacted,
    connectorId: plan.connectorId,
    approvalRequestId,
    error,
  });

  return { actionLogId: log.id, status, approvalRequestId, error };
}
