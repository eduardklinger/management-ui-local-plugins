/**
 * Vite config for root config plugin (no React; config-only).
 * Builds a single .mjs for remote loading by Management UI Core.
 */
import { defineConfig } from "vite";
import { resolve } from "path";

const pluginName = "plugin-config";
const pluginRoot = __dirname;

export default defineConfig({
  root: pluginRoot,
  build: {
    lib: {
      entry: resolve(pluginRoot, "src/index.ts"),
      name: pluginName.replace(/-/g, "_"),
      fileName: () => `${pluginName}.mjs`,
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: (id) =>
        id.startsWith("@workspace/") || id.includes("/packages/"),
      output: {
        exports: "named",
        generatedCode: { constBindings: true },
      },
    },
  },
});
