/**
 * Vite config for University of Vienna plugin.
 * Builds one real bundle per plugin type so dev and production expose the
 * same deployable units.
 */
import { createBaseConfig } from "@oc-mui/vite-config";
import { defineConfig } from "vite";
import { resolve } from "path";

const pluginRoot = __dirname;
const pluginName = "univie";
const pluginCssName = `${pluginName}-plugin`;
const monorepoRoot = resolve(pluginRoot, "../..");
const tailwindPackageRoot = resolve(
  monorepoRoot,
  "node_modules/.pnpm/node_modules/tailwindcss",
);
const entryPoints = {
  "plugin-univie-app": resolve(pluginRoot, "modules/empty-state/index.ts"),
  "plugin-univie-footer": resolve(pluginRoot, "modules/footer/index.ts"),
  "plugin-univie-landing-page": resolve(pluginRoot, "modules/landing-page/index.ts"),
  "plugin-univie-sidebar": resolve(pluginRoot, "modules/sidebar/index.ts"),
};

export default defineConfig(({ mode }) => {
  const baseConfig = createBaseConfig({
    isProduction: mode === "production",
  });
  const baseResolve = baseConfig.resolve && typeof baseConfig.resolve === "object"
    ? baseConfig.resolve
    : {};
  const baseAlias =
    "alias" in baseResolve && baseResolve.alias && typeof baseResolve.alias === "object"
      ? baseResolve.alias
      : {};

  return {
    ...baseConfig,
    root: pluginRoot,
    build: {
      ...baseConfig.build,
      lib: {
        entry: entryPoints,
        name: pluginName.replace(/-/g, "_"),
        fileName: (_format, entryName) => `${entryName}.mjs`,
        formats: ["es"],
      },
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      minify: true,
      rollupOptions: {
        external: (id) => {
          if (
            id === "react" ||
            id === "react-dom" ||
            id === "react/jsx-runtime" ||
            id === "react/jsx-dev-runtime" ||
            id.startsWith("react/")
          ) {
            return true;
          }
          if (id.startsWith("@oc-mui/") || id.includes("/packages/")) return true;
          if (id === "lucide-react" || id.startsWith("lucide-react/")) return true;
          return false;
        },
        output: {
          exports: "named",
          generatedCode: { constBindings: true },
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "ReactJSXRuntime",
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return `${pluginCssName}.css`;
            }
            return assetInfo.name || "asset";
          },
        },
      },
    },
    esbuild: { jsx: "automatic" },
    resolve: {
      ...baseResolve,
      alias: {
        ...baseAlias,
        tailwindcss: tailwindPackageRoot,
      },
      dedupe: ["lucide-react", "react", "react-dom"],
    },
  };
});
