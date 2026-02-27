/**
 * Single root app config for .local-plugins.
 * Merges what was previously in univie and tuwien config plugins.
 * Edit theme / orgLogoUrl / URLs to match the active org (univie or tuwien).
 */
export const config = {
  app: {
    // Active theme: "univie" or "tuwien" (must match a theme in plugins/themes/ or .local-plugins/<name>/themes/)
    theme: "univie",
    // Path without base - resolveAssetUrl() in the UI will prepend base once (avoids double /management-ui/)
    orgLogoUrl: (() => {
      if (typeof window === "undefined") return "static/plugins/univie/assets/logo.png";
      const isDev =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const pluginPath = isDev ? "local-plugins/univie" : "static/plugins/univie";
      return `${pluginPath}/assets/logo.png`;
    })(),
    faviconUrl: "/management-ui/assets/favicon/favicon.svg",
    pluginNamespace: [
      "core",
      "episodes",
      "series",
      "upload",
      "admin",
      "nyan-cat-rain",
      "cyan-cat-rain",
      "poll-plugin",
      "series-create-acl-editor-plugin",
      "video-playlists-plugin",
      "video-playlists-acl-editor-plugin",
      {
        univie: {
          types: ["app", "footer", "landing-page", "sidebar", "navigation"],
        },
        // tuwien: {
        //   types: [
        //     "config",
        //     "app",
        //     "episodes-actions",
        //     "series-actions",
        //     "footer",
        //     "header",
        //     "landing-page",
        //     "sidebar",
        //     "table-sidebar",
        //     "navigation",
        //   ],
        // },
      },
    ],
  },
  plugins: {
    "poll-plugin-app": {
      protection: {
        public: true,
      },
    },
  },
  // Univie URLs (used when theme is univie)
  studioUrl: "https://admin.oc.univie.ac.at/studio",
  captureUrl: "https://admin.oc.univie.ac.at/capture-ui",
  // TU Wien URLs (used when theme is tuwien)
  tobiraUrl: "https://video.tuwien.ac.at",
};
