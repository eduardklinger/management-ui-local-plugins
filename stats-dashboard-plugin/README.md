# Statistics Dashboard Plugin

A beautiful, animated statistics dashboard for Opencast Management UI that displays real-time event statistics.

## Features

- 📊 **Real-time Statistics** - Fetches data from `/admin-ng/resources/STATS.json`
- 🎨 **Beautiful Animations** - Smooth fade-in, hover effects, and shimmer animations
- 🎯 **Color-coded Cards** - Each stat type has its own color and icon
- 🔄 **Auto-refresh** - Automatically refreshes every 60 seconds
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Development

### Prerequisites

- Node.js 20+
- pnpm (or npm)

### Setup

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Watch mode for development
pnpm dev
```

### Local Testing

1. **Build the plugin:**
   ```bash
   pnpm build
   ```

2. **Serve the plugin:**
   ```bash
   npx http-server dist --cors -p 5173
   ```

3. **Test in Management UI:**
   - Open Admin > Marketplace
   - Go to Developer Mode
   - Enter: `http://127.0.0.1:5173/stats-dashboard.mjs`
   - Click "Try" or "Install"

## Building for Production

```bash
pnpm build
```

This creates `dist/stats-dashboard.mjs` which can be hosted on a CDN.

## Distribution

### Option 1: GitHub Releases + jsDelivr (Recommended)

1. **Create a GitHub repository** and push your code

2. **Create a release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Your plugin URL will be:**
   ```
   https://cdn.jsdelivr.net/gh/your-org/stats-dashboard-plugin@v1.0.0/dist/stats-dashboard.mjs
   ```

4. **Add to registry:**
   - Fork [management-ui-registry](https://github.com/eduardklinger/management-ui-registry)
   - Add your plugin entry to `registry.json`
   - Create a Pull Request

### Option 2: Custom CDN

Host `dist/stats-dashboard.mjs` on your own CDN and add the URL to the registry.

## Plugin Metadata

```json
{
  "id": "stats-dashboard",
  "name": "Statistics Dashboard",
  "description": "Beautiful animated dashboard displaying Opencast event statistics",
  "version": "1.0.0",
  "category": "feature",
  "icon": "BarChart3",
  "tags": ["dashboard", "statistics", "analytics", "events"],
  "workspaceDependencies": {
    "@workspace/plugin-system": ">=1.0.0",
    "@workspace/ui": ">=1.0.0",
    "@workspace/query": ">=1.0.0"
  }
}
```

## Architecture

- **Entry Point:** `src/index.ts` - Registers the plugin and routes
- **Main View:** `src/views/StatsDashboard.tsx` - The dashboard component
- **Build Output:** `dist/stats-dashboard.mjs` - Single ES module file

## API Endpoint

The plugin fetches statistics from:
```
GET /admin-ng/resources/STATS.json
```

Response format:
```json
{
  "RECORDING": "{\"filters\": [...], \"description\": \"...\", \"order\": 7}",
  "FINISHED": "{\"filters\": [...], \"description\": \"...\", \"order\": 12}",
  ...
}
```

## Future Enhancements

- [ ] Fetch actual event counts for each stat
- [ ] Add time-range filters
- [ ] Export statistics to CSV/JSON
- [ ] Add charts and graphs
- [ ] Real-time updates via WebSocket

## License

MIT

## Support

- [Management UI Documentation](https://github.com/opencast/management-ui)
- [Community Plugin Development Guide](https://github.com/opencast/management-ui/blob/main/docs/COMMUNITY_PLUGIN_DEVELOPMENT.md)
