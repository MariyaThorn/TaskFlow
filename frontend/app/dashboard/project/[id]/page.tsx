"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, UserPlus, Clock, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateBoardModal from "@/components/migrated/CreateBoardModal";
import InviteMemberModal from "@/components/migrated/InviteMemberModal";
import type { ProjectMember } from "@/components/migrated/types";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredBoards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.description.toLowerCase().includes(query),
    );
  }, [boards, searchTerm]);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={0} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 rounded-2xl bg-white px-6 py-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{projectName}</h1>
                  <p className="text-xs text-gray-500">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Active members */}
                <div className="flex items-center gap-1">
                  {projectMembers
                    .filter((m) => m.status === "active")
                    .map((member, i) => (
                      <div
                        key={member.id}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-xs font-semibold text-white ring-2 ring-white transition-transform hover:scale-110 ${i > 0 ? "-ml-2" : ""}`}
                        title={`${member.name} (active)`}
                      >
                        {member.avatar}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                      </div>
                    ))}
                  {/* Idle / pending members */}
                  {projectMembers
                    .filter((m) => m.status === "pending")
                    .map((member, i) => (
                      <div
                        key={member.id}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white ring-2 ring-white transition-transform hover:scale-110 ${projectMembers.filter((m) => m.status === "active").length > 0 || i > 0 ? "-ml-2" : ""}`}
                        title={`${member.name} (pending)`}
                      >
                        {member.avatar}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-400" />
                      </div>
                    ))}
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex h-8 w-8 -ml-1 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#4F46E5] hover:text-[#4F46E5]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Boards</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]"
            >
              <Plus className="h-5 w-5" />
              New Board
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/dashboard/board/${board.id}`)}
                className="group h-full overflow-hidden rounded-2xl bg-white text-left shadow-md transition-all hover:shadow-xl"
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
        />
      )}
    </div>
  );
}
