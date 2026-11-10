'use client';

import { NAV_ITEMS } from '@/lib/nav-items';

import { AppBrand } from './AppBrand';
import { NavLink } from './NavLink';
import { SidebarSignOut } from './SidebarSignOut';

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 self-start flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
        <AppBrand />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink item={item} key={item.href} layout="sidebar" />
        ))}
      </nav>

      <SidebarSignOut />
    </aside>
  );
}
