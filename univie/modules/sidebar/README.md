# University of Vienna Sidebar

Custom sidebar navigation, header, and footer components for the University of Vienna.

**Location**: `modules/sidebar/`

## Components

- **CustomNavMain** - Navigation with collapsible groups and custom active state indicators
- **SidebarHeaderLogo** - Animated transitions between full logo and home icon
- **SidebarFooter** - User info with Gravatar integration, adapts to sidebar open/closed state

## Extension Points

- `component-override:appshell:sidebar:content` - Replaces default sidebar navigation
- `component-override:appshell:sidebar:header` - Replaces default sidebar header
- `component-override:appshell:sidebar:footer` - Replaces default sidebar footer

## Navigation Items

Also registers external nav items for Studio and Capture (URLs read from app config).
