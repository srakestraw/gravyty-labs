/**
 * Outcome and Moment taxonomy - bounded values for Narrative Platform.
 * Used for dropdowns and validation; aligns with PRD "Outcome + Moment taxonomy".
 */

export type DomainScope = 'student_lifecycle' | 'advancement_giving';

export const OUTCOMES: Record<DomainScope, { value: string; label: string }[]> = {
  student_lifecycle: [
    { value: 'application_completion', label: 'Application completion' },
    { value: 'yield', label: 'Yield' },
    { value: 'melt_reduction', label: 'Melt reduction' },
    { value: 'affordability_confidence', label: 'Affordability confidence' },
    { value: 'on_time_payment', label: 'On-time payment' },
    { value: 'retention', label: 'Retention' },
    { value: 'intervention_uptake', label: 'Intervention uptake' },
    { value: 'general', label: 'General' },
  ],
  advancement_giving: [
    { value: 'pipeline_growth', label: 'Pipeline growth' },
    { value: 'officer_productivity', label: 'Officer productivity' },
    { value: 'conversion', label: 'Conversion' },
    { value: 'average_gift', label: 'Average gift' },
    { value: 'recurring_adoption', label: 'Recurring adoption' },
    { value: 'stewardship_retention', label: 'Stewardship retention' },
    { value: 'general', label: 'General' },
  ],
};

export const MOMENTS: Record<DomainScope, { value: string; label: string }[]> = {
  student_lifecycle: [
    { value: 'incomplete_application', label: 'Incomplete application' },
    { value: 'missing_transcript', label: 'Missing transcript' },
    { value: 'admitted_not_confirmed', label: 'Admitted, not confirmed' },
    { value: 'aid_package_ready', label: 'Aid package ready' },
    { value: 'balance_due', label: 'Balance due' },
    { value: 'at_risk_no_contact', label: 'At risk, no contact' },
    { value: 'default', label: 'Default' },
  ],
  advancement_giving: [
    { value: 'qualification', label: 'Qualification' },
    { value: 'cultivation', label: 'Cultivation' },
    { value: 'solicitation', label: 'Solicitation' },
    { value: 'stewardship_touch', label: 'Stewardship touch' },
    { value: 'default', label: 'Default' },
  ],
};

export function getOutcomes(domain: DomainScope) {
  return OUTCOMES[domain] ?? OUTCOMES.student_lifecycle;
}

export function getMoments(domain: DomainScope) {
  return MOMENTS[domain] ?? MOMENTS.student_lifecycle;
}
