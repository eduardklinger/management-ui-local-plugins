/**
 * University of Vienna Plugin – single entry for remote loading (Management UI Core).
 *
 * Conforms to the community plugin pattern: one default export (createPlugin)
 * that registers all Univie implementations when loaded via .local-plugins
 * or the Marketplace.
 */
import { createPlugin } from "@workspace/plugin-system";

import { univieEventCalendarPlugin } from "../apps/event-calendar-plugin";
import {
  univieEmptyStateImplementation,
  univieFooterImplementation,
  univieLandingPageImplementation,
  univieSidebarImplementation,
  studioUnivieNavImplementation,
  captureUnivieNavImplementation,
} from "../implementations/index";

const pluginUnivie = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    manager.register(univieFooterImplementation);
    manager.register(univieSidebarImplementation);
    manager.register(studioUnivieNavImplementation);
    manager.register(captureUnivieNavImplementation);
    manager.register(univieLandingPageImplementation);
    manager.register(univieEmptyStateImplementation);
    manager.register(univieEventCalendarPlugin);
  },

  activate() {},
  deactivate() {},
});

export default pluginUnivie;
export { pluginUnivie };
