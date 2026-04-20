"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { ArrowLeft, ImageIcon, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";
import UserAvatar from "@/components/migrated/UserAvatar";
import { getApiUrl, getBackendUrl } from "@/lib/utils";

const PRESET_BACKGROUNDS = [
  "/back-ground-theme/1.png",
  "/back-ground-theme/2.png",
  "/back-ground-theme/3.png",
  "/back-ground-theme/Galaxy12.jpg",
];

interface BoardHeaderProps {
  projectName: string;
  boardName: string;
  projectId: string;
  boardId: string;
  projectMembers: TeamMember[];
  currentUserId: string | null;
  activeUserIds?: string[];
  cursorUserIds?: string[];
  backgroundImage?: string;
  onBackgroundChange?: (url: string) => void;
}

export default function BoardHeader({ projectName, boardName, projectId, boardId, projectMembers, currentUserId, activeUserIds = [], cursorUserIds = [], backgroundImage, onBackgroundChange }: BoardHeaderProps) {
  const router = useRouter();
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track join/leave animations for status dots
  const prevActiveIdsRef = useRef<string[]>([]);
  const initializedRef = useRef(false);
  const [animatingIds, setAnimatingIds] = useState<Map<string, "pop-in" | "pop-out">>(new Map());

  useLayoutEffect(() => {
    const prev = prevActiveIdsRef.current;

    if (!initializedRef.current) {
      // On first presence data, just record the state — no animation
      initializedRef.current = true;
      prevActiveIdsRef.current = [...activeUserIds];
      return;
    }

    const joined = activeUserIds.filter(id => !prev.includes(id) && id !== currentUserId);
    const left   = prev.filter(id => !activeUserIds.includes(id) && id !== currentUserId);
    prevActiveIdsRef.current = [...activeUserIds];

    if (joined.length === 0 && left.length === 0) return;

    setAnimatingIds(cur => {
      const next = new Map(cur);
      joined.forEach(id => next.set(id, "pop-in"));
      left.forEach(id => next.set(id, "pop-out"));
      return next;
    });

    const ids = [...joined, ...left];
    const timer = setTimeout(() => {
      setAnimatingIds(cur => {
        const next = new Map(cur);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserIds, currentUserId]);

  const saveBg = async (url: string) => {
    onBackgroundChange?.(url);
    // Store relative path in DB (strip BACKEND_URL prefix if present)
    const dbUrl = url.startsWith(getBackendUrl()) ? url.slice(getBackendUrl().length) : url;
    try {
      const token = getToken();
      await fetch(`${getApiUrl()}/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ backgroundImage: dbUrl }),
      });
    } catch {
      // silent
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = getToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${getApiUrl()}/boards/${boardId}/background`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        saveBg(data.url.startsWith("/uploads/") ? `${getBackendUrl()}${data.url}` : data.url);
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <header className="shrink-0 flex min-h-[4rem] flex-wrap items-center justify-between gap-3 border-b border-[#e0aaff]/30 bg-[#ede0ff] px-4 py-2 sm:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => router.push(projectId ? `/dashboard/project/${projectId}` : "/dashboard")}
          className="rounded-lg p-1.5 transition-colors hover:bg-[#5a189a]/10"
        >
          <ArrowLeft className="h-5 w-5 text-[#5a189a]" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[#3c096c] sm:text-lg">{projectName ? `${projectName} - ${boardName}` : boardName}</h1>
          <p className="text-xs text-[#5a189a]/60">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Background picker toggle */}
        <div className="relative">
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            className="flex items-center gap-1.5 rounded-lg border border-[#e0aaff]/50 bg-white/70 px-2 py-1.5 text-sm font-medium text-[#5a189a] transition-colors hover:bg-white sm:px-3"
            title="Change background"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Background</span>
          </button>

          {showBgPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBgPicker(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#e0aaff]/40 bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#3c096c]">Board Background</h3>
                  <button onClick={() => setShowBgPicker(false)} className="rounded p-0.5 hover:bg-gray-100">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Preset images */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {PRESET_BACKGROUNDS.map((url) => (
                    <button
                      key={url}
                      onClick={() => { saveBg(url); setShowBgPicker(false); }}
                      className={`relative h-16 overflow-hidden rounded-lg border-2 transition-all hover:scale-[1.03] ${backgroundImage === url ? "border-[#5a189a] ring-2 ring-[#5a189a]/30" : "border-transparent hover:border-[#e0aaff]"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Upload custom */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e0aaff]/50 bg-[#f8f0ff] px-3 py-2.5 text-sm font-medium text-[#5a189a] transition-colors hover:border-[#9d4edd] hover:bg-[#ede0ff] disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload image"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />

                {/* Remove background */}
                {backgroundImage && (
                  <button
                    onClick={() => { saveBg(""); setShowBgPicker(false); }}
                    className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    Remove background
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Active members */}
        <div className="hidden items-center sm:flex">
          {projectMembers.slice(0, 6).map((member, i) => {
            const isActive = activeUserIds.includes(member.id);
            const anim = animatingIds.get(member.id);
            // Only show members who are active or animating out
            if (!isActive && anim !== "pop-out") return null;
            return (
              <UserAvatar
                key={member.id}
                name={`${member.name}${member.id === currentUserId ? " (you)" : ""}`}
                avatar={member.avatar}
                color={member.color}
                isActive={isActive}
                statusAnimation={anim}
                showStatus
                className={i > 0 ? "-ml-2" : ""}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
}
