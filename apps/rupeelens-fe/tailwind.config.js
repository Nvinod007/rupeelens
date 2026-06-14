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
};
