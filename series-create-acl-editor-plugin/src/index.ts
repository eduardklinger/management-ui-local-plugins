import { createPlugin } from "@workspace/plugin-system";

import { SeriesCreateAclEditor } from "./components/SeriesCreateAclEditor";

const seriesCreateAclEditorPlugin = createPlugin({
  namespace: "series-create-acl-editor-plugin",
  type: "series-create-acl-editor",
  version: "1.0.0",

  initialize(manager) {
    manager.registerComponent("series:create-series:acl-editor", SeriesCreateAclEditor, {
      key: "series-create-acl-editor-plugin",
      order: 50,
    });
  },

  activate() {},

  deactivate() {},
});

export default seriesCreateAclEditorPlugin;
export { seriesCreateAclEditorPlugin, SeriesCreateAclEditor };
