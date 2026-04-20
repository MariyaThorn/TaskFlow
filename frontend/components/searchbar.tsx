"use client";

import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { getUser, getToken, saveAuth } from "@/lib/auth";

type NavbarProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  notificationCount?: number;
  onInvitationAccepted?: () => void;
};

import { getApiUrl } from "@/lib/utils";

export default function Navbar({
  title,
  subtitle,
  actions,
  searchTerm = "",
  onSearchChange,
  notificationCount = 0,
  onInvitationAccepted,
}: NavbarProps) {
  const [userInitials, setUserInitials] = useState("");
  const [avatarColor, setAvatarColor] = useState("from-purple-500 to-purple-600");
  const [profileImage, setProfileImage] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
      fetch(`${getApiUrl()}/auth/me`, {
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

    // fetch pending invitations for this user
    if (token) {
      fetch(`${getApiUrl()}/projects/my-invitations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.invitations) setNotifications(data.invitations);
        })
        .catch(() => {});
    }

    // Listen for real-time invitation events
    const onNewInvitation = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.some((n: { invitationId: string }) => n.invitationId === detail.invitationId)) return prev;
          return [...prev, detail];
        });
      }
    };
    const onInvitationAcceptedEvent = () => {
      // Refetch invitations to stay in sync
      const t = getToken();
      if (t) {
        fetch(`${getApiUrl()}/projects/my-invitations`, {
          headers: { Authorization: `Bearer ${t}` },
          credentials: 'include',
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.invitations) setNotifications(data.invitations);
          })
          .catch(() => {});
      }
      onInvitationAccepted?.();
    };
    const onInvitationDeclinedEvent = () => {
      const t = getToken();
      if (t) {
        fetch(`${getApiUrl()}/projects/my-invitations`, {
          headers: { Authorization: `Bearer ${t}` },
          credentials: 'include',
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.invitations) setNotifications(data.invitations);
          })
          .catch(() => {});
      }
    };

    window.addEventListener("taskflow:invitation", onNewInvitation);
    window.addEventListener("taskflow:invitation-accepted", onInvitationAcceptedEvent);
    window.addEventListener("taskflow:invitation-declined", onInvitationDeclinedEvent);

    return () => {
      window.removeEventListener("taskflow:invitation", onNewInvitation);
      window.removeEventListener("taskflow:invitation-accepted", onInvitationAcceptedEvent);
      window.removeEventListener("taskflow:invitation-declined", onInvitationDeclinedEvent);
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="flex h-16 items-center gap-3 border-b border-[#e0aaff]/30 bg-[#ede0ff] px-4 pl-14 sm:gap-6 sm:px-8 md:pl-8">
      {/* Page title */}
      {title && (
        <div className="shrink-0">
          <h1 className="text-base font-semibold text-[#3c096c] sm:text-lg">{title}</h1>
          {subtitle && <p className="-mt-0.5 text-xs text-[#5a189a]/60">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-1 items-center gap-3 justify-end sm:gap-4">
        <div className="relative hidden w-full max-w-xs sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a189a]/50" />
          <input
            type="text"
            placeholder="Search boards, cards..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-full border border-[#e0aaff]/50 bg-white/70 px-9 py-2 text-sm text-[#3c096c] outline-none ring-0 placeholder:text-[#5a189a]/40 focus:border-[#9d4edd] focus:bg-white focus:ring-2 focus:ring-[#9d4edd]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e0aaff]/50 bg-white/70 text-[#5a189a] hover:bg-white"
            >
              <Bell className="h-4 w-4" />
              {(notifications.length || notificationCount) > 0 && (
                <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 sm:w-80">
                <div className="p-3 border-b">Notifications</div>
                <div className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-600">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.invitationId} className="flex items-start justify-between gap-3 p-3 hover:bg-slate-50">
                        <div>
                          <div className="text-sm font-medium">{n.projectName}</div>
                          <div className="text-xs text-gray-500">Invitation to join as {n.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-md bg-green-600 px-3 py-1 text-sm text-white"
                            onClick={async () => {
                              const token = getToken();
                              if (!token) return;
                              try {
                                const res = await fetch(`${getApiUrl()}/projects/${n.projectId}/invitations/${n.invitationId}/accept`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${token}` },
                                  credentials: 'include',
                                });
                                if (res.ok) {
                                  setNotifications((prev) => prev.filter((x) => x.invitationId !== n.invitationId));
                                  onInvitationAccepted?.();
                                }
                              } catch (e) {}
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700"
                            onClick={async () => {
                              const token = getToken();
                              if (!token) return;
                              try {
                                const res = await fetch(`${getApiUrl()}/projects/${n.projectId}/invitations/${n.invitationId}/decline`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${token}` },
                                  credentials: 'include',
                                });
                                if (res.ok) {
                                  setNotifications((prev) => prev.filter((x) => x.invitationId !== n.invitationId));
                                }
                              } catch (e) {}
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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