export const MY_PLAYLISTS_QUERY = `
  query VideoPlaylistsPluginMyPlaylists($limit: Int, $offset: Int, $query: String) {
    currentUser {
      myPlaylists(limit: $limit, offset: $offset, query: $query, orderBy: { updated: DESC }) {
        totalCount
        nodes {
          id
          title
          description
          creator
          updated
          accessControlEntries {
            role
            action
            allow
          }
          entries {
            id
            contentId
            type
            ... on EventPlaylistEntry {
              event {
                id
                title
                seriesName
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_PLAYLIST_MUTATION = `
  mutation VideoPlaylistsPluginCreatePlaylist(
    $acl: AccessControlListInput!
    $entries: [PlaylistEntryInput]
    $metadata: PlaylistMetadataInput!
  ) {
    createPlaylist(acl: $acl, entries: $entries, metadata: $metadata) {
      id
      title
      description
      creator
      updated
    }
  }
`;

export const UPDATE_PLAYLIST_MUTATION = `
  mutation VideoPlaylistsPluginUpdatePlaylist(
    $id: String!
    $metadata: PlaylistMetadataInput
    $entries: [PlaylistEntryInput]
    $acl: AccessControlListInput
  ) {
    updatePlaylist(id: $id, metadata: $metadata, entries: $entries, acl: $acl) {
      id
      title
      description
      creator
      updated
    }
  }
`;

export const PLAYLIST_MUTATION_CAPABILITIES_QUERY = `
  query VideoPlaylistsPluginMutationCapabilities {
    __schema {
      mutationType {
        fields {
          name
          args {
            name
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
          type {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
