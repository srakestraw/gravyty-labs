/**
 * Email dispatcher: draft only by default; optional send behind approval + feature flag.
 * TODO: Real email delivery (SendGrid, etc.) when AGENTS_ENABLE_LIVE_SEND and approved.
 */

import type { Agent } from "../../api-types";
import type { DraftMessage, ExecuteMode } from "../types";
import { isLiveSendEnabled } from "../feature-flags";
import {
  createMessageArtifact,
  createAgentActionLog,
  createApprovalRequest,
} from "../../store";
import { redactPayloadPreview } from "@/lib/security/redaction";
import type { AgentActionLogStatus } from "../../api-types";

export interface EmailDispatchResult {
  actionLogId: string;
  messageArtifactId: string;
  status: AgentActionLogStatus;
  approvalRequestId?: string;
  error?: string;
}

export function dispatchEmail(
  agentId: string,
  workspaceId: string,
  runId: string,
  draft: DraftMessage,
  mode: ExecuteMode,
  requiresApproval: boolean
): EmailDispatchResult {
  const payloadRedacted = JSON.stringify({
    channel: "EMAIL",
    personId: draft.personId,
    subject: draft.subject ? "[redacted]" : undefined,
    bodyLength: draft.body?.length ?? 0,
  });

  if (draft.blocked) {
    const log = createAgentActionLog({
      agentId,
      workspaceId,
      runId,
      actionType: "EMAIL",
      status: "BLOCKED",
      payloadRedactedJson: payloadRedacted,
      error: draft.blockReason,
    });
    const artifact = createMessageArtifact({
      agentId,
      workspaceId,
      runId,
      personId: draft.personId,
      channel: "EMAIL",
      subject: draft.subject,
      body: draft.body,
      narrativeProfileId: draft.narrativeProfileId,
      narrativeVersion: draft.narrativeVersion,
      topicsDetected: draft.topicsDetected,
      personalizationFieldsUsed: draft.personalizationFieldsUsed,
      status: "BLOCKED",
    });
    return { actionLogId: log.id, messageArtifactId: artifact.id, status: "BLOCKED" };
  }

  const shouldSend = mode === "LIVE" && isLiveSendEnabled() && !requiresApproval;
  let status: AgentActionLogStatus = "DRAFTED";
  let approvalRequestId: string | undefined;

  if (requiresApproval && !shouldSend) {
    const req = createApprovalRequest(
      workspaceId,
      agentId,
      "EMAIL",
      redactPayloadPreview({ to: draft.personId, subject: draft.subject, bodyLength: draft.body?.length }),
      runId
    );
    approvalRequestId = req.id;
    status = "PENDING_APPROVAL";
  } else if (shouldSend) {
    // TODO: Real send via email provider
    status = "EXECUTED";
  }

  const artifact = createMessageArtifact({
    agentId,
    workspaceId,
    runId,
    personId: draft.personId,
    channel: "EMAIL",
    subject: draft.subject,
    body: draft.body,
    narrativeProfileId: draft.narrativeProfileId,
    narrativeVersion: draft.narrativeVersion,
    topicsDetected: draft.topicsDetected,
    personalizationFieldsUsed: draft.personalizationFieldsUsed,
    status: status === "EXECUTED" ? "SENT" : status === "PENDING_APPROVAL" ? "DRAFT" : "DRAFT",
  });

  const log = createAgentActionLog({
    agentId,
    workspaceId,
    runId,
    actionType: "EMAIL",
    status,
    payloadRedactedJson: payloadRedacted,
    approvalRequestId,
  });

  return {
    actionLogId: log.id,
    messageArtifactId: artifact.id,
    status,
    approvalRequestId,
  };
}
