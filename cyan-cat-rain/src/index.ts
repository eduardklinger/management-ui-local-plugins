import { CloudRain } from "lucide-react";

import { createPlugin, type PluginManager } from "@workspace/plugin-system";

import { CyanCatRainView } from "./views/CyanCatRainView";

import "./styles/index.css";

export const cyanCatRainPlugin = createPlugin({
  // Keep this in "core" so it is loaded by default in dev without extra config changes.
  namespace: "core",
  type: "cyan-cat-rain",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerObject("apps:definitions", "core:cyan-cat-rain:app", {
      id: "core-cyan-cat-rain-app",
      name: "Cyan Cat Rain",
      routePath: "/cyan-cat-rain",
      component: CyanCatRainView,
    });

    manager.registerObject("sidebar:nav-items", "core:cyan-cat-rain:nav", {
      title: "Cyan Cat Rain",
      path: "/cyan-cat-rain",
      icon: CloudRain,
      order: 125,
      permissions: [],
      featureFlags: [],
      category: "core",
    });
  },

  activate() {},

  deactivate() {},
});

export default cyanCatRainPlugin;
export { CyanCatRainView };
