const { createGlobPatternsForDependencies } = require("@nx/next/tailwind");
const sharedUiPreset = require("../../libs/ui/tailwind.preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    "../../libs/ui/src/**/*.{ts,tsx,js,jsx}",
    ...createGlobPatternsForDependencies(__dirname),
  ],
  presets: [sharedUiPreset],
  theme: {
    extend: {
      animation: {
        "auth-float": "auth-float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "auth-dot-grid":
          "radial-gradient(circle, hsl(var(--auth-dot)) 1px, transparent 1px)",
      },
      backgroundSize: {
        "auth-dot": "24px 24px",
      },
      keyframes: {
        "auth-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
      },
    },
  },
};
