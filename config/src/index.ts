/**
 * Root config plugin for .local-plugins.
 * Loaded first (namespace "config" is in default pluginNamespace); registers app:config
 * so phase 2 can load univie, tuwien, etc. from the same config.
 */
import { createPlugin } from "@workspace/plugin-system";

import { config } from "./config";

const rootConfigPlugin = createPlugin({
  namespace: "config",
  type: "config",
  version: "1.0.0",
  initialize(manager) {
    manager.registerObject("app:config", "config", config);
  },
  activate() {},
  deactivate() {},
});

export default rootConfigPlugin;
