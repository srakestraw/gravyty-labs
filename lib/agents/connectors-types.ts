/**
 * Connector models: Webhook and SFMC.
 * Agents can only call pre-registered connectors (allowlist).
 * TODO: Real secret storage; clientId/clientSecret as refs to secrets service.
 */

import type { Boundary } from "./api-types";

/** Restrict connector to specific campuses/departments. Empty = org-wide. */
export interface ConnectorBoundaryAllowlist {
  campusIds?: string[];
  departmentIds?: string[];
}

export interface WebhookConnector {
  id: string;
  workspaceId: string;
  name: string;
  baseUrl: string;
  allowedPaths?: string[];
  allowedMethods?: string[];
  headersTemplateRef?: string;
  signing?: { type: string; secretRef?: string };
  isActive: boolean;
  boundary?: Boundary;
  allowlist?: ConnectorBoundaryAllowlist;
  createdAt: string;
  updatedAt: string;
}

export interface SfmcConnector {
  id: string;
  workspaceId: string;
  name: string;
  subdomain: string;
  authType: "client_credentials";
  clientIdRef: string;
  clientSecretRef: string;
  isActive: boolean;
  boundary?: Boundary;
  allowlist?: ConnectorBoundaryAllowlist;
  createdAt: string;
  updatedAt: string;
}
