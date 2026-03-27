import { shadcnPreset } from "@workspace/tailwind-config/preset";

import type { Config } from "tailwindcss";

export default {
  presets: [shadcnPreset],
  content: [
    "./src/**/*.{ts,tsx}",
    "./implementations/**/*.{ts,tsx}",
    "./apps/**/*.{ts,tsx}",
  ],
} satisfies Config;
