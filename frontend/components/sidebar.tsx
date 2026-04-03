"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Settings, LogOut, ListTodo } from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

type SidebarProps = {
  activeItem?: string;
};

export default function Sidebar({ activeItem = "Projects" }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Projects", icon: <LayoutGrid className="h-4 w-4" />, href: "/dashboard" },
    { label: "Teams", icon: <Users className="h-4 w-4" />, href: "/dashboard/teams" },
    { label: "Settings", icon: <Settings className="h-4 w-4" />, href: "/dashboard/settings" },
  ];

  const isActive = (label: string, href: string) => {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return true;
    }
    if (label === "Projects") {
      return pathname.startsWith("/dashboard/project") || pathname.startsWith("/dashboard/board");
    }
    return label === activeItem;
  };

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg">
          <Link href="/">
            <ListTodo className="h-5 w-5" />
          </Link>
        </div>
        <Link href="/">
          <span className="text-lg font-semibold text-slate-900">TaskFlow</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, icon, href }) => {
          const active = isActive(label, href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 px-3 py-4">
        <Link href="/">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </Link>
      </div>
    </aside>
  );
}