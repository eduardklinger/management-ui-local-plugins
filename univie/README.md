# University of Vienna Plugin

Organization plugin for the [Management UI](https://github.com/academic-moodle-cooperation/management-tool), providing University of Vienna branding, navigation, and custom UI components.

## Modules

| Module | Type | Description |
|--------|------|-------------|
| `empty-state` | App | Empty state with university-specific links |
| `sidebar` | Sidebar | Custom navigation, header logo, and sidebar footer |
| `footer` | Footer | University-branded footer |
| `landing-page` | Landing page | Univie-branded landing/info page |

## Project Structure

```
univie/
├── modules/
│   ├── sidebar/                # Sidebar components + i18n (de/en)
│   ├── footer/                 # Footer component + i18n (de/en)
│   ├── landing-page/           # Landing page component + i18n (de/en)
│   └── empty-state/            # Empty state component + i18n (de/en)
├── src/
│   ├── index.ts                # Single-entry for remote loading (all modules)
│   ├── pluginAssetUrl.ts       # Asset URL resolver
│   └── styles/plugin.css       # Plugin CSS (Tailwind utilities)
├── assets/                     # Logo assets (PNG, SVG)
├── themes/univie.css           # University of Vienna CSS theme
├── backend/pom.xml             # Maven JAR build (bundles frontend for OSGi)
├── plugin.json                 # Plugin manifest
└── plugin-metadata.json        # Marketplace metadata
```

Each module under `modules/` is a self-contained Vite entry point that produces a separate `.mjs` bundle. `src/index.ts` is an alternative single-entry that registers all modules at once (used for remote loading).

## Internationalization

All modules ship with German (`de`) and English (`en`) translations.

Namespaces: `univie-sidebar`, `univie-footer`, `univie-landing-page`, `univie-empty-state`.

## Development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Build

From the monorepo root (so `@oc-mui/*` dependencies resolve):

```bash
pnpm install
cd .local-plugins/univie
pnpm build
```

### Other Commands

```bash
pnpm check-types   # TypeScript type checking
pnpm lint           # ESLint
pnpm clean          # Remove all build artifacts
```

## Theme

The University of Vienna theme (`themes/univie.css`) overrides CSS custom properties for primary colors, sidebar, and header/footer branding. It supports both light and dark modes.

## License

This plugin is part of the Management UI project and follows the same licensing terms.
