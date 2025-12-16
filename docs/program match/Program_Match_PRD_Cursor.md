# Program Match PRD (Gated Lead Capture) - Cursor Build Spec

## Change summary
Program Match must **gate the quiz up front** to capture candidate contact information so Admissions can re-engage if the candidate abandons mid-flow.

This document updates the PRD and provides an implementation-ready build plan aligned to:
- Admissions left nav: **Program Match** (Overview, Configure, Quiz Builder, Preview, Deploy, Analytics)
- Existing **Data Provider** model (website module reads and writes only via Data Provider)
- Existing **Voice and Tone** module (all candidate-facing copy in Preview and Live)
- Existing **OpenAI infrastructure** (AI quiz builder and AI-assisted scoring/explanations with strict schema + fallback)

SIS write-back remains out of scope.

---

## 1) Product requirements update: gated lead capture

### 1.1 Candidate flow (website module)
**New required flow**
1) **Contact Gate (required)**  
2) Quiz (7-12 questions)  
3) Results (top 1-3 programs + “Why this fits you”)  
4) Confirmation + next step CTA (schedule, brochure, apply)

**Contact Gate requirements**
- Must appear **before** any quiz questions.
- Minimum required field: **Email**
- Recommended additional fields (configurable):
  - First name (optional)
  - Last name (optional)
  - Phone (optional)
  - Intended start term (optional)
  - Modality preference (optional) - only if it does not add friction
- Consent controls (configurable):
  - Email consent checkbox (required if institution policy requires it)
  - SMS consent checkbox (optional)
- Microcopy and disclosures must use **Voice and Tone**.
- After submit, create a **lead draft** and issue a **resume link token**.
- Continue immediately into quiz with a clear progress indicator.

**Abandonment enablement**
Because contact is captured before quiz, the system must support:
- Auto-save progress (responses) tied to a lead draft
- Resume link that restores progress and continues quiz
- An “abandon” signal defined by inactivity or page close without completion

**User experience guardrails**
- Keep the gate to a single screen, minimal fields.
- Explain value succinctly, example: “We’ll save your progress and send your matches if you step away.”
- No academic jargon.
- Mobile-first and accessible.

### 1.2 Preview mode behavior
Preview must support:
- “Simulate Contact Gate” (test required fields and validation)
- “Generate preview resume link” (safe token, not real email)
- Toggle between Draft and Published quiz versions
- Voice and Tone profile switching for copy validation

### 1.3 Configure experience (Admissions)
Add gating controls under **Program Match -> Configure -> Lead Capture**:
- Gate mode:
  - **Required before quiz** (default)
  - Optional (disabled for this PRD change; keep as future-proof toggle)
- Field selection and requiredness
- Consent configuration (email required yes/no, SMS optional)
- Resume link expiration policy
- Abandonment follow-up rules (connected to Agents, see below)

### 1.4 Agents and Queue follow-through (Admissions)
**Agents**
- Add optional automation templates that can be enabled per institution:
  - “Abandoned Program Match - send resume email”
  - “Abandoned Program Match - create counselor task”
- Agents must reference the lead draft id and resume token.

**Queue**
- Add queue items for operational issues:
  - RFI/Lead capture error spikes
  - Abandon rate spikes
  - Resume clicks but no completion (suggests friction)

---

## 2) Updated success metrics

### North Star
- **Match-to-RFI conversion** becomes:
  - **Completed Matches / Lead Captures** (primary)
  - Track both:
    - Lead captures (gate submits)
    - Quiz completions
    - Results viewed
    - Downstream inquiry actions (CTA clicks)

### Supporting metrics
- Gate conversion rate: gate views -> gate submits
- Abandon rate: lead captures - quiz completions
- Resume rate: resume clicks / abandons
- Completion after resume: quiz completions from resumed sessions
- RFI submission error rate (gate submit failures)

---

## 3) Data model updates

### 3.1 New objects and fields

**Lead Draft (ProgramMatchLead)**
- lead_id (server-generated)
- institution_id
- quiz_id, version_id
- contact fields (email required, other fields optional)
- consent flags
- status: `captured | in_progress | completed | expired`
- created_at, updated_at
- resume_token (opaque)
- resume_expires_at
- last_activity_at
- utm/referrer and device context

