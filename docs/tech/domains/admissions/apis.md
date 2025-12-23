# Admissions - APIs

**Purpose**: API contracts and integration points.

**Audience**: Engineers

**Last Updated**: 2025-12-20

---

## Data Provider API

See [Data Provider](../../shared-services/data-provider/README.md) for full API documentation.

### Key Methods Used

- `listQueueItems(ctx)` - Get queue items
- `listContacts(ctx)` - Get contacts
- `listSegments(ctx)` - Get segments

---

## Internal APIs

### Queue Operations
- Queue items accessed via Data Provider
- No direct API endpoints (uses provider abstraction)

---

## Authentication

- Firebase Authentication (see [Auth](../../shared-services/auth/README.md))
- User context passed via DataContext

---

## Update Triggers

This doc must be updated when:
- API contracts change
- New endpoints are added
- Authentication changes


