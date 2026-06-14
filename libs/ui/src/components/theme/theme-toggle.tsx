"use client";

import { cn } from "@shared-ui/lib";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MonitorIcon, MoonIcon, SunIcon } from "../icons";

const themes = [
  { Icon: SunIcon, label: "Light", value: "light" },
  { Icon: MoonIcon, label: "Dark", value: "dark" },
  { Icon: MonitorIcon, label: "System", value: "system" },
] as const;

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn(
          "h-9 w-[7.75rem] rounded-lg border border-border",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-label="Theme"
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm",
        className
      )}
      role="group"
    >
      {themes.map(({ Icon, label, value }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              "group rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTheme(value)}
            title={label}
            type="button"
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
