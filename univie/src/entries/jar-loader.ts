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
import { i18next } from "@workspace/i18n";

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

declare const __PLUGIN_BASE_URL__: string | undefined;

const LOCALE_NAMESPACES = [
  "univie-sidebar",
  "univie-footer",
  "univie-landing-page",
  "univie-empty-state",
];

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

function getPluginBaseUrl(): string {
  if (typeof __PLUGIN_BASE_URL__ === "string" && __PLUGIN_BASE_URL__.length > 0) {
    return __PLUGIN_BASE_URL__;
  }
  try {
    return new URL(import.meta.url).href.replace(/univie\.mjs(\?.*)?$/i, "");
  } catch {
    return "/";
  }
}

async function loadPluginLocales() {
  if (typeof window === "undefined") return;

  const base = getPluginBaseUrl().replace(/\/?$/, "/");
  const localesBase = `${base}locales/`;
  const current = (i18next.language || "en").split("-")[0] || "en";
  const languages = Array.from(new Set([current, "en"]));

  await Promise.all(
    languages.flatMap((lang) =>
      LOCALE_NAMESPACES.map(async (ns) => {
        if (i18next.hasResourceBundle(lang, ns)) return;
        try {
          const response = await fetch(`${localesBase}${ns}/${lang}.json`, {
            cache: "default",
          });
          if (!response.ok) return;
          const data = (await response.json()) as Record<string, unknown>;
          i18next.addResourceBundle(lang, ns, data, true, true);
        } catch {
          // ignore missing locale files
        }
      }),
    ),
  );
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
    await loadPluginLocales();

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
