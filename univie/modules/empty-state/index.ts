import "../../src/styles/plugin.css";

import { createPlugin } from "@oc-mui/plugin-system";
import type { PluginManager } from "@oc-mui/plugin-system";

import { UnivieEmptyState } from "./components";

export const univieEmptyStateImplementation = createPlugin({
  namespace: "univie",
  type: "empty-state",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerComponent("component-override:series:empty-state", UnivieEmptyState, {
      key: "univie-empty-state",
      order: 50,
    });
  },

  activate() {},
  deactivate() {},
});

const plugin = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",
  initialize(manager) {
    manager.register(univieEmptyStateImplementation);
  },
  activate() {},
  deactivate() {},
});

export default plugin;
