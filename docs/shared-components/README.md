# Shared Components

**Purpose**: Documentation for shared UI components used across multiple domains.

**Audience**: Product Managers, Designers, Engineers

**Last Updated**: December 22, 2025

---

## Overview

Shared components are reusable UI components that provide consistent functionality across domains. Unlike shared services (which are backend/data layer), shared components are frontend UI components.

## Components

### Queue

The Queue component is a shared triage interface for managing agent operations items.

- **[Queue Documentation](queue/README.md)** - Complete Queue component documentation
- **[Queue Product Requirements](queue/product.md)** - Product requirements and success metrics
- **[Queue Design Documentation](queue/design.md)** - UX flows, states, interaction rules
- **[Queue Technical Documentation](queue/tech.md)** - Architecture, component boundaries, data contracts
- **[Queue Contracts and URLs](queue/contracts-and-urls.md)** - URL parameters, data provider methods

## Integration

Domains integrate shared components by:

1. **Importing the component** in domain pages
2. **Linking to component docs** in domain documentation (do not duplicate component behavior)
3. **Documenting domain-specific usage** (defaults, entry points, labels)

## Update Triggers

This README must be updated when:
- New shared components are added
- Component documentation structure changes




