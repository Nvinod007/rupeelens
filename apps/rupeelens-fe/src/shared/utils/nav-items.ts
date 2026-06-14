import {
  BankIcon,
  type IconProps,
  InsightsIcon,
  MonitorIcon,
  RupeeIcon,
  UserIcon,
} from "@shared-ui";
import type { ComponentType } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: MonitorIcon, label: "Home" },
  { href: "/transactions", icon: RupeeIcon, label: "Transactions" },
  { href: "/accounts", icon: BankIcon, label: "Accounts" },
  { href: "/insights", icon: InsightsIcon, label: "Insights" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
