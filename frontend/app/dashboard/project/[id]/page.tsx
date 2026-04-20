"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, UserPlus, Clock, ArrowLeft, Trash2, Palette, Upload, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import CreateBoardModal from "@/components/migrated/CreateBoardModal";
import InviteMemberModal from "@/components/migrated/InviteMemberModal";
import UserAvatar from "@/components/migrated/UserAvatar";
import type { ProjectMember } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;
const BACKEND_URL = API_URL?.replace("/api", "") || "http://localhost:3000";

interface Board {
  id: string;
  name: string;
  description: string;
  lastActivity: string;
  color: string;
  backgroundImage?: string;
}

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [projectName, setProjectName] = useState("");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [projectColor, setProjectColor] = useState("from-purple-500 to-purple-600");
  const [projectBackgroundImage, setProjectBackgroundImage] = useState<string | undefined>();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorOptions = [
    "from-purple-500 to-purple-600",
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-pink-500 to-pink-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
    "from-red-500 to-red-600",
    "from-indigo-500 to-indigo-600",
    "from-cyan-500 to-cyan-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-emerald-500 to-emerald-600",
  ];

  const headers = useCallback((): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fallbackColors = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
  ];

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: headers(),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      const p = data.project;
      setProjectName(p.name);
      if (p.color) setProjectColor(p.color);
      if (p.backgroundImage) setProjectBackgroundImage(`${BACKEND_URL}${p.backgroundImage}`);

      const members: ProjectMember[] = p.members.map(
        (m: { user: { _id: string; firstName: string; lastName: string; email: string; avatarColor?: string; profileImage?: string }; role: string }, i: number) => ({
          id: m.user._id,
          name: `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.email,
          email: m.user.email,
          avatar: `${(m.user.firstName?.[0] || "").toUpperCase()}${(m.user.lastName?.[0] || "").toUpperCase()}` || m.user.email.substring(0, 2).toUpperCase(),
          color: m.user.avatarColor || fallbackColors[i % fallbackColors.length],
          role: m.role === "owner" ? "admin" : m.role as "admin" | "member",
          status: "active" as const,
        })
      );

      // Add pending invitations as members
      if (p.invitations) {
        p.invitations
          .filter((inv: { status: string }) => inv.status === "pending")
          .forEach((inv: { email: string; role: string }, i: number) => {
            members.push({
              id: `inv-${i}`,
              name: inv.email.split("@")[0],
              email: inv.email,
              avatar: inv.email.substring(0, 2).toUpperCase(),
              color: fallbackColors[(members.length + i) % fallbackColors.length],
              role: inv.role as "admin" | "member",
              status: "pending",
            });
          });
      }

      setProjectMembers(members);
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/boards/project/${projectId}`, {
        headers: headers(),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setBoards(
        data.boards.map((b: { _id: string; name: string; description: string; color: string; backgroundImage?: string; updatedAt: string }) => ({
          id: b._id,
          name: b.name,
          description: b.description || "",
          color: b.color,
          backgroundImage: b.backgroundImage || undefined,
          lastActivity: new Date(b.updatedAt).toLocaleDateString(),
        }))
      );
    } catch {
      // ignore
    }
  }, [projectId, headers]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const filteredBoards = boards;

  const handleCreateBoard = async (newBoard: { name: string; description: string; color: string; backgroundImage?: string }) => {
    try {
      const res = await fetch(`${API_URL}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ ...newBoard, projectId }),
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.message || "Failed to create board");
        return;
      }
      fetchBoards();
    } catch {
      window.alert("Failed to create board");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.message || "Failed to delete project");
        return;
      }
      router.push("/dashboard");
    } catch {
      window.alert("Failed to delete project");
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      const res = await fetch(`${API_URL}/boards/${boardId}`, {
        method: "DELETE",
        headers: headers(),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.message || "Failed to delete board");
        return;
      }
      setDeletingBoardId(null);
      fetchBoards();
    } catch {
      window.alert("Failed to delete board");
    }
  };

  const handleInviteMember = async (newMember: { email: string; role: "admin" | "member" }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/projects/${projectId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ emailOrUsername: newMember.email, role: newMember.role }),
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.message || "Failed to invite");
        return;
      }
      fetchProject();
    } catch {
      window.alert("Failed to invite member");
    }
  };

  const handleChangeColor = async (newColor: string) => {
    setProjectColor(newColor);
    setProjectBackgroundImage(undefined);
    setShowColorPicker(false);
    try {
      await fetch(`${API_URL}/projects/${projectId}/appearance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ color: newColor, backgroundImage: "" }),
      });
    } catch {
      // ignore
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("background", file);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/background`, {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: formData,
      });
      if (!res.ok) return;
      const data = await res.json();
      setProjectBackgroundImage(`${BACKEND_URL}${data.backgroundImage}`);
      setShowColorPicker(false);
    } catch {
      // ignore
    }
  };

  const handleRemoveCover = async () => {
    setProjectBackgroundImage(undefined);
    setShowColorPicker(false);
    try {
      await fetch(`${API_URL}/projects/${projectId}/appearance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers() },
        credentials: "include",
        body: JSON.stringify({ backgroundImage: "" }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f0ff]">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col">
        {/* Project header bar */}
        <header className="relative z-20 border-b border-[#e0aaff]/30">
          {/* Colored background band */}
          {projectBackgroundImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={projectBackgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${projectColor} opacity-15`} />
          )}
          <div className="relative flex min-h-[4rem] flex-wrap items-center justify-between gap-3 bg-[#ede0ff]/80 px-4 py-2 backdrop-blur-sm sm:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className={`hidden h-8 w-2 rounded-full bg-gradient-to-b sm:block ${projectColor}`} />
            <div>
              <h1 className="text-base font-bold text-gray-900 sm:text-lg">{projectName}</h1>
              <p className="text-xs text-gray-500">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/50 hover:text-[#5a189a]"
                title="Change project color"
              >
                <Palette className="h-4 w-4" />
              </button>
              {showColorPicker && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5">
                  <p className="mb-2 text-xs font-medium text-gray-500">Project Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleChangeColor(c)}
                        className={`h-8 w-8 rounded-full bg-gradient-to-br ${c} ring-2 transition-transform hover:scale-110 ${c === projectColor && !projectBackgroundImage ? "ring-[#5a189a] ring-offset-2" : "ring-transparent"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-[#f8f0ff] hover:text-[#5a189a]">
                      <Upload className="h-3.5 w-3.5" />
                      Upload cover image
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadCover} />
                    </label>
                    {projectBackgroundImage && (
                      <button
                        onClick={handleRemoveCover}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove cover image
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setConfirmDeleteProject(true)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Active members */}
            <div className="flex items-center">
              {projectMembers
                .filter((m) => m.status === "active")
                .slice(0, 5)
                .map((member, i) => (
                  <UserAvatar
                    key={member.id}
                    name={`${member.name} (active)`}
                    avatar={member.avatar}
                    color={member.color}
                    isActive
                    showStatus
                    className={i > 0 ? "-ml-2" : ""}
                  />
                ))}
              {/* Pending members */}
              {projectMembers
                .filter((m) => m.status === "pending")
                .map((member, i) => (
                  <UserAvatar
                    key={member.id}
                    name={`${member.name} (pending)`}
                    avatar={member.avatar}
                    color="from-gray-400 to-gray-500"
                    isActive={false}
                    showStatus
                    className={projectMembers.filter((m) => m.status === "active").length > 0 || i > 0 ? "-ml-2" : ""}
                  />
                ))}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex h-8 w-8 -ml-1 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#5a189a] hover:text-[#5a189a]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f8f0ff]"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Boards</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#5a189a] px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c]"
            >
              <Plus className="h-5 w-5" />
              New Board
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBoards.map((board) => (
              <div
                key={board.id}
                className="group relative h-full overflow-hidden rounded-2xl bg-white text-left shadow-md transition-all hover:shadow-xl"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setDeletingBoardId(board.id); }}
                  className="absolute right-2 top-2 z-10 hidden rounded-lg bg-white/90 p-1.5 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 group-hover:block"
                  title="Delete board"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/dashboard/board/${board.id}`)}
                  className="h-full w-full text-left"
                >
                <div className="relative h-28 overflow-hidden">
                  {board.backgroundImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={board.backgroundImage} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white drop-shadow-md">{board.name}</h3>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`h-full w-full bg-gradient-to-br ${board.color}`} />
                      <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white drop-shadow-md">{board.name}</h3>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4">
                  {board.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{board.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Active {board.lastActivity}</span>
                  </div>
                </div>
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateBoard} />
      )}

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
          currentMembers={projectMembers}
          projectId={projectId}
        />
      )}

      {/* Delete Project Confirmation */}
      {confirmDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteProject(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Project</h3>
            <p className="mb-4 text-sm text-gray-600">
              This will permanently delete <strong>{projectName}</strong> and all its boards. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteProject(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDeleteProject} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Board Confirmation */}
      {deletingBoardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingBoardId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Delete Board</h3>
            <p className="mb-4 text-sm text-gray-600">
              This will permanently delete this board and all its cards. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingBoardId(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDeleteBoard(deletingBoardId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
