# My Org Plugin — Backend JAR

Minimal backend module that packages the **my-org-plugin** frontend (from `.local-plugins/my-org-plugin/`) into a JAR for Opencast deployment.

## One-command deploy from repo root

From the monorepo root:

```bash
mvn clean install -DdeployTo=/path/to/opencast
```

This builds all modules (including building the frontend in `.local-plugins/my-org-plugin` and packaging it into this JAR) and copies every JAR to `$deployTo/deploy/`, same as for episodes and other backend modules.

## Build this module only

1. **Build the frontend** (from repo root):
   ```bash
   cd .local-plugins/my-org-plugin && pnpm build
   ```

2. **Build the JAR** (from repo root):
   ```bash
   cd backend && mvn clean install -pl my-org-plugin
   ```
   Output: `backend/my-org-plugin/target/my-org-plugin-backend-1.0-SNAPSHOT.jar`

3. **Deploy**: Copy the JAR to `$OPENCAST_HOME/deploy/`, or use `-DdeployTo=<path>` when building from root.

## Servlet path (no conflict with core)

This bundle registers **only** `/management-ui/static/plugins/my-org/*`, not `/management-ui/*`, so it does not conflict with `management-ui-core`, which owns `/management-ui`.

## Contents

- No Java code; only the frontend assets are packaged.
- The pom runs `pnpm build` in `.local-plugins/my-org-plugin`, copies `dist/my-plugin.*` into the JAR, renames them to `my-org.*`, and sets `Include-Resource` so the bundle plugin includes them.
