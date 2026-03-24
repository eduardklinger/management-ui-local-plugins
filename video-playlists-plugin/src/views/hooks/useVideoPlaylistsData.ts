import { useMemo } from "react";

import {
  OrderDirection,
  useGetAllManagedAclsQuery,
  useGetMyEventsQuery,
  useGetUserInfo,
  useQuery,
} from "@workspace/query";

import {
  MY_PLAYLISTS_QUERY,
  PLAYLIST_MUTATION_CAPABILITIES_QUERY,
} from "../video-playlists.graphql";
import {
  compact,
  findDeleteMutationCapability,
  findPrivateManagedAclId,
  postGraphQL,
} from "../video-playlists.utils";

import type {
  DeleteMutationCapability,
  EventNode,
  ManagedAclNode,
  MutationCapabilitiesPayload,
  MyPlaylistsPayload,
  PlaylistNode,
} from "../video-playlists.types";

export const useVideoPlaylistsData = ({
  playlistSearch,
  episodeSearch,
}: {
  playlistSearch: string;
  episodeSearch: string;
}) => {
  const userInfoQuery = useGetUserInfo();
  const managedAclsQuery = useGetAllManagedAclsQuery();
  const eventsQuery = useGetMyEventsQuery({
    limit: 80,
    query: episodeSearch || undefined,
    orderBy: {
      title: OrderDirection.Asc,
    },
  });

  const playlistsQuery = useQuery<MyPlaylistsPayload>({
    queryKey: ["video-playlists", "list", playlistSearch],
    queryFn: () =>
      postGraphQL<MyPlaylistsPayload>(MY_PLAYLISTS_QUERY, {
        limit: 200,
        offset: 0,
        query: playlistSearch || undefined,
      }),
  });

  const mutationCapabilitiesQuery = useQuery<MutationCapabilitiesPayload>({
    queryKey: ["video-playlists", "mutation-capabilities"],
    queryFn: () => postGraphQL<MutationCapabilitiesPayload>(PLAYLIST_MUTATION_CAPABILITIES_QUERY),
    staleTime: 5 * 60 * 1000,
  });

  const managedAcls = useMemo<ManagedAclNode[]>(
    () => compact(managedAclsQuery.data?.managedAcls.nodes),
    [managedAclsQuery.data],
  );
  const privateManagedAclId = useMemo(() => findPrivateManagedAclId(managedAcls), [managedAcls]);
  const currentUserRole = userInfoQuery.data?.userRole;

  const availableEvents = useMemo<EventNode[]>(
    () => compact(eventsQuery.data?.currentUser.myEvents.nodes),
    [eventsQuery.data],
  );

  const playlists = useMemo<PlaylistNode[]>(
    () => compact(playlistsQuery.data?.currentUser?.myPlaylists.nodes),
    [playlistsQuery.data],
  );

  const deleteMutationCapability = useMemo<DeleteMutationCapability | null>(
    () =>
      findDeleteMutationCapability(compact(mutationCapabilitiesQuery.data?.__schema?.mutationType?.fields)),
    [mutationCapabilitiesQuery.data],
  );

  const availableEventsTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of availableEvents) {
      map.set(event.id, event.title || event.id);
    }
    return map;
  }, [availableEvents]);

  const playlistEntryTitleMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const playlist of playlists) {
      for (const entry of compact(playlist.entries)) {
        const contentId = entry.contentId?.trim();
        if (entry.type !== "EVENT" || !contentId) {
          continue;
        }

        const eventId = entry.event?.id?.trim();
        const eventTitle = entry.event?.title?.trim();
        const resolvedTitle = eventTitle || eventId || contentId;

        map.set(contentId, resolvedTitle);
        if (eventId) {
          map.set(eventId, resolvedTitle);
        }
      }
    }

    return map;
  }, [playlists]);

  const mergedEventTitleMap = useMemo(() => {
    const map = new Map<string, string>(availableEventsTitleMap);
    playlistEntryTitleMap.forEach((value, key) => {
      map.set(key, value);
    });
    return map;
  }, [availableEventsTitleMap, playlistEntryTitleMap]);

  return {
    userInfoQuery,
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
  };
};
