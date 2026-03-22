"use client";

import { Search, Bell } from "lucide-react";

type NavbarProps = {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  userInitials?: string;
  notificationCount?: number;
};

export default function Navbar({
  searchTerm = "",
  onSearchChange,
  userInitials = "JD",
  notificationCount = 0,
}: NavbarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex flex-1 items-center gap-4">
        {/* Search input */}
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search boards, cards..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-9 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}