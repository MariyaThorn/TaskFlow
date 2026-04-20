"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Users, Settings, LogOut, ListTodo, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

type SidebarProps = {
  activeItem?: string;
  onMobileToggle?: (open: boolean) => void;
};

export default function Sidebar({ activeItem = "Projects" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydratedRef = useRef(false);

  // Read collapsed preference from localStorage after hydration (avoids SSR mismatch)
  // We use a ref so the very first render after mount has no transition
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed") === "true";
    setCollapsed(saved);
    // Allow transitions only after the initial state is applied
    requestAnimationFrame(() => {
      hydratedRef.current = true;
    });
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const navItems: NavItem[] = [
    { label: "Projects", icon: <LayoutGrid className="h-4 w-4" />, href: "/dashboard" },
    { label: "Teams", icon: <Users className="h-4 w-4" />, href: "/dashboard/teams" },
    { label: "Settings", icon: <Settings className="h-4 w-4" />, href: "/dashboard/settings" },
  ];

  const isActive = (label: string, href: string) => {
    if (label === "Projects") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/project") || pathname.startsWith("/dashboard/board");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex h-16 items-center gap-2 border-b border-[#e0aaff]/30 ${collapsed ? "justify-center px-2" : "px-6"}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Link href="/">
            <ListTodo className="h-5 w-5 text-[#5a189a]" />
          </Link>
        </div>
        {!collapsed && (
          <Link href="/">
            <span className="text-lg font-semibold text-[#3c096c]">TaskFlow</span>
          </Link>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#5a189a] hover:bg-[#5a189a]/10 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 z-20 hidden h-6 w-6 items-center justify-center rounded-full border border-[#e0aaff]/50 bg-white shadow-sm transition-colors hover:bg-[#f0e5ff] md:flex"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-[#5a189a]" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-[#5a189a]" />
        )}
      </button>

      {/* Nav items */}
      <nav className={`flex-1 space-y-1 py-4 ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map(({ label, icon, href }) => {
          const active = isActive(label, href);
          return (
            <Link
              key={label}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#5a189a]/15 text-[#5a189a]"
                  : "text-[#3c096c]/70 hover:bg-[#5a189a]/10 hover:text-[#5a189a]"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className="shrink-0">{icon}</span>
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`border-t border-[#e0aaff]/30 py-4 ${collapsed ? "px-2" : "px-3"}`}>
        <button
          onClick={() => {
            clearAuth();
            router.push("/");
          }}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#3c096c]/70 hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-[#ede0ff] shadow-md md:hidden"
      >
        <Menu className="h-5 w-5 text-[#5a189a]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e0aaff]/30 bg-[#ede0ff] transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 z-30 hidden h-screen flex-col border-r border-[#e0aaff]/30 bg-[#ede0ff] md:flex ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
        style={{ transition: hydratedRef.current ? "all 300ms" : "none" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}