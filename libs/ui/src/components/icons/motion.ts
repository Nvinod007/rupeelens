/** Tailwind motion presets — use with a `group` parent for hover effects. */
export const iconMotion = {
  bank: "transition-transform duration-200 ease-out group-hover:scale-110",
  google: "transition-transform duration-200 ease-out group-hover:scale-105",
  insights: "transition-transform duration-200 ease-out group-hover:scale-110",
  lock: "transition-transform duration-200 ease-out group-hover:scale-110",
  monitor: "transition-transform duration-200 ease-out group-hover:scale-105",
  moon: "transition-transform duration-200 ease-out group-hover:scale-110",
  rupee:
    "transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110",
  sun: "transition-transform duration-500 ease-out group-hover:rotate-90",
  user: "transition-transform duration-200 ease-out group-hover:scale-110",
} as const;

export type IconMotionKey = keyof typeof iconMotion;
