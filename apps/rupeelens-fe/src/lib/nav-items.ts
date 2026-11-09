import { HomeIcon, type IconProps, UserIcon } from '@shared-ui';
import type { ComponentType } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/settings', icon: UserIcon, label: 'Settings' },
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
