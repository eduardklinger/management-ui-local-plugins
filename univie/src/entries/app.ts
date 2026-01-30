/**
 * Univie app bundle (plugin-univie-app.mjs): event-calendar + empty-state.
 */
import { createPlugin } from "@workspace/plugin-system";

import { univieEventCalendarPlugin } from "../../apps/event-calendar-plugin";
import { univieEmptyStateImplementation } from "../../implementations/empty-state";

const plugin = createPlugin({
  namespace: "univie",
  type: "app",
  version: "1.0.0",
  initialize(manager) {
    manager.register(univieEmptyStateImplementation);
    manager.register(univieEventCalendarPlugin);
  },
  activate() {},
  deactivate() {},
});

export default plugin;
