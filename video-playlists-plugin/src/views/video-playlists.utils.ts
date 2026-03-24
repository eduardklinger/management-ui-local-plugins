import type { AclData } from "@workspace/ui/components";

import type {
  AccessControlInput,
  DeleteMutationCapability,
  GraphQLPayload,
  GraphQLTypeRef,
  ManagedAclNode,
  MutationIntrospectionField,
  PlaylistAclEntryInput,
  PlaylistEntryDraft,
  PlaylistFormState,
  PlaylistNode,
} from "./video-playlists.types";

export const DELETE_MUTATION_CANDIDATE_NAMES = [
  "deletePlaylist",
  "removePlaylist",
  "deleteVideoPlaylist",
  "removeVideoPlaylist",
];

export const EMPTY_FORM: PlaylistFormState = {
  title: "",
  description: "",
  entries: [],
  baseAclEntries: [],
};

export const compact = <T,>(values: Array<T | null | undefined> | null | undefined): T[] =>
  (values ?? []).filter((value): value is T => value != null);

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "n/a";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

export const toPlaylistDraftEntries = (playlist?: PlaylistNode | null): PlaylistEntryDraft[] =>
  compact(playlist?.entries).flatMap((entry) => {
    const contentId = entry.contentId?.trim();
    if (!contentId) {
      return [];
    }

    return [{ contentId, type: entry.type === "INACCESSIBLE" ? "INACCESSIBLE" : "EVENT" }];
  });

export const moveEntry = (
  entries: PlaylistEntryDraft[],
  index: number,
  direction: "up" | "down",
): PlaylistEntryDraft[] => {
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= entries.length) {
    return entries;
  }

  const clone = [...entries];
  const current = clone[index];
  const target = clone[nextIndex];
  if (!current || !target) {
    return entries;
  }

  clone[index] = target;
  clone[nextIndex] = current;
  return clone;
};

export const buildEntriesInput = (entries: PlaylistEntryDraft[]) =>
  entries.map((entry) => ({
    contentId: entry.contentId,
    type: entry.type,
  }));

const appendAclEntry = (
  actionsByRole: Map<string, Set<string>>,
  roleCandidate?: string | null,
  actionsCandidate?: Array<string | null> | null,
) => {
  const role = roleCandidate?.trim();
  if (!role) {
    return;
  }

  const actions = compact(actionsCandidate)
    .map((action) => action.trim())
    .filter(Boolean);

  if (!actions.length) {
    return;
  }

  if (!actionsByRole.has(role)) {
    actionsByRole.set(role, new Set<string>());
  }

  const existingActions = actionsByRole.get(role);
  if (!existingActions) {
    return;
  }

  for (const action of actions) {
    existingActions.add(action);
  }
};

const mapToAclEntries = (actionsByRole: Map<string, Set<string>>): PlaylistAclEntryInput[] =>
  Array.from(actionsByRole.entries()).map(([role, actions]) => ({
    role,
    action: Array.from(actions),
  }));

export const buildAclEntriesFromPlaylist = (aclEntries: Array<{ role?: string | null; action?: string | null; allow?: boolean | null }>): PlaylistAclEntryInput[] => {
  const actionsByRole = new Map<string, Set<string>>();

  for (const aclEntry of aclEntries) {
    if (aclEntry.allow === false) {
      continue;
    }

    appendAclEntry(actionsByRole, aclEntry.role, aclEntry.action ? [aclEntry.action] : []);
  }

  return mapToAclEntries(actionsByRole);
};

export const buildAclEntriesFromAclData = (aclData?: AclData | null): PlaylistAclEntryInput[] => {
  if (!aclData) {
    return [];
  }

  const actionsByRole = new Map<string, Set<string>>();

  for (const aclEntry of aclData.entries ?? []) {
    appendAclEntry(actionsByRole, aclEntry.role, aclEntry.action);
  }

  for (const aclEntry of aclData.managedAclEntries ?? []) {
    appendAclEntry(actionsByRole, aclEntry.role, aclEntry.action);
  }

  return mapToAclEntries(actionsByRole);
};

const ensureCurrentUserReadWrite = (
  entries: PlaylistAclEntryInput[],
  currentUserRole?: string,
): PlaylistAclEntryInput[] => {
  const role = currentUserRole?.trim();
  if (!role) {
    return entries;
  }

  const actionsByRole = new Map<string, Set<string>>();
  for (const entry of entries) {
    appendAclEntry(actionsByRole, entry.role, entry.action);
  }

  appendAclEntry(actionsByRole, role, ["read", "write"]);
  return mapToAclEntries(actionsByRole);
};

export const parseManagedAclId = (value?: string | number | null): number | undefined => {
  if (value == null) {
    return undefined;
  }

  const numericId = Number(value);
  return Number.isFinite(numericId) ? numericId : undefined;
};

