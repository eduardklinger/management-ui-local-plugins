/**
 * Univie sidebar + navigation bundle (plugin-univie-sidebar.mjs).
 * Loaded when config has univie: { types: [..., "sidebar", "navigation"] }.
 */
import { createPlugin } from "@workspace/plugin-system";

import {
  univieSidebarImplementation,
  univieNavItemsImplementation,
} from "../../implementations/sidebar";

const plugin = createPlugin({
  namespace: "univie",
  type: "sidebar",
  version: "1.0.0",
  initialize(manager) {
    manager.register(univieSidebarImplementation);
    manager.register(univieNavItemsImplementation);
  },
  activate() {},
  deactivate() {},
});

export default plugin;
