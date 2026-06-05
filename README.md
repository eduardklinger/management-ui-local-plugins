# Management UI local plugins

This repository holds **organization plugins** (and shared config) for the Management UI monorepo. They are developed and versioned here, then used from a checkout **inside** the core app tree.

Nothing in this repo is merged into the core Git history. The core repo (Management UI) **gitignores** `.local-plugins/`, so each machine or CI job brings this content in as a sibling folder.

## How to attach this repo to the core (Management UI)

1. Clone the Management UI monorepo.
2. Place this repository at the monorepo **root** under the name `.local-plugins`:

   **Option A — clone into the monorepo**

   ```bash
   cd /path/to/mui
   git clone git@github.com:academic-moodle-cooperation/management-tool-plugins.git .local-plugins
   ```

   **Option B — you already have this repo elsewhere**

   ```bash
   cd /path/to/mui
   ln -s /path/to/management-ui-local-plugins .local-plugins
   ```

3. From the **monorepo root** (not inside `.local-plugins` alone):

   ```bash
   pnpm install
   ```

   The root `pnpm-workspace.yaml` includes `.local-plugins/*`, so `@oc-mui/*` dependencies in each plugin resolve like any other workspace package.

4. **Rebuild a plugin’s `dist/` when you change its source** (the dev shell loads the built `.mjs` files). The smallest step is to build only that plugin:

   ```bash
   cd .local-plugins/univie && pnpm build
   ```

   Alternatively, from the **monorepo root**, `pnpm build` runs Turbo across the workspace and will run each package’s `build` script, including plugins under `.local-plugins/*` — useful when you already want a full build; it is slower than building a single plugin.

5. Start the Management UI app as usual. In development, the Vite dev server serves `.local-plugins/<name>/` and exposes `/local-plugins/manifest.json` when built `dist/*.mjs` files exist.

## Maven (JAR) builds

Each plugin’s `backend/pom.xml` expects the Management UI monorepo layout (parent `backend/`, `node/`, pnpm at the repo root). Run Maven from a checkout where `.local-plugins/` sits **under** that monorepo.

**One plugin:**

```bash
# from monorepo root
mvn -f .local-plugins/univie/backend/pom.xml clean install
```

**All plugins listed in** [pom.xml](./pom.xml) **(aggregator):**

```bash
cd .local-plugins
mvn clean install
```

Or from the monorepo root:

```bash
mvn -f .local-plugins/pom.xml clean install
```

When you add a plugin with a `backend/` folder, add `<module>your-plugin/backend</module>` to [pom.xml](./pom.xml) so it is included in that aggregate build.
