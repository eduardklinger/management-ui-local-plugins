# TU Wien Plugin – Conforming to the New Community Plugin Pattern

This plugin has been updated to match the pattern used by `plugins/community-plugin-template` and `.local-plugins/my-org-plugin`, so it can be loaded remotely by the Management UI Core (e.g. from `.local-plugins` or the Marketplace).

## What changed

- **`plugin-metadata.json`** – Added for Marketplace/registry (id, name, category, workspaceDependencies).
- **Single default export** – New entry `src/index.ts` creates one `createPlugin()` that registers all TU Wien implementations (config, footer, header, sidebar, landing page, table sidebar, upload ACL editor, episodes/series actions, custom app). The core’s remote loader expects `import(url).then(m => m.default)`.
- **`package.json`** – Added `pluginMetadata`, `main`, `exports`, and `files`; build is `vite build` producing `dist/plugin-tuwien.mjs`.
- **`vite.config.ts`** – Replaced with a self-contained lib config (single entry `src/index.ts`, externals for react and `@workspace/*`).

## Build

From the monorepo root (so `@workspace/*` dependencies resolve):

```bash
pnpm install
cd .local-plugins/tuwien
pnpm build
```

If `@workspace/*` does not resolve, add `.local-plugins/*` to `pnpm-workspace.yaml` and run `pnpm install --no-frozen-lockfile` from the root once.

## Themes

Theme CSS is in `themes/tuwien.css`. In dev the core loads it from `/local-plugins/tuwien/themes/tuwien.css`.
