# Cyan Cat Rain Plugin

A tiny, silly community plugin used to demo the full plugin lifecycle:

1. Local development
2. Local testing in Marketplace Developer Mode
3. Production packaging (JAR)
4. Community publishing (CDN + registry)

The plugin adds a new sidebar app at `/cyan-cat-rain` with buttons to start and stop animated cat rain, toggle cyan mode, and trigger cat bursts.

## Plugin Identity

- Package: `@community/cyan-cat-rain-plugin`
- Plugin id: `cyan-cat-rain`
- Route: `/cyan-cat-rain`
- Build artifacts:
  - `dist/cyan-cat-rain.mjs`
  - `dist/cyan-cat-rain.css`

## Local Development (Monorepo)

From repo root:

```bash
pnpm install
```

Terminal 1 (watch build):

```bash
cd .local-plugins/cyan-cat-rain-backend-jar
pnpm dev
```

Terminal 2 (serve built plugin):

```bash
cd .local-plugins/cyan-cat-rain-backend-jar
npx http-server dist --cors -p 5173
```

Terminal 3 (run Management UI core):

```bash
cd /path/to/mui-25-ai
pnpm dev --filter=management-ui-core
```

Load in Marketplace Developer Mode:

- Open `Admin > Marketplace`
- In Developer Mode, paste:
  - `http://127.0.0.1:5173/cyan-cat-rain.mjs`
- Click `Try` for temporary load or `Install` to persist

## Local Test Checklist

- Sidebar item `Cyan Cat Rain` appears
- `/management-ui/cyan-cat-rain` opens without errors
- `Start Cat Rain` shows animated falling cats
- `Enable/Disable Cyan Mode` changes the visual style
- `Burst +24` immediately adds a visible cat burst
- Browser console has no runtime/plugin load errors

## Build and Quality Gates

From `.local-plugins/cyan-cat-rain-backend-jar`:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Production Path (JAR Deployment)

Build plugin frontend:

```bash
cd .local-plugins/cyan-cat-rain-backend-jar
pnpm build
```

Build backend bundle:

```bash
cd .local-plugins/cyan-cat-rain-backend-jar/backend
mvn clean install
```

Output JAR:

- `target/cyan-cat-rain-plugin-backend-1.0-SNAPSHOT.jar`

Deploy by copying the JAR into your Opencast `deploy/` directory.

## Community Publishing Path

### 1. Push plugin to its own repository

Example:

```bash
git init
git add .
git commit -m "feat: initial cyan cat rain plugin"
git remote add origin https://github.com/your-org/cyan-cat-rain-plugin
git push -u origin main
```

### 2. Create a release tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. CDN URL (jsDelivr)

- `https://cdn.jsdelivr.net/gh/your-org/cyan-cat-rain-plugin@v1.0.0/dist/cyan-cat-rain.mjs`

### 4. Generate registry-ready metadata

From `.local-plugins/cyan-cat-rain-backend-jar` inside this monorepo:

```bash
pnpm ts-node ../../packages/plugin-system/scripts/export-registry.ts ./plugin-metadata.json
```

### 5. Submit to community registry

- Open a PR against [management-ui-registry](https://github.com/opencast/management-ui-registry)
- Add your plugin entry to `registry.json`
- Use the jsDelivr URL above in the `url` field

## Notes

- `@workspace/*` packages are runtime host dependencies, not bundled plugin dependencies.
- Keep plugin id, metadata id, and built output file aligned (`cyan-cat-rain`) to avoid load issues.
