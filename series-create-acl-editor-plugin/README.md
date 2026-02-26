# Series Create ACL Editor Plugin

Standalone local plugin that contributes an ACL editor to the core extension point:

- `series:create-series:acl-editor`

## Purpose

This plugin makes ACL configuration in the create-series dialog available for any organization,
independent from TU Wien-specific plugins.

## Behavior

- Renders the shared `AclEditor` UI in the create-series dialog.
- Feeds ACL changes back through `onAclDataChange`.
- Works with managed ACL policies from `useGetAllManagedAclsQuery`.

## Config

Enable the namespace in app config to load this plugin in development:

```ts
pluginNamespace: [
  "core",
  "series-create-acl-editor-plugin",
  "episodes",
  "series",
  "upload",
  "config",
]
```
