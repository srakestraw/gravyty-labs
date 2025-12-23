# Documentation Operating Rules

**Purpose**: Define the quality bar, ownership model, and maintenance rules for all documentation in this repository.

**Audience**: All contributors (Product, Design, Engineering)

**Last Updated**: 2025-12-22

---

## Core Principles

### 1. Living Docs

**Docs must describe "what is true now."**

- If code changes behavior, you must update the relevant docs in the same PR.
- If you cannot fully update docs, add a short "Needs update" note with:
  - What changed
  - Where to fix it
  - This is temporary, not permanent

### 2. Single Source of Truth

**Shared services are canonical.**

- Shared service docs live only in `docs/shared-services/<service>/`
- Domains link to shared services, they do not duplicate contracts or runbooks.
- When a shared service changes, update its docs first, then update domain docs only where the dependency meaningfully changes.

### 3. Design is First-Class

**Design documentation is not an afterthought.**

- UX flows, states, and interaction rules are documented alongside technical implementation.
- Design changes require updates to `docs/design/domains/<domain>/ia-and-flows.md`
- Content and voice rules are maintained in `docs/design/domains/<domain>/content-and-voice.md`

---

## Required Headers

All documentation files must include these headers (unless explicitly marked optional):

- **Purpose** - What this doc is for
- **Audience** - Who should read this (Product, Design, Eng, Support)
- **Scope** - What is covered
- **Non-goals** - What is explicitly out of scope
- **Key terms** - Domain-specific terminology
- **Links** - Upstream/downstream dependencies
- **Ownership** - Team or role responsible
- **Update triggers** - When must this doc be edited
- **Last updated** - Date of last meaningful change

---

## Ownership Model

### Domain Ownership

Each domain has an owning team defined in:
- `docs/product/domains/<domain>/README.md` (Product ownership)
- `docs/tech/domains/<domain>/README.md` (Engineering ownership)

### Shared Service Ownership

Each shared service has an owning team defined in:
- `docs/shared-services/<service>/README.md`

### Escalation

If documentation is outdated or unclear:
1. Check the "Ownership" section of the relevant doc
2. Tag the owning team in a PR or issue
3. If no owner is listed, tag the Engineering team

---

## Change Process

### PR Requirements

Every PR that changes behavior, APIs, or UX must:

1. **Update relevant docs** in the same PR
2. **Link to updated docs** in PR description
3. **Use the PR checklist** from `docs/README.md`

### Documentation-Only PRs

PRs that only update docs are welcome and encouraged:
- Fix outdated information
- Add missing context
- Improve clarity
- Add examples

---

## Quality Standards

### Requirements Docs

Must include:
- Problem statement
- Users and jobs-to-be-done
- Outcomes and success metrics
- MVP requirements (testable statements)
- Later requirements
- Edge cases
- Dependencies (as links)
- Instrumentation and observability
- Open questions / risks

### Design Docs

Must include:
- Primary user flows (happy path)
- Key states and empty/error states
- Interaction rules (keyboard, focus, responsiveness)
- Accessibility requirements
- Content/voice rules
- Analytics events (links to instrumentation)

### Tech Docs

Must include:
- Current state architecture (what exists today)
- Component boundaries
- Data ownership and systems of record
- API/event contracts
- Failure modes and runbooks
- Backward compatibility notes

---

## Link Maintenance

### Internal Links

- Use relative paths: `../shared-services/auth/README.md`
- Links must be valid (checked by docs-check script)
- Broken links are treated as bugs

### External Links

- Prefer internal docs over external when possible
- If external, note if link may break
- Archive important external content locally if needed

---

## Enforcement

### Automated Checks

- `scripts/docs-check.sh` validates:
  - Required files exist per domain/service
  - Links in README files are not broken
  - Required headings exist in requirements docs

### CI Integration

- Docs check runs on PRs that touch:
  - `docs/**`
  - `app/**`, `lib/**`, `packages/**`

### Manual Review

- PR reviewers check that docs were updated when code changes
- Outdated docs can be flagged in code review

---

## Migration Notes

### Legacy Docs

Legacy documentation has been archived to:
- `docs/archive/2025-12-20-pre-context-tree/` - Pre-context-tree migration
- `docs/archive/2025-12-22-legacy-docs/` - Additional legacy docs (if any)

When referencing legacy docs:
- Link to archive location
- Note if information is outdated
- Migrate important content to new structure

### Shared Components

Shared components (like Queue) are documented in `docs/shared-components/`:
- Components are canonical - one source of truth
- Domains link to component docs, do not duplicate behavior
- Each shared component has: README.md, product.md, design.md, tech.md, contracts-and-urls.md (as applicable)
- See [Queue Documentation](../shared-components/queue/README.md) for example

---

## Questions?

- **Where do I put X?** → See `docs/README.md`
- **What format should I use?** → See templates in each directory
- **Who owns this?** → Check the "Ownership" section of the relevant doc
- **Is this outdated?** → Check "Last updated" date, update if needed

---

## Update Triggers

This file must be updated when:
- Documentation standards change
- Ownership model changes
- New enforcement mechanisms are added
- Quality standards evolve

