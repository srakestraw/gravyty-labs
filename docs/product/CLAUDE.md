# Product Documentation Rules

**Purpose**: Operating rules specific to product documentation.

**Audience**: Product Managers, Designers

**Last Updated**: 2025-12-20

---

## Requirements Must Be Testable

Every requirement must be written as a testable statement:
- ✅ "User can filter queue items by status"
- ❌ "Better filtering experience"

## Link to Implementation

Requirements docs must link to:
- Related design docs: `../design/domains/<domain>/ia-and-flows.md`
- Related tech docs: `../../tech/domains/<domain>/architecture.md`
- Dependencies: `../../shared-services/<service>/README.md`

## Keep Context Current

`context.md` files must be updated when:
- Target users change
- Key workflows evolve
- Terminology changes
- Domain scope expands

## Success Metrics Are Required

Every feature must define:
- What success looks like
- How to measure it
- Baseline and target values

---

## Update Triggers

Product docs must be updated when:
- New features are added
- Requirements change
- Success metrics are refined
- User personas evolve


