# Root config plugin (.local-plugins/config)

Single app config for .local-plugins. Loaded first (namespace `"config"` is in default `pluginNamespace`); registers `app:config` so phase 2 loads univie, tuwien, etc.

- **Edit** `src/config.ts`: theme, orgLogoUrl, pluginNamespace, studioUrl, captureUrl, tobiraUrl.
- **Build:** `pnpm build` (from this directory or `pnpm --filter plugin-config build` from monorepo root).
- **Result:** `dist/plugin-config.mjs`; core loads it in phase 1, then loads .local-plugins/univie and .local-plugins/tuwien in phase 2.

Config was moved here from `.local-plugins/univie/implementations/config` and `.local-plugins/tuwien/implementations/config` so there is only one root config.
