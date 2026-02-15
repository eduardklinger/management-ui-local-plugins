/**
 * Vite config for TU Wien plugin (community-plugin style).
 * Builds a single .mjs for remote loading by Management UI Core.
 * Self-contained: no @workspace/vite-config so it builds outside the workspace.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const pluginName = "plugin-tuwien";

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
      },
    },
  },

  esbuild: { jsx: "automatic" },
  resolve: { dedupe: ["react", "react-dom"] },
});
