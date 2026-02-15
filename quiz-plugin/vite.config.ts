/**
 * Vite Configuration for Quiz Plugin
 *
 * This configuration builds the plugin as an ES module that can be
 * dynamically loaded by the Management UI Core.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

import pkg from "./package.json";
const pluginName = pkg.pluginMetadata?.id || "quiz-plugin";

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
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
        // React ecosystem
        if (
          id === "react" ||
          id === "react-dom" ||
          id === "react/jsx-runtime" ||
          id === "react/jsx-dev-runtime" ||
          id.startsWith("react/")
        ) {
          return true;
        }

        // All workspace packages
        if (id.startsWith("@workspace/") || id.includes("/packages/")) {
          return true;
        }

        // Common shared dependencies
        if (id === "lucide-react" || id.startsWith("lucide-react/")) {
          return true;
        }

        // Convex (will be provided by host or loaded separately)
        if (id.startsWith("convex/") || id === "convex") {
          return true;
        }

        return false;
      },

      output: {
        exports: "named",
        generatedCode: {
          constBindings: true,
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
      },
    },
  },

  esbuild: {
    jsx: "automatic",
  },

  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
