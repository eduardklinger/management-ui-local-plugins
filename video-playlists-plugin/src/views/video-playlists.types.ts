import type { GetAllManagedAclsQuery, GetMyEventsQuery } from "@workspace/query";
import type { AclData } from "@workspace/ui/components";

import type { Dispatch, ReactNode, SetStateAction } from "react";

export type ManagedAclNode = NonNullable<GetAllManagedAclsQuery["managedAcls"]["nodes"][number]>;
export type EventNode = NonNullable<GetMyEventsQuery["currentUser"]["myEvents"]["nodes"][number]>;

export type PlaylistEntryType = "EVENT" | "INACCESSIBLE";

export interface PlaylistEntryEventNode {
  id?: string | null;
  title?: string | null;
  seriesName?: string | null;
}

export interface PlaylistEntryNode {
  id?: number | null;
  contentId?: string | null;
  type?: PlaylistEntryType | null;
  event?: PlaylistEntryEventNode | null;
}

export interface PlaylistAccessControlEntryNode {
  role?: string | null;
  action?: string | null;
  allow?: boolean | null;
}

export interface PlaylistNode {
  id: string;
  title?: string | null;
  description?: string | null;
  creator?: string | null;
  updated?: string | null;
  entries?: Array<PlaylistEntryNode | null> | null;
  accessControlEntries?: Array<PlaylistAccessControlEntryNode | null> | null;
}

export interface MyPlaylistsPayload {
  currentUser?: {
    myPlaylists: {
      totalCount: number;
      nodes: Array<PlaylistNode | null>;
    };
  } | null;
}

export interface CreatePlaylistPayload {
  createPlaylist?: PlaylistNode | null;
}

export interface UpdatePlaylistPayload {
  updatePlaylist?: PlaylistNode | null;
}

export interface GraphQLErrorPayload {
  message?: string;
}

export interface GraphQLTypeRef {
  kind: string;
  name?: string | null;
  ofType?: GraphQLTypeRef | null;
}

export interface MutationIntrospectionArg {
  name: string;
  type: GraphQLTypeRef;
}

export interface MutationIntrospectionField {
  name: string;
  args?: Array<MutationIntrospectionArg | null> | null;
  type: GraphQLTypeRef;
}

export interface MutationCapabilitiesPayload {
  __schema?: {
    mutationType?: {
      fields?: Array<MutationIntrospectionField | null> | null;
    } | null;
  } | null;
}

export interface GraphQLPayload<TData> {
  data?: TData;
  errors?: GraphQLErrorPayload[];
}

export interface PlaylistAclEntryInput {
  role: string;
  action: string[];
}

export interface DeleteMutationCapability {
  name: string;
  argumentName: string;
  argumentType: string;
  returnsObjectLike: boolean;
}

export interface AccessControlInput {
  entries: PlaylistAclEntryInput[];
  managedAclId?: number;
}

export interface CreatePlaylistVariables {
  acl: AccessControlInput;
  entries: Array<{
    contentId: string;
    type: PlaylistEntryType;
  }>;
  metadata: {
    title: string;
    description?: string;
  };
}

export interface UpdatePlaylistVariables {
  id: string;
  metadata?: {
    title?: string;
    description?: string;
  };
  entries?: Array<{
    contentId: string;
    type: PlaylistEntryType;
  }>;
  acl?: AccessControlInput;
}

export interface PlaylistEntryDraft {
  contentId: string;
  type: PlaylistEntryType;
}

export interface PlaylistFormState {
  title: string;
  description: string;
  entries: PlaylistEntryDraft[];
  baseAclEntries: PlaylistAccessControlEntryNode[];
}

export interface PlaylistAclEditorProps {
  aclData?: AclData | null;
  onAclDataChange: (aclData: AclData, managedAclId: string) => void;
  disabled?: boolean;
  refetch?: () => void;
}

export interface Notice {
  type: "success" | "error";
  text: string;
}

export interface PlaylistEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  form: PlaylistFormState;
  setForm: Dispatch<SetStateAction<PlaylistFormState>>;
  availableEvents: EventNode[];
  eventTitleMap: Map<string, string>;
  aclEditorSlot?: ReactNode;
  isSubmitting: boolean;
  onSubmit: () => void;
  onEpisodeSearch: (query: string) => void;
}
