/**
 * Statistics Dashboard Plugin Entry Point
 *
 * This plugin provides a beautiful animated dashboard displaying
 * Opencast event statistics from /admin-ng/resources/STATS.json
 */

import { BarChart3 } from "lucide-react";
import { createPlugin } from "@workspace/plugin-system";

import { StatsDashboard } from "./views/StatsDashboard";

/**
 * Statistics Dashboard Plugin
 */
const statsDashboardPlugin = createPlugin({
  namespace: "stats-dashboard",
  type: "app",
  version: "1.0.0",

  /**
   * Initialize the plugin
   */
  initialize(manager) {
    console.log("Statistics Dashboard plugin initializing...");

    // Register the main app/view
    manager.registerObject("apps:definitions", "stats-dashboard-app", {
      id: "stats-dashboard-app",
      name: "Statistics Dashboard",
      routePath: "/stats-dashboard",
      component: StatsDashboard,
    });

    // Register sidebar navigation
    manager.registerObject("sidebar:nav-items", "stats-dashboard-nav", {
      title: "Statistics",
      path: "/stats-dashboard",
      icon: BarChart3,
      order: 50, // Higher = lower in sidebar
      permissions: [], // No special permissions required
      featureFlags: [],
      category: "main",
    });

    console.log("Statistics Dashboard plugin initialized");
  },

  /**
   * Activate the plugin
   */
  activate() {
    console.log("Statistics Dashboard plugin activated");
  },

  /**
   * Deactivate the plugin
   */
  deactivate() {
    console.log("Statistics Dashboard plugin deactivated");
  },
});

// Export as default - this is required for dynamic loading
export default statsDashboardPlugin;

// Also export named for TypeScript consumers
export { statsDashboardPlugin };
