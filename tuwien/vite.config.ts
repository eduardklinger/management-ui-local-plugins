/**
 * Vite config for TU Wien plugin.
 * Builds one real bundle per plugin type so dev and production expose the
 * same deployable units.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const pluginName = "tuwien";
const entryPoints = {
  "plugin-tuwien-app": resolve(__dirname, "apps/tuwien-custom-app-plugin.ts"),
  "plugin-tuwien-episodes-actions": resolve(__dirname, "modules/episodes/index.ts"),
  "plugin-tuwien-footer": resolve(__dirname, "modules/footer/index.ts"),
  "plugin-tuwien-header": resolve(__dirname, "modules/header/index.ts"),
  "plugin-tuwien-landing-page": resolve(__dirname, "modules/landing-page/index.ts"),
  "plugin-tuwien-navigation": resolve(__dirname, "modules/navigation/index.ts"),
  "plugin-tuwien-series-actions": resolve(__dirname, "modules/series/index.ts"),
  "plugin-tuwien-sidebar": resolve(__dirname, "modules/sidebar/index.ts"),
  "plugin-tuwien-table-sidebar": resolve(__dirname, "modules/table-sidebar/index.ts"),
  "plugin-tuwien-upload-acl-editor": resolve(__dirname, "modules/upload-acl-editor/index.ts"),
};

export default defineConfig({
  plugins: [react()],

  build: {
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
      },
    },
  },

  esbuild: { jsx: "automatic" },
  resolve: { dedupe: ["react", "react-dom"] },
});
