import { BankIcon, HomeIcon, InsightsIcon, type IconProps, UserIcon } from '@shared-ui';
import type { ComponentType } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  /** Label + icon color (light + dark). */
  accentClassName: string;
  activeBgClassName: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    icon: HomeIcon,
    accentClassName: 'text-emerald-600 dark:text-emerald-400',
    activeBgClassName: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    label: 'Home',
  },
  {
    href: '/insights',
    icon: InsightsIcon,
    accentClassName: 'text-sky-600 dark:text-sky-400',
    activeBgClassName: 'bg-sky-500/10 dark:bg-sky-400/10',
    label: 'Insights',
  },
  {
    href: '/transactions',
    icon: BankIcon,
    accentClassName: 'text-amber-600 dark:text-amber-400',
    activeBgClassName: 'bg-amber-500/10 dark:bg-amber-400/10',
    label: 'Transactions',
  },
  {
    href: '/settings',
    icon: UserIcon,
    accentClassName: 'text-violet-600 dark:text-violet-400',
    activeBgClassName: 'bg-violet-500/10 dark:bg-violet-400/10',
    label: 'Settings',
  },
];

export function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
