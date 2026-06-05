import { shadcnPreset } from "@oc-mui/tailwind-config/preset";

import type { Config } from "tailwindcss";

export default {
  presets: [shadcnPreset],
  content: [
    "./src/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
  ],
} satisfies Config;
