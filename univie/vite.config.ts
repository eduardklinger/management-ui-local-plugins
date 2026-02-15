/**
 * Vite config for University of Vienna plugin (single entry JAR build).
 * Builds one .mjs (univie.mjs) that conditionally registers sub-plugins
 * based on app.pluginNamespace["univie"].types.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const pluginRoot = __dirname;
const pluginName = "univie";

export default defineConfig({
  root: pluginRoot,
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(pluginRoot, "src/entries/jar-loader.ts"),
      name: pluginName.replace(/-/g, "_"),
      fileName: (format) => `${pluginName}.${format === "es" ? "mjs" : "js"}`,
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
        if (id.startsWith("@workspace/") || id.includes("/packages/")) return true;
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
            return `${pluginName}.css`;
          }
          return assetInfo.name || "asset";
        },
      },
    },
  },

  esbuild: { jsx: "automatic" },
  resolve: { dedupe: ["react", "react-dom"] },
});
