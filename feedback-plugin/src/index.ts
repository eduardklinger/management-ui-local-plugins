/**
 * Feedback Plugin Entry Point
 *
 * A community plugin for collecting and managing user feedback.
 */

import { createPlugin } from "@workspace/plugin-system";

import { FeedbackView } from "./views/FeedbackView";

/**
 * Feedback Plugin
 */
const feedbackPlugin = createPlugin({
  namespace: "feedback",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    // Register the main feedback app
    manager.registerObject("apps:definitions", "feedback-app", {
      id: "feedback-app",
      name: "Feedback",
      routePath: "/feedback",
      component: FeedbackView,
    });

    // Register sidebar navigation
    manager.registerObject("sidebar:nav-items", "feedback-nav", {
      title: "Feedback",
      path: "/feedback",
      icon: "MessageSquare", // Will be resolved from lucide-react
      order: 200,
      permissions: [],
    });
  },

  activate() {
    // Plugin activated
  },

  deactivate() {
    // Plugin deactivated
  },
});

// Export as default - required for dynamic loading
export default feedbackPlugin;

// Also export named for TypeScript consumers
export { feedbackPlugin };
