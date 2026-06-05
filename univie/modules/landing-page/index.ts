import "../../src/styles/plugin.css";

import { createPlugin } from "@oc-mui/plugin-system";
import type { PluginManager } from "@oc-mui/plugin-system";

import { InfoPage } from "./components/InfoPage";

export const univieLandingPageImplementation = createPlugin({
  namespace: "univie",
  type: "landing-page",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerComponent("component-override:appshell:landing-page", InfoPage, {
      key: "univie-landing-page",
      order: 50,
    });
  },

  activate() {},
  deactivate() {},
});

export default univieLandingPageImplementation;
