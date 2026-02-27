/**
 * Community Plugin Entry Point
 *
 * This is the main entry point for your plugin. It exports a default
 * plugin object created with createPlugin() that the Management UI
 * Core will load and register.
 *
 * IMPORTANT: This file must export a default plugin object.
 */

// Import plugin styles (Tailwind CSS)
// This ensures your plugin's CSS is bundled and loaded with the plugin
import "./styles/index.css";

import { CloudRain } from "lucide-react";

import { createPlugin } from "@workspace/plugin-system";

import { MyPluginView } from "./views/MyPluginView";

/**
 * Cyan Cat Rain
 */
const myPlugin = createPlugin({
  namespace: "cyan-cat-rain",
  type: "app",
  version: "1.0.0",
  initialize(manager) {
    manager.registerObject("apps:definitions", "cyan-cat-rain:app", {
      id: "cyan-cat-rain-app",
      name: "Cyan Cat Rain",
      routePath: "/cyan-cat-rain",
      component: MyPluginView,
    });

    manager.registerObject("sidebar:nav-items", "cyan-cat-rain:nav", {
      title: "Cyan Cat Rain",
      path: "/cyan-cat-rain",
      icon: CloudRain,
      order: 120,
      permissions: [],
      featureFlags: [],
    });
  },
  activate() {},
  deactivate() {},
});

// Export as default - this is required for dynamic loading
export default myPlugin;

// Also export named for TypeScript consumers
export { myPlugin };
