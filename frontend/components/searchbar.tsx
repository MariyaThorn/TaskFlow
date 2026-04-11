"use client";

import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { getUser, getToken, saveAuth } from "@/lib/auth";

type NavbarProps = {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  notificationCount?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function Navbar({
  searchTerm = "",
  onSearchChange,
  notificationCount = 0,
}: NavbarProps) {
  const [userInitials, setUserInitials] = useState("");
  const [avatarColor, setAvatarColor] = useState("from-purple-500 to-purple-600");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) {
      const fi = (user.firstName?.[0] || "").toUpperCase();
      const li = (user.lastName?.[0] || "").toUpperCase();
      setUserInitials(fi + li || user.email.substring(0, 2).toUpperCase());
      if (user.avatarColor) setAvatarColor(user.avatarColor);
      if (user.profileImage) setProfileImage(user.profileImage);
    }

    // Refresh user data from server to pick up backfilled avatarColor
    const token = getToken();
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.user) {
            saveAuth({ token, user: data.user });
            const fi = (data.user.firstName?.[0] || "").toUpperCase();
            const li = (data.user.lastName?.[0] || "").toUpperCase();
            setUserInitials(fi + li || data.user.email.substring(0, 2).toUpperCase());
            if (data.user.avatarColor) setAvatarColor(data.user.avatarColor);
            if (data.user.profileImage) setProfileImage(data.user.profileImage);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex flex-1 items-center gap-4">
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

          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileImage}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-xs font-semibold text-white`}>
              {userInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}