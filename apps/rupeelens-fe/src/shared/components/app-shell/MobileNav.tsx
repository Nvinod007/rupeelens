"use client";

import { NAV_ITEMS } from "../../utils";
import { NavLink } from "./NavLink";

export function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink item={item} key={item.href} layout="mobile" />
      ))}
    </nav>
  );
}
