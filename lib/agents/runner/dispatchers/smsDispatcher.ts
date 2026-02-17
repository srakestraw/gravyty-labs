/**
 * SMS dispatcher: draft only by default; optional send behind approval + feature flag.
 * TODO: Real SMS (Twilio, etc.) when AGENTS_ENABLE_LIVE_SEND and approved.
 */

import type { DraftMessage, ExecuteMode } from "../types";
import { isLiveSendEnabled } from "../feature-flags";
import {
  createMessageArtifact,
  createAgentActionLog,
  createApprovalRequest,
} from "../../store";
import { redactPayloadPreview } from "@/lib/security/redaction";
import type { AgentActionLogStatus } from "../../api-types";

export interface SmsDispatchResult {
  actionLogId: string;
  messageArtifactId: string;
  status: AgentActionLogStatus;
  approvalRequestId?: string;
  error?: string;
}

export function dispatchSms(
  agentId: string,
  workspaceId: string,
  runId: string,
  draft: DraftMessage,
  mode: ExecuteMode,
  requiresApproval: boolean
): SmsDispatchResult {
  const payloadRedacted = JSON.stringify({
    channel: "SMS",
    personId: draft.personId,
    bodyLength: draft.body?.length ?? 0,
  });

  if (draft.blocked) {
    const log = createAgentActionLog({
      agentId,
      workspaceId,
      runId,
      actionType: "SMS",
      status: "BLOCKED",
      payloadRedactedJson: payloadRedacted,
      error: draft.blockReason,
    });
    const artifact = createMessageArtifact({
      agentId,
      workspaceId,
      runId,
      personId: draft.personId,
      channel: "SMS",
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
      "SMS",
      redactPayloadPreview({ to: draft.personId, bodyLength: draft.body?.length }),
      runId
    );
    approvalRequestId = req.id;
    status = "PENDING_APPROVAL";
  } else if (shouldSend) {
    // TODO: Real send
    status = "EXECUTED";
  }

  const artifact = createMessageArtifact({
    agentId,
    workspaceId,
    runId,
    personId: draft.personId,
    channel: "SMS",
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
    actionType: "SMS",
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
