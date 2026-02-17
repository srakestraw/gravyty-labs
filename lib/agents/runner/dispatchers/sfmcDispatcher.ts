/**
 * SFMC dispatcher: simulated by default; real call only when AGENTS_ENABLE_REAL_SFMC.
 * TODO: Real SFMC API (data extension upsert, journey trigger) when feature flag on.
 */

import type { Agent } from "../../api-types";
import { getSfmcConnector } from "../../store";
import { isRealSfmcEnabled } from "../feature-flags";
import { createAgentActionLog, createApprovalRequest, appendAuditLog } from "../../store";
import { redactPayloadPreview } from "@/lib/security/redaction";
import type { ActionPlanItem } from "../types";
import type { AgentActionLogStatus } from "../../api-types";

export interface SfmcDispatchResult {
  actionLogId: string;
  status: AgentActionLogStatus;
  approvalRequestId?: string;
  error?: string;
}

export function dispatchSfmc(
  agentId: string,
  workspaceId: string,
  runId: string,
  plan: ActionPlanItem,
  requiresApproval: boolean,
  mode: "DRY_RUN" | "LIVE"
): SfmcDispatchResult {
  const connectorId = plan.connectorId;
  const connector = connectorId ? getSfmcConnector(connectorId) : undefined;
  const payloadRedacted = JSON.stringify({
    type: "sfmc",
    connectorId: plan.connectorId,
    capability: plan.payload?.capability ?? "[redacted]",
  });

  let status: AgentActionLogStatus = "DRAFTED";
  let approvalRequestId: string | undefined;
  let error: string | undefined;

  if (plan.connectorId && !connector) {
    status = "FAILED";
    error = "SFMC connector not found";
  } else if (requiresApproval) {
    const req = createApprovalRequest(
      workspaceId,
      agentId,
      "SFMC",
      redactPayloadPreview(plan.payload),
      runId
    );
    approvalRequestId = req.id;
    status = "PENDING_APPROVAL";
  } else if (mode === "LIVE" && isRealSfmcEnabled() && connector) {
    // TODO: Real SFMC API call
    status = "EXECUTED";
    appendAuditLog({
      workspaceId,
      actorId: null,
      actionType: "OUTBOUND_ACTION_ATTEMPTED",
      entityType: "run",
      entityId: runId,
      diffSummary: `SFMC simulated for connector ${connector.name}`,
      metadata: { connectorId: connector.id, runId },
    });
  } else {
    status = "EXECUTED"; // simulated
  }

  const log = createAgentActionLog({
    agentId,
    workspaceId,
    runId,
    actionType: "SFMC",
    status,
    payloadRedactedJson: payloadRedacted,
    connectorId: plan.connectorId,
    approvalRequestId,
    error,
  });

  return { actionLogId: log.id, status, approvalRequestId, error };
}