**Progress (ProgramMatchProgress)**
- lead_id
- responses (partial allowed)
- current_question_id
- completion_state: started, partial, completed
- computed_scores (optional cached baseline)

**Outcome (ProgramMatchOutcome)**
- lead_id
- ranked_programs
- confidence bands
- reasons
- global_confidence
- generated_by: baseline | ai | fallback
- results_viewed_at

---

## 4) Data Provider API contract (required)

### 4.1 Fetch config (unchanged shape, includes gating config)
`GET /program-match/config?institutionId=&quizId=&version=`

Add:
- `leadCaptureConfig`:
  - `mode: "required_pre_quiz"`
  - `fields: [{ key, label, required, type }]`
  - `consent: { emailRequired, smsEnabled }`
  - `resume: { enabled, ttlHours }`

### 4.2 Create lead draft (new)
`POST /program-match/lead`
- Purpose: capture contact and create resumable lead draft
- Inputs:
  - institution_id, quiz_id, version_id
  - contact fields
  - consent flags
  - tracking context (utm/referrer)
- Returns:
  - lead_id
  - resume_token
  - resume_url (optional, if generated server-side)
  - status

### 4.3 Save progress (new)
`POST /program-match/progress`
- Inputs:
  - lead_id
  - resume_token (or server session)
  - responses partial
  - current_question_id
  - timestamps
- Returns:
  - status
  - server_last_activity_at

Auto-save cadence:
- After each answer, debounce 500-1000ms
- On unload/visibility change, best-effort flush

### 4.4 Resume session (new)
`GET /program-match/resume?leadId=&token=`
- Returns:
  - config snapshot
  - saved progress and current step
  - if completed, return results

### 4.5 Score (updated to include lead_id)
`POST /program-match/score`
- Inputs:
  - lead_id
  - quiz_id, version_id
  - responses
- Returns:
  - baseline result
  - optional AI result (validated)
  - persisted outcome id

### 4.6 Submit RFI (optional for this release)
If “RFI” is distinct from lead capture, keep:
`POST /program-match/rfi`
- Inputs: lead_id and any additional fields required at completion
- Note: With hard gate, many institutions will treat **lead capture as the RFI**. Decide in Configure via:
  - `leadCaptureIsRfi: true|false` (default true)

---

## 5) Website module UX spec (gated)

### 5.1 Screen 1: Contact Gate
Slots (Voice and Tone driven):
- Title
- Subtitle (value statement about saving progress)
- Field labels and helper text
- Consent text and links

Validation:
- Email format required
- Phone validation only if collected
- Inline errors, accessible messaging

Primary button:
- “Start” or “Get My Matches” (Voice and Tone controlled)

### 5.2 Screen 2: Quiz
- Progress indicator
- Short questions, minimal text
- Auto-save
- Back button allowed if it does not break logic

### 5.3 Screen 3: Results
- Top 1-3 programs
- Reasons (AI-generated or template fallback)
- CTA buttons
- “Email me these results” can be redundant; if used, it should confirm delivery or allow update email

### 5.4 Resume
Resume link behavior:
- If lead is `captured` or `in_progress`, route to current question
- If lead is `completed`, route to results
- If token expired, show “Request a new link” flow (uses email)

---

## 6) AI features and prompts (updated)

### 6.1 AI quiz builder (admin-facing) - unchanged entry point
AI Assistant tool outputs a **Draft version** in Quiz Builder.

### 6.2 AI-assisted scoring (candidate-facing)
Must not use PII beyond what is needed for personalization.
- Do not use name, email, phone in reasoning.
- Focus on quiz responses only.

#### Prompt: Scoring and reasons (server-side)
**System**
You are a program matching engine for graduate admissions. Rank programs based only on provided candidate responses and program definitions. Do not invent facts. Output valid JSON only.

**Developer**
Input includes:
- candidate_responses (structured, no PII)
- program_catalog (traits, metadata, constraints text)
- baseline_scores (deterministic)
- voice_tone (style constraints)
Return:
- ranked_programs top 3 with confidence bands
- 3-5 grounded reasons per program tied to candidate responses and program traits
- global_confidence
- recommended_followups only if low confidence
Output must match schema exactly. No extra text.

