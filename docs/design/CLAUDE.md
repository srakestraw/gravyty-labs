# Design Documentation Rules

**Purpose**: Operating rules specific to design documentation.

**Audience**: Designers, Engineers

**Last Updated**: 2025-12-20

---

## Design is First-Class

Design documentation is not an afterthought. UX changes require updates to:
- `ia-and-flows.md` when flows change
- `content-and-voice.md` when messaging changes
- Both when interaction patterns change

## Link to Product and Tech

Design docs must link to:
- Related requirements: `../../product/domains/<domain>/requirements/<feature>.md`
- Related tech docs: `../../tech/domains/<domain>/architecture.md`

## Accessibility is Required

Every flow must document:
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels and roles

## States Must Be Documented

Every flow must include:
- Loading states
- Empty states
- Error states
- Success states

---

## Update Triggers

Design docs must be updated when:
- UX flows change
- Interaction patterns change
- Content/messaging changes
- Accessibility requirements change
- Design system updates




