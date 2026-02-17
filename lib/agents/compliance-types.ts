/**
 * Compliance registry for SOC2/HECVAT/VPAT readiness.
 */

export const COMPLIANCE_CONTROL_IDS = [
  "SOC2_LOGGING",
  "SOC2_ACCESS_CONTROL",
  "VPAT_KEYBOARD_NAV",
  "VPAT_CONTRAST",
  "HECVAT_DATA_RETENTION",
  "HECVAT_VENDOR_RISK",
] as const;

export type ComplianceControlId = (typeof COMPLIANCE_CONTROL_IDS)[number];

export type ComplianceStatus = "PASS" | "FAIL" | "NA";

export interface ComplianceRegistryEntry {
  id: string;
  entityType: string;
  entityId: string;
  controlId: ComplianceControlId;
  status: ComplianceStatus;
  evidenceLink?: string;
  lastCheckedAt: string;
}
