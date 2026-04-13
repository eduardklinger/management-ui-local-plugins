import { resolve } from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import pluginManifest from "./plugin.json";

const pluginName = pluginManifest.id;

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["localhost", "127.0.0.1", "eddies-m4-mbp.tailade2d0.ts.net"],
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
