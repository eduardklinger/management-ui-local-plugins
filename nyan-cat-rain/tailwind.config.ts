import { shadcnPreset } from "@oc-mui/tailwind-config/preset";

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
