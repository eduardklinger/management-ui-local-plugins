/**
 * University of Vienna Plugin – single entry for remote loading (Management UI Core).
 *
 * Conforms to the community plugin pattern: one default export (createPlugin)
 * that registers all Univie modules when loaded via .local-plugins
 * or the Marketplace.
 */
import { createPlugin } from "@oc-mui/plugin-system";

import {
  univieEmptyStateImplementation,
  univieFooterImplementation,
  univieLandingPageImplementation,
  univieSidebarImplementation,
  univieNavItemsImplementation,
} from "../modules/index";

const pluginUnivie = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    manager.register(univieFooterImplementation);
    manager.register(univieSidebarImplementation);
    manager.register(univieNavItemsImplementation);
    manager.register(univieLandingPageImplementation);
    manager.register(univieEmptyStateImplementation);
  },

  activate() {},
  deactivate() {},
});

export default pluginUnivie;
export { pluginUnivie };
