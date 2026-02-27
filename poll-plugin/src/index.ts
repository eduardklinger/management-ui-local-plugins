import "./styles/index.css";

import { BarChart3 } from "lucide-react";
import { createPlugin } from "@workspace/plugin-system";

import { PollWallView } from "./views/PollWallView";

const pollPlugin = createPlugin({
  namespace: "poll-plugin",
  type: "app",
  version: "1.0.0",

  initialize(manager) {
    manager.registerObject("apps:definitions", "poll-plugin-app", {
      id: "poll-plugin-app",
      name: "Audience Poll",
      routePath: "/poll-plugin",
      component: PollWallView,
    });

    manager.registerObject("sidebar:nav-items", "poll-plugin-nav", {
      title: "Audience Poll",
      path: "/poll-plugin",
      icon: BarChart3,
      order: 160,
    });
  },

  activate() {
    console.log("Poll Plugin activated");
  },

  deactivate() {
    console.log("Poll Plugin deactivated");
  },
});

export default pollPlugin;
export { pollPlugin };
