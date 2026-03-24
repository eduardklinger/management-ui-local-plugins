import { createPlugin } from "@workspace/plugin-system";

import { VideoPlaylistsAclEditor } from "./components/VideoPlaylistsAclEditor";

const videoPlaylistsAclEditorPlugin = createPlugin({
  namespace: "video-playlists-acl-editor-plugin",
  type: "video-playlists-acl-editor",
  version: "1.0.0",

  initialize(manager) {
    manager.registerComponent("video-playlists:acl-editor", VideoPlaylistsAclEditor, {
      key: "video-playlists-acl-editor-plugin",
      order: 50,
    });
  },

  activate() {},

  deactivate() {},
});

export default videoPlaylistsAclEditorPlugin;
export { videoPlaylistsAclEditorPlugin, VideoPlaylistsAclEditor };
