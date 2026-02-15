/**
 * Single entry for JAR deployment (univie.mjs).
 *
 * IMPORTANT: We statically import all Univie sub-plugins so the remote loader
 * can transform bare imports once (no split .mjs chunks in production).
 *
 * Activation is still config-driven: only the types enabled under
 * app.pluginNamespace["univie"].types are registered.
 */
import { createPlugin } from "@workspace/plugin-system";
import type { Plugin } from "@workspace/plugin-system";
import sidebarPlugin from "./sidebar";
import footerPlugin from "./footer";
import landingPagePlugin from "./landing-page";
import appPlugin from "./app";

type PluginNamespaceItem =
  | string
  | {
      [namespace: string]: {
        types?: string[];
      };
    };

type AppConfigLike = {
  app?: {
    pluginNamespace?: PluginNamespaceItem[];
  };
};

function getMergedConfig(manager: { getObjects: (type: string) => AppConfigLike[] }): AppConfigLike {
  const parts = manager.getObjects("app:config") || [];
  return parts.reduce<AppConfigLike>((acc, part) => ({ ...acc, ...part }), {});
}

function getEnabledTypesForNamespace(
  config: AppConfigLike | undefined,
  namespace: string,
): Set<string> | "all" {
  const raw = config?.app?.pluginNamespace;
  if (!raw || !Array.isArray(raw) || raw.length === 0) return "all";

  for (const item of raw) {
    if (typeof item === "string") {
      if (item === namespace) return "all";
      continue;
    }
    if (item && typeof item === "object" && namespace in item) {
      const types = item[namespace]?.types;
      if (!types || types.length === 0) return "all";
      if (types.includes("all")) return "all";
      return new Set(types);
    }
  }

  // Namespace not present => disabled
  return new Set();
}

async function registerPlugin(manager: { register: (plugin: Plugin) => void | Promise<void> }, plugin: Plugin) {
  const result = manager.register(plugin);
  if (result != null && typeof (result as Promise<unknown>)?.then === "function") {
    await result;
  }
}

const plugin = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",
  async initialize(manager) {
    const config = getMergedConfig(manager);
    const enabled = getEnabledTypesForNamespace(config, "univie");

    if (enabled === "all") {
      await registerPlugin(manager, sidebarPlugin);
      await registerPlugin(manager, footerPlugin);
      await registerPlugin(manager, landingPagePlugin);
      await registerPlugin(manager, appPlugin);
      return;
    }

    if (enabled.size === 0) return;

    const enableIf = async (pluginToRegister: Plugin, types: string[]) => {
      if (types.some((t) => enabled.has(t))) {
        await registerPlugin(manager, pluginToRegister);
      }
    };

    // "sidebar" bundle also provides navigation entries
    await enableIf(sidebarPlugin, ["sidebar", "navigation"]);
    await enableIf(footerPlugin, ["footer"]);
    await enableIf(landingPagePlugin, ["landing-page"]);
    await enableIf(appPlugin, ["app"]);
  },
  activate() {},
  deactivate() {},
});

export default plugin;
