# Feedback Plugin

A community plugin for collecting and managing user feedback in the Management UI.

## Features

- 📝 **Feedback Form** - User-friendly form for submitting feedback
- ⭐ **Rating System** - Optional 5-star rating
- 🏷️ **Categories** - Bug reports, feature requests, improvements, questions
- 🔧 **System Info** - Optional inclusion of browser/system information
- ✅ **Validation** - Form validation with helpful error messages
- 🎨 **Modern UI** - Beautiful, responsive design using workspace UI components

## Installation

### Local Development

1. **Build the plugin:**
   ```bash
   cd feedback-plugin
   pnpm install
   pnpm build
   ```

2. **Serve locally:**
   ```bash
   npx http-server dist --cors -p 5173
   ```

3. **Load in Management UI:**
   - Navigate to Marketplace (`/admin/marketplace`)
   - Use Developer Mode
   - Enter: `http://127.0.0.1:5173/feedback.mjs`

### Production Distribution

1. **Create GitHub Release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Plugin URL:**
   ```
   https://cdn.jsdelivr.net/gh/YOUR_ORG/feedback-plugin@v1.0.0/dist/feedback.mjs
   ```

## Backend Integration

The plugin submits feedback to `/admin-ng/feedback` endpoint. You need to implement this endpoint in your backend.

### Expected Payload

```json
{
  "category": "bug|feature|improvement|question|other",
  "rating": 1-5 | null,
  "subject": "Optional subject line",
  "message": "Feedback message (required, min 10 chars)",
  "systemInfo": {
    "userAgent": "...",
    "platform": "...",
    "language": "...",
    "screenResolution": "1920x1080",
    "viewportSize": "1920x1080",
    "timestamp": "2025-01-21T10:00:00.000Z"
  },
  "timestamp": "2025-01-21T10:00:00.000Z"
}
```

### Backend Implementation Example

```java
@POST
@Path("/feedback")
@Consumes(MediaType.APPLICATION_JSON)
public Response submitFeedback(FeedbackPayload payload) {
    // Store feedback in database
    // Send notification to development team
    // Return success response
    return Response.ok().build();
}
```

## Plugin Metadata

```json
{
  "id": "feedback",
  "name": "Feedback",
  "description": "Collect and manage user feedback",
  "category": "feature",
  "icon": "MessageSquare",
  "tags": ["feedback", "user-input", "communication"]
}
```

## Development

### Available Scripts

- `pnpm dev` - Build with watch mode
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - TypeScript type checking

### Project Structure

```
feedback-plugin/
├── src/
│   ├── index.ts              # Plugin entry point
│   └── views/
│       └── FeedbackView.tsx # Main feedback form component
├── dist/                     # Build output
├── package.json
├── vite.config.ts
└── README.md
```

## Customization

### Adding Custom Categories

Edit `FEEDBACK_CATEGORIES` in `FeedbackView.tsx`:

```typescript
const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "custom", label: "Custom Category" },
  // ...
];
```

### Changing Backend Endpoint

Update the fetch URL in `FeedbackView.tsx`:

```typescript
const response = await fetch("/your-custom-endpoint", {
  // ...
});
```

## License

MIT
