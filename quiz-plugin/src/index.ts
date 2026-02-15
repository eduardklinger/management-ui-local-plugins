/**
 * Quiz Plugin Entry Point
 * 
 * This plugin provides quiz functionality for events:
 * - Create quizzes for events
 * - Take quizzes
 * - View results and statistics
 * 
 * Uses hybrid approach:
 * - GraphQL (Opencast) for event data
 * - Convex for quiz data (real-time)
 */

import { HelpCircle } from "lucide-react";
import { createPlugin } from "@workspace/plugin-system";
import { QuizView } from "./views/QuizView";
import { QuizListView } from "./views/QuizListView";

export const quizPlugin = createPlugin({
  namespace: "quiz",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    // Register base quiz route (list view)
    manager.registerObject("apps:definitions", "quiz-app", {
      id: "quiz-app",
      name: "Quiz",
      routePath: "/quiz",
      component: QuizListView,
    });

    // Register quiz route with eventId parameter
    manager.registerObject("apps:definitions", "quiz-event-app", {
      id: "quiz-event-app",
      name: "Quiz Event",
      routePath: "/quiz/$eventId",
      component: QuizView,
    });

    // Register sidebar navigation
    manager.registerObject("sidebar:nav-items", "quiz-nav", {
      title: "Quiz",
      path: "/quiz",
      icon: HelpCircle,
      order: 150,
    });
  },

  activate() {
    console.log("Quiz Plugin activated");
  },

  deactivate() {
    console.log("Quiz Plugin deactivated");
  },
});

// Also export as default for community plugin compatibility
export default quizPlugin;
