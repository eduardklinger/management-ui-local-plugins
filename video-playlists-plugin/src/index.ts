import { List } from "lucide-react";
import { createPlugin, type PluginManager } from "@workspace/plugin-system";

import { VideoPlaylistsView } from "./views/VideoPlaylistsView";

const videoPlaylistsPlugin = createPlugin({
  namespace: "video-playlists-plugin",
  type: "app",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    manager.registerObject("apps:definitions", "video-playlists-app", {
      id: "video-playlists-app",
      name: "Video Playlists",
      routePath: "/video-playlists",
      component: VideoPlaylistsView,
    });

    manager.registerObject("sidebar:nav-items", "video-playlists-nav", {
      title: "Video Playlists",
      path: "/video-playlists",
      icon: List,
      order: 170,
      permissions: [],
      featureFlags: [],
      category: "main",
    });
  },

  activate() {},
  deactivate() {},
});

export default videoPlaylistsPlugin;
export { videoPlaylistsPlugin, VideoPlaylistsView };
