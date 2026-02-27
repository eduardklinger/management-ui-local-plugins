import { shadcnPreset } from "@workspace/tailwind-config/preset";

import type { Config } from "tailwindcss";

export default {
  presets: [shadcnPreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
} satisfies Config;
