'use client';

import { cn } from '@shared-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isNavActive, type NavItem } from '@/lib/nav-items';

type NavLinkProps = {
  item: NavItem;
  layout?: 'sidebar' | 'mobile';
};

export function NavLink({ item, layout = 'sidebar' }: NavLinkProps) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  if (layout === 'mobile') {
    return (
      <Link
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-colors',
          item.accentClassName,
          active
            ? cn(item.activeBgClassName, 'font-semibold')
            : 'opacity-75 hover:opacity-100'
        )}
        href={item.href}
      >
        <Icon animated={false} className="size-5" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        item.accentClassName,
        active
          ? cn(item.activeBgClassName, 'font-semibold')
          : 'opacity-80 hover:bg-muted/40 hover:opacity-100'
      )}
      href={item.href}
    >
      <Icon animated={false} className="size-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
