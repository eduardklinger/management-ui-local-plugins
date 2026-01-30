/**
 * Vite config for University of Vienna plugin (community-plugin style).
 * Builds one .mjs per type (plugin-univie-sidebar.mjs, plugin-univie-footer.mjs, etc.)
 * so the core can load only the types listed in config (e.g. univie: { types: ["sidebar", "footer"] }).
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const pluginRoot = __dirname;

export default defineConfig({
  root: pluginRoot,
  plugins: [react()],

  build: {
    lib: {
      entry: {
        "univie": resolve(pluginRoot, "src/entries/jar-loader.ts"),
        "plugin-univie-sidebar": resolve(pluginRoot, "src/entries/sidebar.ts"),
        "plugin-univie-footer": resolve(pluginRoot, "src/entries/footer.ts"),
        "plugin-univie-landing-page": resolve(pluginRoot, "src/entries/landing-page.ts"),
        "plugin-univie-app": resolve(pluginRoot, "src/entries/app.ts"),
      },
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
        entryFileNames: "[name].mjs",
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
