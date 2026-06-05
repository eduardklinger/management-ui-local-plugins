import "../../src/styles/plugin.css";

import { createPlugin } from "@oc-mui/plugin-system";
import type { PluginManager } from "@oc-mui/plugin-system";

import { UnivieFooter } from "./components/UnivieFooter";

export const univieFooterImplementation = createPlugin({
  namespace: "univie",
  type: "footer",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerComponent("component-override:appshell:footer", UnivieFooter, {
      key: "univie-footer",
      order: 50,
    });
  },

  activate() {},
  deactivate() {},
});

export default univieFooterImplementation;
