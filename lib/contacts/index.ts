import { CONTACT_TYPES } from "./contact-types-data";
import type {
  ContactType,
  ContactTypeId,
  WorkspaceContext,
  Contact,
} from "./contact-types";

export type {
  Contact,
  ContactType,
  ContactTypeId,
  WorkspaceContext,
};

export function getAllContactTypes(): ContactType[] {
  return CONTACT_TYPES;
}

export function getContactTypesForWorkspace(
  workspace?: WorkspaceContext
): ContactType[] {
  if (!workspace) return CONTACT_TYPES;
  return CONTACT_TYPES.filter((ct) => ct.workspaces.includes(workspace));
}

export function getContactTypeById(
  id: ContactTypeId
): ContactType | undefined {
  return CONTACT_TYPES.find((ct) => ct.id === id);
}



