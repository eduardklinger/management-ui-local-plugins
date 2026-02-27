# Cyan Cat Rain Plugin — Backend JAR

Minimal backend module that packages the **cyan-cat-rain** frontend (from `.local-plugins/my-org-plugin/`) into a JAR for Opencast deployment.

## One-command deploy from repo root

From the monorepo root:

```bash
mvn -f .local-plugins/my-org-plugin/backend/pom.xml clean install
```

## Build this module only

1. **Build the frontend** (from repo root):
   ```bash
   cd .local-plugins/my-org-plugin && pnpm build
   ```

2. **Build the JAR** (from repo root):
   ```bash
   mvn -f .local-plugins/my-org-plugin/backend/pom.xml clean install
   ```
   Output: `.local-plugins/my-org-plugin/backend/target/cyan-cat-rain-plugin-backend-1.0-SNAPSHOT.jar`

3. **Deploy**: Copy the JAR to `$OPENCAST_HOME/deploy/`, or use `-DdeployTo=<path>` when building from root.

## Servlet path (no conflict with core)

This bundle registers **only** `/management-ui/static/plugins/cyan-cat-rain/*`, not `/management-ui/*`, so it does not conflict with `management-ui-core`, which owns `/management-ui`.

## Contents

- No Java code; only the frontend assets are packaged.
- The pom runs `pnpm build` in `.local-plugins/my-org-plugin`, copies `dist/cyan-cat-rain.*` into the JAR, and sets `Include-Resource` so the bundle plugin includes them.