**Output schema**
```json
{
  "ranked_programs": [
    {
      "program_id": "string",
      "confidence_band": "strong|good|explore",
      "reasons": ["string", "string", "string"]
    }
  ],
  "global_confidence": "high|medium|low",
  "recommended_followups": [
    { "question_id": "string", "rationale": "string" }
  ]
}
```

### 6.3 Prompt: Gate microcopy (optional)
Use Voice and Tone module first. Only generate if a slot is missing.

**System**
You write short admissions website microcopy. Be friendly, concise, and clear.

**Developer**
Given voice_tone and ui_slot "gate_subtitle", produce <= 140 chars. Return JSON only: { "copy": "..." }.

---

## 7) Events and analytics (updated)

New events:
- lead_gate_viewed
- lead_gate_submitted
- lead_gate_error
- progress_saved
- quiz_abandoned (derived server-side from inactivity window)
- resume_link_opened
- resume_completed (completion after resume)

Existing:
- quiz_started (after lead submitted)
- question_answered
- quiz_completed
- results_viewed
- cta_clicked
- rfi_submitted
- rfi_error
- recommendation_feedback

Abandonment definition (recommended default):
- lead captured and quiz not completed within **30 minutes** of last_activity_at
- configurable by institution

---

## 8) Admissions UI requirements (Program Match sub-pages)

### 8.1 Overview
Add tiles:
- Lead captures
- Abandon rate
- Resume rate
- Completion rate
- Match-to-RFI (if distinct)

### 8.2 Configure
Add section: **Lead Capture**
- Mode: required pre-quiz
- Field selectors and requiredness
- Consent controls
- Resume TTL
- Abandonment window
- Toggle: “Lead capture counts as RFI” (default enabled)

### 8.3 Analytics
Add breakdowns:
- gate submit rate
- abandon by question index
- resume conversions

---

## 9) Build plan (phased)

### Phase 0 - Requirements and contracts
- Confirm Data Provider endpoints and auth
- Confirm Voice and Tone slot strategy
- Confirm whether lead capture equals RFI per institution

### Phase 1 - Admissions UI wiring
- Add Program Match nav and sub-routes
- Implement Configure Lead Capture section
- Implement Quiz Builder and version publish
- Preview scaffolding

### Phase 2 - Website module gated flow
- Implement Contact Gate screen
- Add lead draft creation call
- Add auto-save progress API calls
- Resume handling route

### Phase 3 - Scoring and results
- Baseline scoring
- Results UI and template reasons
- Analytics events

### Phase 4 - AI features
- AI quiz builder write-back to draft version
- AI-assisted scoring and reasons with schema validation and fallback

### Phase 5 - Abandonment automation and hardening
- Server-side abandon detection
- Agents templates for abandoned leads
- Rate limits, audit logs, error handling

---

## 10) Engineering checklist

### Frontend
- Admissions routes + nav expansion behavior
- Website widget: gate, quiz, results, resume
- Auto-save debounce and unload flush
- Accessibility validation

### Backend (Data Provider)
- lead create, progress save, resume fetch endpoints
- abandon detection job or stream processor
- scoring endpoint integration with OpenAI infra
- schema validation and fallback logic
- event ingestion

### QA
- Gate required and validation
- Resume works across devices
- Token expiration handling
- Baseline fallback when AI fails
- Analytics accuracy for gate and abandon funnel

---

## 11) Acceptance criteria (must pass)

### Gating
- Candidate cannot access quiz without submitting required contact gate.
- Email required and validated.
- Consent rules enforced per institution config.

### Abandon capture
- Lead draft exists after gate submit even if candidate closes page immediately.
- Progress auto-saves after answering any question.
- Resume link restores progress and continues.

### Preview and deploy
- Preview includes gate and mirrors Live.
- Deploy page includes copy/paste embed snippet and verification checklist.

### AI usage
- AI calls are server-side only.
- AI outputs validated against schema.
- Fallback works without user-visible errors.

---

## 12) Implementation notes for Cursor
Use this file as the single source of truth to implement:
- new Data Provider endpoints
- gating UI changes in website widget and preview
- Admissions Program Match UI updates (Configure and Analytics)
- event additions and abandon detection
- AI prompt wiring and schema validation