export const buildAclEntriesFromManagedAcl = (
  managedAcls: ManagedAclNode[],
  managedAclId?: number,
): PlaylistAclEntryInput[] => {
  if (managedAclId === undefined) {
    return [];
  }

  const selectedAcl = managedAcls.find((acl) => parseManagedAclId(acl.id) === managedAclId);
  if (!selectedAcl) {
    return [];
  }

  const actionsByRole = new Map<string, Set<string>>();
  for (const aclEntry of compact(selectedAcl.acl.entries)) {
    appendAclEntry(actionsByRole, aclEntry.role, aclEntry.action);
  }

  return mapToAclEntries(actionsByRole);
};

export const findPrivateManagedAclId = (managedAcls: ManagedAclNode[]): number | undefined => {
  const privateAcl =
    managedAcls.find((acl) => acl.name?.trim().toLowerCase() === "private") ||
    managedAcls.find((acl) => acl.name?.toLowerCase().includes("private"));

  return parseManagedAclId(privateAcl?.id);
};

export const buildAclInput = ({
  aclData,
  fallbackEntries,
  fallbackManagedAclId,
  currentUserRole,
}: {
  aclData?: AclData | null;
  fallbackEntries: PlaylistAclEntryInput[];
  fallbackManagedAclId?: number;
  currentUserRole?: string;
}): AccessControlInput | null => {
  const pluginEntries = buildAclEntriesFromAclData(aclData);
  const baseEntries = pluginEntries.length ? pluginEntries : fallbackEntries;
  const normalizedEntries = ensureCurrentUserReadWrite(baseEntries, currentUserRole);

  if (!normalizedEntries.length) {
    return null;
  }

  const managedAclId = parseManagedAclId(aclData?.managedAclId) ?? fallbackManagedAclId;

  return managedAclId !== undefined
    ? {
        entries: normalizedEntries,
        managedAclId,
      }
    : {
        entries: normalizedEntries,
      };
};

const serializeAclData = (aclData?: AclData): string =>
  JSON.stringify({
    managedAclId: aclData?.managedAclId ?? "",
    entries: (aclData?.entries ?? []).map((entry) => ({
      role: entry.role,
      action: entry.action,
    })),
    managedAclEntries: (aclData?.managedAclEntries ?? []).map((entry) => ({
      role: entry.role,
      action: entry.action,
    })),
  });

export const isAclDataEqual = (left?: AclData, right?: AclData): boolean =>
  serializeAclData(left) === serializeAclData(right);

const typeRefToString = (typeRef?: GraphQLTypeRef | null): string => {
  if (!typeRef) {
    return "String";
  }

  if (typeRef.kind === "NON_NULL") {
    return `${typeRefToString(typeRef.ofType)}!`;
  }

  if (typeRef.kind === "LIST") {
    return `[${typeRefToString(typeRef.ofType)}]`;
  }

  return typeRef.name || "String";
};

const unwrapTypeRef = (typeRef?: GraphQLTypeRef | null): GraphQLTypeRef | null => {
  if (!typeRef) {
    return null;
  }

  if (typeRef.kind === "NON_NULL" || typeRef.kind === "LIST") {
    return unwrapTypeRef(typeRef.ofType);
  }

  return typeRef;
};

export const findDeleteMutationCapability = (
  fields: MutationIntrospectionField[],
): DeleteMutationCapability | null => {
  const scoreMutationField = (field: MutationIntrospectionField): number => {
    if (DELETE_MUTATION_CANDIDATE_NAMES.includes(field.name)) {
      return 100;
    }

    const lower = field.name.toLowerCase();
    if (lower.includes("playlist") && (lower.includes("delete") || lower.includes("remove"))) {
      return 50;
    }

    return 0;
  };

  const candidates = fields
    .map((field) => {
      const argument =
        compact(field.args).find((item) => item.name === "id" || item.name === "playlistId") ||
        compact(field.args).find((item) => item.name.toLowerCase().endsWith("id"));

      if (!argument) {
        return null;
      }

      const score = scoreMutationField(field);
      if (score === 0) {
        return null;
      }

      const returnType = unwrapTypeRef(field.type);
      return {
        score,
        field,
        argument,
        returnsObjectLike: Boolean(returnType && ["OBJECT", "INTERFACE", "UNION"].includes(returnType.kind)),
      };
    })
    .filter((value): value is NonNullable<typeof value> => value != null)
    .sort((left, right) => right.score - left.score);

  const selected = candidates[0];
  if (!selected) {
    return null;
  }

  return {
    name: selected.field.name,
    argumentName: selected.argument.name,
    argumentType: typeRefToString(selected.argument.type),
    returnsObjectLike: selected.returnsObjectLike,
  };
};

export const buildDeletePlaylistMutation = (capability: DeleteMutationCapability): string => {
  const selection = capability.returnsObjectLike ? " { __typename }" : "";
  return `
    mutation VideoPlaylistsPluginDeletePlaylist($playlistId: ${capability.argumentType}) {
      ${capability.name}(${capability.argumentName}: $playlistId)${selection}
    }
  `;
};

export const postGraphQL = async <TData, TVariables extends object = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
): Promise<TData> => {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as GraphQLPayload<TData>;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "GraphQL request returned errors.");
  }
  if (!payload.data) {
    throw new Error("GraphQL response did not return data.");
  }

  return payload.data;
};
