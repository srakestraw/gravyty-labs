/**
 * Agent execution runner.
 * TODO: Queue/worker migration - execute() can enqueue job and return runId; worker consumes and runs same logic.
 */

export { execute } from "./runner";
export type { ExecuteInput, ExecuteResult } from "./runner";
export type { ExecuteMode, RunnerContext, ActionPlanItem, DraftMessage } from "./types";
export { checkNarrativePolicy, messageRequiresApproval, connectorActionRequiresApproval, buildDraftMessage } from "./policy";
export { isLiveSendEnabled, isRealWebhookEnabled, isRealSfmcEnabled } from "./feature-flags";
