# TU Wien Plugin

Organization plugin for the [Management UI](https://github.com/academic-moodle-cooperation/management-tool), providing TU Wien branding, navigation, actions, and custom UI components.

## Modules

| Module | Type | Description |
|--------|------|-------------|
| `app` | App | TU Wien custom route registered in the Management UI |
| `episodes-actions` | Episodes actions | Tobira action for episode tables |
| `footer` | Footer | TU Wien-branded footer |
| `header` | Header | TU Wien header replacement |
| `landing-page` | Landing page | TU Wien-branded landing/info page |
| `navigation` | Navigation | TU Wien studio navigation link |
| `series-actions` | Series actions | Tobira action for series tables |
| `sidebar` | Sidebar | TU Wien sidebar content, header, and footer |
| `table-sidebar` | Table sidebar | ACL editor tabs for episode and series tables |
| `upload-acl-editor` | Upload ACL editor | TU Wien ACL editor integration for uploads |

## Project Structure

```
tuwien/
├── apps/
│   ├── TuWienCustomApp.tsx          # Custom TU Wien app route
│   ├── index.ts                     # App exports
│   └── tuwien-custom-app-plugin.ts  # App plugin entry
├── modules/
│   ├── episodes/                    # Episode actions + i18n
│   ├── footer/                      # Footer component + i18n
│   ├── header/                      # Header component
│   ├── landing-page/                # Landing page + i18n
│   ├── navigation/                  # Navigation entry wrapper
│   ├── series/                      # Series actions + i18n
│   ├── sidebar/                     # Sidebar components
│   ├── table-sidebar/               # ACL sidebar tabs + i18n
│   └── upload-acl-editor/           # Upload ACL editor
├── src/index.ts                     # Single-entry registration of all modules
├── themes/tuwien.css                # TU Wien theme CSS
├── backend/pom.xml                  # Maven JAR build
├── plugin.json                      # Canonical plugin manifest
└── plugin-metadata.json             # Marketplace metadata
```

Each module is built as its own `.mjs` bundle so `.local-plugins` dev loading and backend JAR loading expose the same deployable units.

## Internationalization

The plugin ships with German (`de`) and English (`en`) translations.

Namespaces: `tuwien-episodes`, `tuwien-series`, `tuwien-footer`, `tuwien-landing-page`, `tuwien-acl`.

## Development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Build

From the monorepo root (so `@oc-mui/*` dependencies resolve):

```bash
pnpm install
cd .local-plugins/tuwien
pnpm build
```

### Other Commands

```bash
pnpm check-types   # TypeScript type checking
pnpm lint          # ESLint
pnpm clean         # Remove all build artifacts
```

## Theme

The TU Wien theme (`themes/tuwien.css`) overrides CSS custom properties used by the Management UI and is packaged with the backend JAR for production use.

## License

This plugin is part of the Management UI project and follows the same licensing terms.
