# Video Playlists ACL Editor Plugin

Optional local plugin that contributes an ACL editor to the playlists extension point:

- `video-playlists:acl-editor`

## Purpose

Keeps playlist ACL editing optional and separate from the core playlist UI.
If this plugin is not loaded, playlist create/edit uses hidden defaults instead.

## Behavior

- Renders the shared `AclEditor` in create/edit playlist dialogs.
- Emits ACL changes via `onAclDataChange`.
- Uses managed ACLs from `useGetAllManagedAclsQuery`.

## Integration Note

- The parent component should pass a stable `onAclDataChange` callback (e.g. `useCallback`) and
  avoid setting ACL state when payload did not change. This prevents React update-depth loops.

## Config

Enable this namespace only when ACL editing should be visible in playlists:

```ts
pluginNamespace: [
  "core",
  "video-playlists-plugin",
  "video-playlists-acl-editor-plugin",
  // ...
];
```
