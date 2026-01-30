/**
 * Single entry for JAR deployment (univie.mjs).
 * Dynamic-imports the four split bundles from the same path so the JAR serves one URL
 * and the core's jar-plugin-loader loads only univie.mjs.
 */
/** Injected by remote-plugin-loader when loading from JAR so dynamic imports use server path. */
declare const __PLUGIN_BASE_URL__: string | undefined;

import { createPlugin } from "@workspace/plugin-system";

const plugin = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",
  async initialize(manager) {
    // When loaded via remote-plugin-loader (JAR), __PLUGIN_BASE_URL__ is injected in the preamble
    // so dynamic imports resolve to the server path; otherwise use import.meta.url (dev / direct load).
    const base =
      typeof __PLUGIN_BASE_URL__ !== "undefined"
        ? __PLUGIN_BASE_URL__
        : new URL(import.meta.url).href.replace(/univie\.mjs(\?.*)?$/i, "");
    const [sidebar, footer, landing, app] = await Promise.all([
      import(/* @vite-ignore */ base + "plugin-univie-sidebar.mjs"),
      import(/* @vite-ignore */ base + "plugin-univie-footer.mjs"),
      import(/* @vite-ignore */ base + "plugin-univie-landing-page.mjs"),
      import(/* @vite-ignore */ base + "plugin-univie-app.mjs"),
    ]);
    [sidebar.default, footer.default, landing.default, app.default].forEach(
      (p) => {
        if (p?.initialize) p.initialize(manager);
      },
    );
  },
  activate() {},
  deactivate() {},
});

export default plugin;
