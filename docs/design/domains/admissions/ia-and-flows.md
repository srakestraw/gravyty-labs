# Admissions - IA and Flows

**Purpose**: Information architecture, user flows, states, and interaction rules.

**Audience**: Designers, Engineers

**Last Updated**: 2025-12-20

---

## Primary User Flows

### Lead Intake Flow
1. **Entry**: Prospective student lands on inquiry form
2. **Input**: Student completes form fields
3. **Validation**: System validates input
4. **Submission**: Student submits inquiry
5. **Confirmation**: System shows success message
6. **Processing**: Lead enters queue

**Key States**:
- **Empty**: No leads in queue
- **Loading**: Fetching queue items
- **Error**: Submission failed, network error
- **Success**: Lead submitted successfully

### Program Match Flow
1. **Entry**: Student accesses program match
2. **Quiz**: Student completes matching quiz
3. **Analysis**: AI processes responses
4. **Results**: System displays recommendations
5. **Selection**: Student views program details
6. **Interest**: Student expresses interest

**Key States**:
- **Empty**: No quiz started
- **In Progress**: Quiz partially completed
- **Results**: Recommendations displayed
- **Error**: Quiz submission failed

### Queue Review Flow
1. **Entry**: Agent opens queue
2. **Filter**: Agent applies filters (optional)
3. **Review**: Agent reviews item details
4. **Action**: Agent takes action (approve, reject, etc.)
5. **Next**: System presents next item

**Key States**:
- **Empty**: No items in queue
- **Loading**: Fetching items
- **Reviewing**: Item details displayed
- **Processing**: Action in progress
- **Error**: Action failed

---

## Interaction Rules

### Keyboard Navigation
- **Tab**: Move between interactive elements
- **Enter/Space**: Activate buttons, submit forms
- **Arrow Keys**: Navigate lists, dropdowns
- **Escape**: Close modals, cancel actions

### Focus Management
- Focus moves to first field on form load
- Focus returns to trigger after modal closes
- Focus visible on all interactive elements

### Responsiveness
- **Mobile**: Single column, collapsible sidebar
- **Tablet**: Two column layout
- **Desktop**: Full sidebar, multi-column layouts

---

## Accessibility Requirements

- All images have alt text
- Forms have proper labels and error messages
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactions
- Screen reader announcements for state changes

---

## Analytics Events

See [Requirements](../../product/domains/admissions/requirements/) for instrumentation details:
- Lead submitted
- Program match completed
- Queue item reviewed
- Action taken

---

## Update Triggers

This doc must be updated when:
- UX flows change
- Interaction patterns change
- New states are added
- Accessibility requirements change




