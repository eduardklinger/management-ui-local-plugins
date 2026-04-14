# Management UI local plugins

This repository holds **organization plugins** (and shared config) for the Management UI monorepo. They are developed and versioned here, then used from a checkout **inside** the core app tree.

Nothing in this repo is merged into the core Git history. The core repo (Management UI) **gitignores** `.local-plugins/`, so each machine or CI job brings this content in as a sibling folder.

## How to attach this repo to the core (Management UI)

1. Clone the Management UI monorepo (e.g. `mui-25-ai`).
2. Place this repository at the monorepo **root** under the name `.local-plugins`:

   **Option A — clone into the monorepo**

   ```bash
   cd /path/to/mui-25-ai
   git clone git@github.com:eduardklinger/management-ui-local-plugins.git .local-plugins
   ```

   **Option B — you already have this repo elsewhere**

   ```bash
   cd /path/to/mui-25-ai
   ln -s /path/to/management-ui-local-plugins .local-plugins
   ```

3. From the **monorepo root** (not inside `.local-plugins` alone):

   ```bash
   pnpm install
   ```

   The root `pnpm-workspace.yaml` includes `.local-plugins/*`, so `@workspace/*` dependencies in each plugin resolve like any other workspace package.

4. Build plugins you change before running the shell, for example:

   ```bash
   cd .local-plugins/univie && pnpm build
   ```

5. Start the Management UI app as usual. In development, the Vite dev server serves `.local-plugins/<name>/` and exposes `/local-plugins/manifest.json` when built `dist/*.mjs` files exist.

## Maven (JAR) builds

Plugins that ship a `backend/pom.xml` are built from the **monorepo root** (parent `backend/`, `node/`, and pnpm layout are required), for example:

```bash
mvn -f .local-plugins/univie/backend/pom.xml clean install
```

Optional: edit [pom.xml](./pom.xml) in this repo and add `<module>your-plugin/backend</module>` so you can run `mvn -f .local-plugins/pom.xml clean install` to build every listed plugin JAR in one go.

## Further reading

In your Management UI monorepo clone, open `docs/LOCAL_PLUGINS.md` for the same workflow, notes on a missing or empty `.local-plugins` folder, and CI.

A public mirror of the Univie plugin lives at [academic-moodle-cooperation/management-tool-plugins](https://github.com/academic-moodle-cooperation/management-tool-plugins); use it to compare or republish, then still check out plugins under `mui-25-ai/.local-plugins/` for day-to-day development with `workspace:*` and Maven paths.
