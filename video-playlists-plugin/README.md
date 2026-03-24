# Video Playlists Plugin

Local community-style plugin that adds a dedicated **Video Playlists** app to the sidebar.

## Features

- Registers a new app route: `/video-playlists`
- Adds a sidebar item: **Video Playlists**
- Lists existing playlists from GraphQL (`currentUser.myPlaylists`)
- Reads existing playlist entry labels directly from `EventPlaylistEntry.event`
- Provides icon-only row actions (`edit`, `delete`) in the playlist list
- Creates new playlists (`createPlaylist`) using:
  - Title and description
  - Reorderable selected event IDs
  - Hidden ACL defaults when no ACL plugin is installed:
    - managed ACL policy `private` (if available)
    - current user role with `read` and `write`
- Supports playlist update via `updatePlaylist`
- Supports playlist delete when a matching delete/remove playlist mutation is detected dynamically
  from schema introspection; if not supported by backend schema, delete stays disabled
- Supports optional ACL editor extension point:
  - `video-playlists:acl-editor`
  - When no component is provided, ACL remains hidden and defaults are used

## Config

Enable the plugin namespace in `.local-plugins/config/src/config.ts`:

```ts
pluginNamespace: [
  "core",
  "video-playlists-plugin",
  // ...
];
```

## Build

```bash
pnpm -C .local-plugins/video-playlists-plugin build
```
