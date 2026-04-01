import React from "react";

import { createPlugin } from "@workspace/plugin-system";
import type { PluginManager } from "@workspace/plugin-system";
import type { NavMainProps } from "@workspace/ui/components";
import { Video, ExternalLink } from "@workspace/ui/components/icons";
import { logger } from "@workspace/utils";

import { CustomNavMain } from "./components/CustomNavMain";
import { SidebarFooter } from "./components/SidebarFooter";
import { SidebarHeaderLogo } from "./components/SidebarHeaderLogo";

/**
 * University of Vienna Custom Sidebar Implementation Plugin
 * Migrated from migrate/extensions/src/univie/src/plugins/appshell-sidebar/index.tsx
 *
 * Provides custom sidebar navigation, header, and footer components for University of Vienna
 * Replaces the default sidebar components with university-specific styling and behavior
 */

// Create wrapper components that can receive props from the plugin system
const CustomNavMainWrapper = (props: { open?: boolean; items?: NavMainProps["items"] }) => {
  return React.createElement(CustomNavMain, { ...props, items: props.items || [] });
};

const SidebarHeaderLogoWrapper = (props: React.ComponentProps<typeof SidebarHeaderLogo>) => {
  return React.createElement(SidebarHeaderLogo, props);
};

const SidebarFooterWrapper = (props: Record<string, unknown>) => {
  return React.createElement(SidebarFooter, props);
};

export const univieSidebarImplementation = createPlugin({
  namespace: "univie",
  type: "sidebar",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    // Register custom navigation component with high priority
    manager.registerComponent("component-override:appshell:sidebar:content", CustomNavMainWrapper, {
      key: "univie-sidebar-content",
      order: 50, // Higher priority than core default
    });

    // Register custom header logo component with high priority
    manager.registerComponent(
      "component-override:appshell:sidebar:header",
      SidebarHeaderLogoWrapper,
      {
        key: "univie-sidebar-header",
        order: 50, // Higher priority than core default
      },
    );

    // Register custom footer component with high priority
    manager.registerComponent("component-override:appshell:sidebar:footer", SidebarFooterWrapper, {
      key: "univie-sidebar-footer",
      order: 50, // Higher priority than core default
    });
  },

  activate() {},

  deactivate() {},
});

const getConfigUrl = (
  configObjects: Array<Record<string, unknown>>,
  appKey: "studioUrl" | "captureUrl",
  rootKey: "studioUrl" | "captureUrl",
) => {
  for (let i = configObjects.length - 1; i >= 0; i -= 1) {
    const configObject = configObjects[i];
    if (!configObject) continue;

    const appConfig = configObject["app"] as Record<string, unknown> | undefined;
    const appUrl = appConfig?.[appKey];
    if (typeof appUrl === "string" && appUrl.trim().length > 0) {
      return appUrl;
    }

    const rootUrl = configObject[rootKey];
    if (typeof rootUrl === "string" && rootUrl.trim().length > 0) {
      return rootUrl;
    }
  }

  return undefined;
};

export const univieNavItemsImplementation = createPlugin({
  namespace: "univie",
  type: "navigation",
  version: "1.0.0",

  initialize(manager: PluginManager) {
    // Read URLs from the latest matching config object to avoid undefined
    // values introduced by shallow-merge overrides.
    const configObjects = manager.getObjects<Record<string, unknown>>("app:config");
    const studioUrl = getConfigUrl(configObjects, "studioUrl", "studioUrl") || "/studio";
    const captureUrl = getConfigUrl(configObjects, "captureUrl", "captureUrl") || "/capture";

    manager.registerObject("sidebar:nav-items", "studio", {
      title: "Studio",
      path: studioUrl,
      target: "_blank",
      icon: Video,
      order: 50,
      permissions: [],
      featureFlags: [],
      category: "studio",
    });

    manager.registerObject("sidebar:nav-items", "capture", {
      title: "univie-sidebar:capture", // i18n key
      path: captureUrl,
      target: "_blank",
      icon: ExternalLink,
      order: 51,
      permissions: [],
      featureFlags: [],
      category: "capture",
    });
  },

  activate() {
    logger.debug("[univie:navigation:capture] Plugin activated");
  },

  deactivate() {
    logger.debug("[univie:navigation:capture] Plugin deactivated");
  },
});
