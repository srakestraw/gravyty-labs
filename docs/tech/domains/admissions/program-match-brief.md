# Business and Technical Brief: Program Match

**Purpose**: Business context, product value, and technical architecture for the Program Match feature in Admissions.

**Audience**: Product, Design, Engineering, Stakeholders

**Scope**: Program Match end-to-end: candidate flow, admissions configuration, scoring, AI explanations, embed widget, and data model.

**Non-goals**: SIS write-back, CRM integration details (see [Data Provider](../../shared-services/data-provider/README.md))

**Key Terms**:
- **ICP** (Ideal Candidate Profile): Per-program buckets of traits/skills (critical, veryImportant, important, niceToHave)
- **RFI** (Request for Information): Lead record created when a candidate submits the contact gate
- **Published Snapshot**: Immutable configuration bundle (traits, skills, outcomes, programs, ICPs, quiz version) used for scoring
- **Voice and Tone**: Configurable copy profile for candidate-facing microcopy

**Links**:
- [Product Context](../../product/domains/admissions/context.md)
- [Design Flows](../../design/domains/admissions/ia-and-flows.md)
- [Data Provider](../../shared-services/data-provider/README.md)
- [Architecture](architecture.md)

**Ownership**: Engineering Team  
**Last Updated**: 2025-02-17

---

## 1. Business Overview

### 1.1 What Is Program Match?

Program Match is a **gated lead-capture quiz** that helps prospective graduate students discover which programs best fit their interests, skills, and goals. Admissions captures contact information before the quiz, enabling re-engagement if the candidate abandons mid-flow.

### 1.2 Value Proposition

| Stakeholder | Value |
|-------------|-------|
| **Prospective students** | Personalized program recommendations based on fit, readiness, and outcomes; minimal friction with clear “why this fits you” explanations |
| **Admissions** | Qualified leads with rich behavioral data; ability to re-engage abandoners via resume links; analytics on gate conversion, abandon rate, and resume rate |
| **Institution** | Higher match-to-inquiry conversion, better-qualified inquiries, and data to inform program positioning |

### 1.3 North Star Metrics

- **Completed Matches / Lead Captures** (primary)
- **Gate conversion rate**: gate views → gate submits
- **Abandon rate**: lead captures − quiz completions
- **Resume rate**: resume clicks / abandons
- **Completion after resume**: quiz completions from resumed sessions

---

## 2. Candidate Flow (Website Module)

### 2.1 Required Flow

1. **Contact Gate** (required before quiz)  
   - Minimum: Email (required)  
   - Optional: First name, Last name, Phone  
   - Consent: Email opt-in, SMS opt-in (configurable)  
   - Creates lead draft (RFI) and resume token  
   - Proceeds immediately into quiz

2. **Quiz** (7–12 questions)  
   - Sections: fit, readiness, outcomes  
   - Types: single_select, multi_select, scale  
   - Auto-save progress tied to lead draft  
   - Progress indicator

3. **Results**  
   - Top 1–3 programs with scores  
   - AI-generated or template “Why this fits you” explanations  
   - Confidence label (high/medium/low)  
   - CTAs (schedule, brochure, apply)

4. **Confirmation + Next Step**  
   - Optional RFI submission if distinct from lead capture  
   - CTA to schedule, request brochure, or apply

### 2.2 Abandonment and Resume

- **Abandon**: Lead captured but quiz not completed within configurable window (e.g., 30 minutes)
- **Resume link**: Token-based URL restores progress and continues quiz
- **Auto-save**: Responses saved after each answer; best-effort flush on unload

---

## 3. Admissions Configuration (Admin UI)

### 3.1 Navigation

Program Match lives under **Admissions** → **Program Match** with sub-sections:

| Section | Purpose |
|--------|---------|
| **Overview** | Hub summary, checklist, tiles (libraries, programs, candidates, analytics) |
| **Configure** | Draft config: Voice and Tone, gate (required fields, consent, copy), outcomes toggle |
| **Libraries** | Traits, Skills, Outcomes (CRUD) |
| **Programs** | Programs and per-program ICP (traits/skills in critical/veryImportant/important/niceToHave buckets) |
| **Quiz Builder** | Quiz drafts, questions, options mapped to traits/skills/outcomes, AI-assisted generation |
| **Preview** | Simulate gate, generate preview links, toggle draft vs published |
| **Deploy** | Embed snippet (JS or iframe), verification checklist |
| **Analytics** | Gate submits, quiz starts/completes, results viewed, abandon rate, funnel, by-day |

### 3.2 Key Configuration Objects

- **Draft Config**: Voice tone profile, gate (enabled, required fields, consent, copy), outcomes enabled
- **ICP (Ideal Candidate Profile)**: Per-program buckets of trait IDs and skill IDs
- **Program Outcomes**: Per-program priorities, fields, roles (strong/moderate)
- **Quiz Draft**: Title, description, target length (8–10 questions), questions with options mapped to traits/skills/outcomes

---

## 4. Technical Architecture

### 4.1 Data Provider Pattern

All Program Match data flows through the **unified Data Provider** (`@/lib/data`). The website widget and Admissions UI read/write only via `dataClient` methods. No direct mock imports.

**Context**: `workspace: 'admissions'`, `app: 'student-lifecycle'`

### 4.2 Core Types and Data Model

