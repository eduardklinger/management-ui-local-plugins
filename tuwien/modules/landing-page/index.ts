import { createPlugin } from "@oc-mui/plugin-system";
import type { PluginManager } from "@oc-mui/plugin-system";

import { InfoPage } from "./components/InfoPage";

/**
 * TU Wien Landing Page Implementation Plugin
 * University-specific landing page with TU Wien branding
 */
export const tuwienLandingPageImplementation = createPlugin({
  namespace: "tuwien",
  type: "landing-page",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    // Register TU Wien landing page with higher priority than core default
    manager.registerComponent("component-override:appshell:landing-page", InfoPage, {
      key: "tuwien-landing-page",
      order: 50, // Higher priority than core default (100)
    });
  },

  activate() {},

  deactivate() {},
});

export default tuwienLandingPageImplementation;
