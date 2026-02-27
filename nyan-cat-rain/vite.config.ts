/**
 * Vite Configuration for Community Plugin
 *
 * This configuration builds the plugin as an ES module that can be
 * dynamically loaded by the Management UI Core.
 */
import { resolve } from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import pkg from "./package.json";

const pluginName = pkg.pluginMetadata?.id || "community-plugin";

export default defineConfig({
  plugins: [react()],

  css: {
    postcss: "./postcss.config.mjs",
  },

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
        if (
          id === "react" ||
          id === "react-dom" ||
          id === "react/jsx-runtime" ||
          id === "react/jsx-dev-runtime" ||
          id.startsWith("react/")
        ) {
          return true;
        }

        if (id.startsWith("@workspace/") || id.includes("/packages/")) {
          return true;
        }

        if (id === "lucide-react" || id.startsWith("lucide-react/")) {
          return true;
        }

        if (id.startsWith("@workspace/query") || id.includes("/packages/query")) {
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css" || assetInfo.name?.endsWith(".css")) {
            return `${pluginName}.css`;
          }
          return assetInfo.name || "asset";
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