| Type | Purpose |
|------|---------|
| `ProgramMatchTrait` | Fit dimension (name, category, description, isActive) |
| `ProgramMatchSkill` | Readiness dimension (name, category, description, isActive) |
| `ProgramMatchOutcome` | Career/field/role outcome (type: priority \| field \| role) |
| `ProgramMatchProgram` | Graduate program (name, status: draft \| active \| inactive) |
| `ProgramMatchProgramICP` | Per-program ICP buckets (traits/skills in critical/veryImportant/important/niceToHave) |
| `ProgramMatchProgramOutcomes` | Per-program outcome strengths (priorities, fields, roles) |
| `ProgramMatchQuiz` | Quiz metadata (name, status, lastPublishedAt) |
| `ProgramMatchQuizDraft` | Editable quiz (questions, options, target length) |
| `ProgramMatchQuizPublishedVersion` | Immutable quiz version |
| `ProgramMatchPublishSnapshot` | Immutable bundle: draftConfig, traits, skills, outcomes, programs, programICPs, programOutcomes |
| `ProgramMatchRFI` | Lead record: contact, status, progress, abandonment, results, explanations |
| `ProgramMatchWidgetConfig` | Config for embed: gate, quiz, programs, ICPs, outcomes, voice tone |

### 4.3 Scoring Model

**Input**: `publishedSnapshotId`, `answers[]` (questionId, selectedOptionIds, skipped)

**Process**:
1. Load published snapshot (traits, skills, outcomes, programs, ICPs)
2. Map quiz options to trait/skill/outcome IDs
3. For each answer: accumulate points per program based on ICP bucket (critical > veryImportant > important > niceToHave) and outcome strength (strong > moderate)
4. Sort programs by score; tie-breakers: critical traits, total traits, skills, name
5. Return top 1–3 programs, confidence label, evidence (top traits/skills/outcomes per program)

**Confidence** (simplified):
- High: top score ≥ 18 and gap to runner-up ≥ 6
- Medium: top score > 0
- Low: otherwise

### 4.4 AI Explanations

**Input**: `publishedSnapshotId`, `toneProfileId`, `scoreResult`, `includeOutcomes`

**Process**:
- Uses evidence (top traits, skills, outcomes) to generate per-program explanations
- Headline, bullets, next-step CTA label
- Fallback: deterministic template when AI unavailable or schema validation fails
- Voice and Tone profile drives style

### 4.5 File Inventory

| Location | File | Purpose |
|----------|------|---------|
| `app/(shell)/admissions/program-match/` | `page.tsx` | Program Match hub (Admissions nav) |
| `app/(shell)/student-lifecycle/[workspace]/program-match/` | `page.tsx` | Program Match hub (workspace-parameterized) |
| `app/(shell)/admissions/program-match/` | `ProgramMatchHubClient.tsx` | Hub UI: overview, configure, libraries, programs, quiz, preview, deploy, analytics |
| `app/widgets/program-match/[publishedSnapshotId]/` | `page.tsx` | Widget page (loads config, renders client) |
| `app/widgets/program-match/[publishedSnapshotId]/` | `ProgramMatchWidgetClient.tsx` | Widget client: gate → quiz → results |
| `lib/data/provider.ts` | — | Program Match interfaces and types |
| `lib/data/providers/mockProvider.ts` | — | Mock implementation (traits, skills, programs, ICP, quiz, RFI, scoring, explanations) |
| `public/program-match/widget.js` | — | Embed script for external sites |

### 4.6 Key Data Provider Methods

| Method | Purpose |
|--------|---------|
| `getProgramMatchDraftConfig` | Load draft config |
| `updateProgramMatchDraftConfig` | Update gate, voice tone, outcomes |
| `listProgramMatchTraits` / `createProgramMatchTrait` / `updateProgramMatchTrait` | Traits CRUD |
| `listProgramMatchSkills` / `createProgramMatchSkill` / `updateProgramMatchSkill` | Skills CRUD |
| `listProgramMatchPrograms` / `createProgramMatchProgram` / `updateProgramMatchProgram` | Programs CRUD |
| `getProgramMatchProgramICP` / `updateProgramMatchProgramICP` | Per-program ICP |
| `listProgramMatchOutcomes` / `createProgramMatchOutcome` / `updateProgramMatchOutcome` | Outcomes CRUD |
| `getProgramMatchProgramOutcomes` / `updateProgramMatchProgramOutcomes` | Per-program outcomes |
| `listProgramMatchQuizzes` / `getProgramMatchQuizDraftByQuizId` / `updateProgramMatchQuizDraftByQuizId` | Quiz library |
| `publishProgramMatchQuizDraft` / `listProgramMatchQuizPublishedVersions` | Quiz publish |
| `listProgramMatchPublishedSnapshots` / `getProgramMatchPublishedSnapshot` | Snapshots |
| `createProgramMatchRFI` | Create lead (contact gate submit) |
| `updateProgramMatchRFIProgress` | Save quiz progress |
| `scoreProgramMatchResponses` | Score answers → top programs, evidence |
| `generateProgramMatchExplanations` | AI/template explanations for results |
| `listProgramMatchCandidates` | RFI list (candidates) |
| `getProgramMatchAnalytics` | Analytics tiles, funnel, by-day |

---

## 5. Dependencies

- **Data Provider** (`@/lib/data`): Single source for all Program Match data
- **Voice and Tone**: Copy profiles for gate, quiz, results
- **OpenAI** (future): AI quiz builder, AI-assisted scoring/explanations with schema validation and fallback
- **Agents** (future): Abandonment automation templates (resume email, counselor task)

---

## 6. Out of Scope (Current)

- SIS write-back
- CRM integration (lead sync)
- Resume link expiration and abandon detection (planned per PRD)
- Agent templates for abandoned leads

---

## 7. Related Documentation

- [Program Match PRD (archived)](../../archive/2025-12-20-pre-context-tree/program%20match/Program_Match_PRD_Cursor.md) — Gated lead capture spec
- [Admissions Architecture](architecture.md)
- [Admissions APIs](apis.md)
- [Admissions Data](data.md)
