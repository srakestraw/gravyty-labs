/**
 * RBAC and approval rules for Narrative Platform.
 * required_approvers derived from compliance_risk_level and claim_class (PRD).
 */

import type { NarrativeAssetRecord } from './types';

/** Minimum number of approvers required for this asset. */
export function getRequiredApprovers(asset: NarrativeAssetRecord): number {
  if (asset.compliance_risk_level === 'high') return 2;
  if (asset.compliance_risk_level === 'medium') return 1;
  return 1;
}

/** Whether asset requires designated approver (e.g. financial claims in Financial Aid/Giving). */
export function requiresDesignatedApprover(asset: NarrativeAssetRecord): boolean {
  const financialSubs = ['financial_aid', 'bursar', 'giving_intelligence', 'pipeline_intelligence'];
  if (!financialSubs.includes(asset.sub_domain_scope)) return false;
  // Claim class would come from linked proof; for now we use compliance_risk_level
  return asset.compliance_risk_level === 'high' || asset.compliance_risk_level === 'medium';
}
