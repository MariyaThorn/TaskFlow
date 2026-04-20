"use client";

import { useEffect, useState, useCallback } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { getToken, getUser } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { getApiUrl } from "@/lib/utils";

interface InvitationToast {
  id: string;
  invitationId: string;
  projectId: string;
  projectName: string;
  role: string;
  invitedBy: { firstName: string; lastName: string };
  status: "pending" | "accepted" | "declined" | "dismissed";
}

export default function NotificationProvider() {
  const [toasts, setToasts] = useState<InvitationToast[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user?.id) return;

    const socket = getSocket();
    socket.emit("register-user", user.id);

    const onInvitation = (data: {
      invitationId: string;
      projectId: string;
      projectName: string;
      role: string;
      invitedBy: { firstName: string; lastName: string };
    }) => {
      const toast: InvitationToast = {
        id: `${data.invitationId}-${Date.now()}`,
        ...data,
        status: "pending",
      };
      setToasts((prev) => [...prev, toast]);

      // Dispatch a custom event so the Navbar bell can update
      window.dispatchEvent(
        new CustomEvent("taskflow:invitation", { detail: data })
      );
    };

    socket.on("invitation:received", onInvitation);

    return () => {
      socket.off("invitation:received", onInvitation);
    };
  }, []);

  const handleAccept = useCallback(async (toast: InvitationToast) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${getApiUrl()}/projects/${toast.projectId}/invitations/${toast.invitationId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      if (res.ok) {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === toast.id ? { ...t, status: "accepted" as const } : t
          )
        );
        window.dispatchEvent(new CustomEvent("taskflow:invitation-accepted"));
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 2000);
      }
    } catch {
      // silent
    }
  }, []);

  const handleDecline = useCallback(async (toast: InvitationToast) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${getApiUrl()}/projects/${toast.projectId}/invitations/${toast.invitationId}/decline`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      if (res.ok) {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === toast.id ? { ...t, status: "declined" as const } : t
          )
        );
        window.dispatchEvent(new CustomEvent("taskflow:invitation-declined"));
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 2000);
      }
    } catch {
      // silent
    }
  }, []);

  const handleDismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-3" style={{ maxWidth: 380 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-slide-in relative overflow-hidden rounded-xl border border-[#e0aaff]/40 bg-white shadow-2xl"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#5a189a] to-[#9d4edd]" />

          {/* Close button */}
          <button
            onClick={() => handleDismiss(toast.id)}
            className="absolute right-2 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="p-4 pr-8">
            {/* Header */}
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5a189a] to-[#9d4edd]">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3c096c]">Project Invitation</p>
                <p className="text-xs text-[#5a189a]/60">
                  from {toast.invitedBy.firstName} {toast.invitedBy.lastName}
                </p>
              </div>
            </div>

            {/* Body */}
            <p className="mb-3 text-sm text-gray-700">
              You&apos;ve been invited to join{" "}
              <span className="font-semibold text-[#3c096c]">{toast.projectName}</span>{" "}
              as a <span className="font-medium text-[#5a189a]">{toast.role}</span>.
            </p>

            {/* Actions */}
            {toast.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(toast)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#5a189a] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#7b2cbf]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(toast)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Decline
                </button>
              </div>
            )}

            {toast.status === "accepted" && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <Check className="h-4 w-4" />
                Invitation accepted!
              </div>
            )}

            {toast.status === "declined" && (
              <p className="text-sm font-medium text-gray-500">Invitation declined</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
