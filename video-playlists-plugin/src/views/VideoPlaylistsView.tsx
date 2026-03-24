import { Edit, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import { ComponentResolver } from "@workspace/plugin-system";
import { useMutation, useQueryClient } from "@workspace/query";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type AclData,
} from "@workspace/ui/components";

import { PlaylistEditorDialog } from "./components/PlaylistEditorDialog";
import { useVideoPlaylistsData } from "./hooks/useVideoPlaylistsData";
import {
  CREATE_PLAYLIST_MUTATION,
  UPDATE_PLAYLIST_MUTATION,
} from "./video-playlists.graphql";
import {
  EMPTY_FORM,
  buildAclEntriesFromManagedAcl,
  buildAclEntriesFromPlaylist,
  buildAclInput,
  buildDeletePlaylistMutation,
  buildEntriesInput,
  compact,
  formatDateTime,
  isAclDataEqual,
  postGraphQL,
  toPlaylistDraftEntries,
} from "./video-playlists.utils";

import type {
  CreatePlaylistPayload,
  CreatePlaylistVariables,
  Notice,
  PlaylistAclEditorProps,
  PlaylistFormState,
  PlaylistNode,
  UpdatePlaylistPayload,
  UpdatePlaylistVariables,
} from "./video-playlists.types";


export const VideoPlaylistsView = () => {
  const queryClient = useQueryClient();

  const [playlistSearchInput, setPlaylistSearchInput] = useState("");
  const [playlistSearch, setPlaylistSearch] = useState("");
  const [episodeSearch, setEpisodeSearch] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PlaylistFormState>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<PlaylistFormState>(EMPTY_FORM);
  const [createAclData, setCreateAclData] = useState<AclData | undefined>(undefined);
  const [editAclData, setEditAclData] = useState<AclData | undefined>(undefined);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const {
    managedAclsQuery,
    eventsQuery,
    playlistsQuery,
    mutationCapabilitiesQuery,
    managedAcls,
    privateManagedAclId,
    currentUserRole,
    availableEvents,
    playlists,
    deleteMutationCapability,
    mergedEventTitleMap,
  } = useVideoPlaylistsData({
    playlistSearch,
    episodeSearch,
  });

  const createPlaylistMutation = useMutation<CreatePlaylistPayload, Error, CreatePlaylistVariables>({
    mutationFn: (variables) =>
      postGraphQL<CreatePlaylistPayload, CreatePlaylistVariables>(CREATE_PLAYLIST_MUTATION, variables),
    onSuccess: async () => {
      setNotice({
        type: "success",
        text: "Playlist created.",
      });
      setCreateDialogOpen(false);
      setCreateForm(EMPTY_FORM);
      setCreateAclData(undefined);
      await queryClient.invalidateQueries({ queryKey: ["video-playlists", "list"] });
    },
    onError: (error) => {
      setNotice({
        type: "error",
        text: error.message || "Failed to create playlist.",
      });
    },
  });

  const updatePlaylistMutation = useMutation<UpdatePlaylistPayload, Error, UpdatePlaylistVariables>({
    mutationFn: (variables) =>
      postGraphQL<UpdatePlaylistPayload, UpdatePlaylistVariables>(UPDATE_PLAYLIST_MUTATION, variables),
    onSuccess: async () => {
      setNotice({
        type: "success",
        text: "Playlist updated.",
      });
      setEditDialogOpen(false);
      setEditForm(EMPTY_FORM);
      setEditAclData(undefined);
      setEditingPlaylistId(null);
      await queryClient.invalidateQueries({ queryKey: ["video-playlists", "list"] });
    },
    onError: (error) => {
      setNotice({
        type: "error",
        text: error.message || "Failed to update playlist.",
      });
    },
  });


  const handleCreateAclDataChange = useCallback((aclData: AclData, managedAclId: string) => {
    const nextAclData: AclData = {
      ...aclData,
      managedAclId: managedAclId || aclData.managedAclId,
    };

    setCreateAclData((current) => (isAclDataEqual(current, nextAclData) ? current : nextAclData));
  }, []);

  const handleEditAclDataChange = useCallback((aclData: AclData, managedAclId: string) => {
    const nextAclData: AclData = {
      ...aclData,
      managedAclId: managedAclId || aclData.managedAclId,
    };

    setEditAclData((current) => (isAclDataEqual(current, nextAclData) ? current : nextAclData));
  }, []);

  const openCreateDialog = () => {
    setNotice(null);
    setCreateForm(EMPTY_FORM);
    setCreateAclData(undefined);
    setEpisodeSearch("");
    setCreateDialogOpen(true);
  };

  const openEditDialog = (playlist: PlaylistNode) => {
    const baseAclEntries = compact(playlist.accessControlEntries);

    setNotice(null);
    setEditingPlaylistId(playlist.id);
    setEditForm({
      title: playlist.title || "",
      description: playlist.description || "",
      entries: toPlaylistDraftEntries(playlist),
      baseAclEntries,
    });
    setEditAclData({
      entries: buildAclEntriesFromPlaylist(baseAclEntries),
      managedAclEntries: [],
      managedAclId: undefined,
    });
    setEpisodeSearch("");
    setEditDialogOpen(true);
  };

  const onApplyPlaylistSearch = () => {
    setPlaylistSearch(playlistSearchInput.trim());
  };

  const onClearPlaylistSearch = () => {
    setPlaylistSearchInput("");
    setPlaylistSearch("");
  };

  const onCreatePlaylist = () => {
    const normalizedTitle = createForm.title.trim();
    if (!normalizedTitle) {
      setNotice({
        type: "error",
        text: "Playlist title is required.",
      });
      return;
    }

    if (!createForm.entries.length) {
      setNotice({
        type: "error",
        text: "Please add at least one episode.",
      });
      return;
    }

    const aclInput = buildAclInput({
      aclData: createAclData,
      fallbackEntries: buildAclEntriesFromManagedAcl(managedAcls, privateManagedAclId),
      fallbackManagedAclId: privateManagedAclId,
      currentUserRole,
    });

    if (!aclInput) {
      setNotice({
        type: "error",
        text: "Could not build ACL defaults. Please reload and try again.",
      });
      return;
    }

    createPlaylistMutation.mutate({
      acl: aclInput,
      metadata: {
        title: normalizedTitle,
        description: createForm.description.trim() || undefined,
      },
      entries: buildEntriesInput(createForm.entries),
    });
  };

  const onUpdatePlaylist = () => {
    if (!editingPlaylistId) {
      return;
    }

    const normalizedTitle = editForm.title.trim();
    if (!normalizedTitle) {
      setNotice({
        type: "error",
        text: "Playlist title is required.",
      });
      return;
    }

    if (!editForm.entries.length) {
      setNotice({
        type: "error",
        text: "Please add at least one episode.",
      });
      return;
    }

    const aclInput =
      buildAclInput({
        aclData: editAclData,
        fallbackEntries: buildAclEntriesFromPlaylist(editForm.baseAclEntries),
        currentUserRole,
      }) || undefined;

    updatePlaylistMutation.mutate({
      id: editingPlaylistId,
      metadata: {
        title: normalizedTitle,
        description: editForm.description.trim() || undefined,
      },
      entries: buildEntriesInput(editForm.entries),
      acl: aclInput,
    });
  };

  const onRefresh = async () => {
    setNotice(null);
    await Promise.all([
      playlistsQuery.refetch(),
      managedAclsQuery.refetch(),
      eventsQuery.refetch(),
      mutationCapabilitiesQuery.refetch(),
    ]);
  };

  const onDeletePlaylist = async (playlist: PlaylistNode) => {
    if (!deleteMutationCapability) {
      return;
    }

    const displayName = playlist.title?.trim() || playlist.id;
    const confirmed = window.confirm(
      `Delete playlist "${displayName}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setNotice(null);
    setDeletingPlaylistId(playlist.id);

    try {
      const mutation = buildDeletePlaylistMutation(deleteMutationCapability);
      await postGraphQL<Record<string, unknown>, { playlistId: string }>(mutation, {
        playlistId: playlist.id,
      });

      setNotice({
        type: "success",
        text: `Playlist "${displayName}" deleted.`,
      });

      await queryClient.invalidateQueries({ queryKey: ["video-playlists", "list"] });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete playlist.",
      });
    } finally {
      setDeletingPlaylistId(null);
    }
  };

  const canDeletePlaylists = Boolean(deleteMutationCapability);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Playlists</h1>
          <p className="text-sm text-muted-foreground">
            Manage playlists, edit metadata, and arrange episode order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Playlists</CardTitle>
          <CardDescription>
            {playlistsQuery.data?.currentUser?.myPlaylists.totalCount ?? playlists.length} playlists
            found.
          </CardDescription>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={playlistSearchInput}
              onChange={(event) => setPlaylistSearchInput(event.target.value)}
              placeholder="Search playlists"
            />
            <Button type="button" variant="outline" onClick={onApplyPlaylistSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button type="button" variant="ghost" onClick={onClearPlaylistSearch}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {playlistsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No playlists available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Episodes</TableHead>
                  <TableHead className="w-[104px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playlists.map((playlist) => (
                  <TableRow key={playlist.id}>
                    <TableCell className="max-w-[280px]">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{playlist.title || playlist.id}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {playlist.description || "No description"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{playlist.creator || "Unknown"}</TableCell>
                    <TableCell>{formatDateTime(playlist.updated)}</TableCell>
                    <TableCell>{compact(playlist.entries).length}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(playlist)}
                          title={`Edit ${playlist.title || "playlist"}`}
                          aria-label={`Edit ${playlist.title || "playlist"}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletePlaylist(playlist)}
                          disabled={!canDeletePlaylists || deletingPlaylistId === playlist.id}
                          className="text-destructive hover:text-destructive"
                          title={
                            canDeletePlaylists
                              ? `Delete ${playlist.title || "playlist"}`
                              : mutationCapabilitiesQuery.isLoading
                                ? "Checking backend capabilities..."
                                : "Delete is not supported by the current backend schema"
                          }
                          aria-label={`Delete ${playlist.title || "playlist"}`}
                        >
                          {deletingPlaylistId === playlist.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!canDeletePlaylists && !mutationCapabilitiesQuery.isLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Delete action is shown but disabled because no playlist-delete mutation was detected
              in the backend GraphQL schema.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <PlaylistEditorDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        form={createForm}
        setForm={setCreateForm}
        availableEvents={availableEvents}
        eventTitleMap={mergedEventTitleMap}
        aclEditorSlot={
          <ComponentResolver<PlaylistAclEditorProps>
            componentType="video-playlists:acl-editor"
            defaultComponent={() => null}
            componentProps={{
              aclData: createAclData,
              onAclDataChange: handleCreateAclDataChange,
              disabled: createPlaylistMutation.isPending,
              refetch: () => {},
            }}
            useOverridePrefix={false}
            loadingBehavior="none"
          />
        }
        isSubmitting={createPlaylistMutation.isPending}
        onSubmit={onCreatePlaylist}
        onEpisodeSearch={setEpisodeSearch}
      />

      <PlaylistEditorDialog
        open={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        form={editForm}
        setForm={setEditForm}
        availableEvents={availableEvents}
        eventTitleMap={mergedEventTitleMap}
        aclEditorSlot={
          <ComponentResolver<PlaylistAclEditorProps>
            componentType="video-playlists:acl-editor"
            defaultComponent={() => null}
            componentProps={{
              aclData: editAclData,
              onAclDataChange: handleEditAclDataChange,
              disabled: updatePlaylistMutation.isPending,
              refetch: () => {},
            }}
            useOverridePrefix={false}
            loadingBehavior="none"
          />
        }
        isSubmitting={updatePlaylistMutation.isPending}
        onSubmit={onUpdatePlaylist}
        onEpisodeSearch={setEpisodeSearch}
      />
    </div>
  );
};

export default VideoPlaylistsView;
