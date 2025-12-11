import type { Segment } from "./types";

export const MOCK_SEGMENTS: Segment[] = [
  {
    id: "s1",
    name: "Stalled Applicants - 7 plus days",
    description: "Applicants inactive for 7 or more days with incomplete checklists.",
    contactTypeFilters: ["applicant"],
    populationFilterLabel: "Applicants",
    isDynamic: true,
    usageContexts: ["assistants", "agents"],
  },
  {
    id: "s2",
    name: "LYBUNT Donors",
    description: "Donors who gave last year but not this year.",
    contactTypeFilters: ["lapsed_donor"],
    populationFilterLabel: "Donors",
    isDynamic: true,
    usageContexts: ["agents", "campaigns"],
  },
];
