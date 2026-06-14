"use client";

import { NAV_ITEMS } from "../../utils";
import { AppBrand } from "./AppBrand";
import { NavLink } from "./NavLink";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center border-b border-border px-6">
        <AppBrand />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink item={item} key={item.href} layout="sidebar" />
        ))}
      </nav>
    </aside>
  );
}
