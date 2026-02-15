/**
 * TU Wien Plugin – single entry for remote loading (Management UI Core).
 *
 * Conforms to the community plugin pattern: one default export (createPlugin)
 * that registers all TU Wien implementations when loaded via .local-plugins
 * or the Marketplace.
 */
import { createPlugin } from "@workspace/plugin-system";

import { tuWienCustomAppPlugin } from "../apps/tuwien-custom-app-plugin";
import {
  tuwienEpisodesActionsImplementation,
  tuwienFooterImplementation,
  tuwienHeaderImplementation,
  tuwienLandingPageImplementation,
  tuwienSeriesActionsImplementation,
  tuwienSidebarImplementation,
  studioNavImplementation,
  tuwienTableSidebarImplementation,
  tuwienUploadAclEditorImplementation,
} from "../implementations/index";

const pluginTuwien = createPlugin({
  namespace: "tuwien",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    manager.register(tuwienFooterImplementation);
    manager.register(tuwienHeaderImplementation);
    manager.register(tuwienLandingPageImplementation);
    manager.register(tuwienSidebarImplementation);
    manager.register(studioNavImplementation);
    manager.register(tuwienTableSidebarImplementation);
    manager.register(tuwienUploadAclEditorImplementation);
    manager.register(tuwienEpisodesActionsImplementation);
    manager.register(tuwienSeriesActionsImplementation);
    manager.register(tuWienCustomAppPlugin);
  },

  activate() {},
  deactivate() {},
});

export default pluginTuwien;
export { pluginTuwien };
