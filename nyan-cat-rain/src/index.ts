import { Rocket } from "lucide-react";

import { createPlugin, type PluginManager } from "@workspace/plugin-system";

import { NyanCatRainView } from "./views/NyanCatRainView";

import "./styles/index.css";

export const nyanCatRainPlugin = createPlugin({
  // Keep it in core namespace for immediate loading in dev.
  namespace: "core",
  type: "nyan-cat-rain",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerObject("apps:definitions", "core:nyan-cat-rain:app", {
      id: "core-nyan-cat-rain-app",
      name: "Nyan Cat Rain",
      routePath: "/nyan-cat-rain",
      component: NyanCatRainView,
    });

    manager.registerObject("sidebar:nav-items", "core:nyan-cat-rain:nav", {
      title: "Nyan Cat Rain",
      path: "/nyan-cat-rain",
      icon: Rocket,
      order: 126,
      permissions: [],
      featureFlags: [],
      category: "core",
    });
  },

  activate() {},

  deactivate() {},
});

export default nyanCatRainPlugin;
export { NyanCatRainView };
