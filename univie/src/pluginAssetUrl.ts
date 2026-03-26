type PluginGlobals = typeof globalThis & {
  __PLUGIN_BASE_URL_FULL__?: string;
};

const getPluginBaseUrl = () => {
  const globals = globalThis as PluginGlobals;
  if (globals.__PLUGIN_BASE_URL_FULL__) {
    return globals.__PLUGIN_BASE_URL_FULL__;
  }

  if (typeof window === "undefined") {
    return "/";
  }

  const appBase = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const fallbackPath = import.meta.env.DEV
    ? `${appBase}/local-plugins/univie/`
    : `${appBase}/static/plugins/univie/`;
  return new URL(fallbackPath, window.location.origin).href;
};

export const resolvePluginAssetUrl = (assetPath: string) => {
  return new URL(assetPath.replace(/^\/+/, ""), getPluginBaseUrl()).href;
};
