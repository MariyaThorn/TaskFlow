"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Clock, ArrowLeft, UserPlus, LayoutGrid } from "lucide-react";
import Navbar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";

type Member = {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
  color: string;
};

type Board = {
  id: number;
  name: string;
  description: string;
  color: string;
  updatedAt: string;
};

const MOCK_MEMBERS: Member[] = [
  { id: 1, initials: "JD", name: "John Doe",    email: "john.doe@example.com",    role: "Admin",  color: "#534AB7" },
  { id: 2, initials: "SS", name: "Sarah Smith", email: "sarah.smith@example.com", role: "Member", color: "#1D9E75" },
  { id: 3, initials: "MC", name: "Mike Chen",   email: "mike.chen@example.com",   role: "Member", color: "#7F77DD" },
  { id: 4, initials: "EJ", name: "Emma Jones",  email: "emma.jones@example.com",  role: "Member", color: "#D4537E" },
];

const MOCK_BOARDS: Board[] = [
  { id: 1, name: "Sprint Planning",   description: "Plan and track current sprint tasks", color: "#3B5BDB", updatedAt: "Active 2 hours ago" },
  { id: 2, name: "Bug Tracker",       description: "Track and prioritize bugs",           color: "#C0392B", updatedAt: "Active 5 hours ago" },
  { id: 3, name: "Feature Requests",  description: "Manage incoming feature requests",    color: "#27AE60", updatedAt: "Active 1 day ago" },
];

const PROJECT_NAME = "Product Development";

export default function ProjectDetailPage() {
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>(MOCK_BOARDS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [searchTerm, setSearchTerm] = useState("");

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Member" | "Admin">("Member");

  // New board modal state
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [newBoardColor, setNewBoardColor] = useState("#3B5BDB");

  const BOARD_COLORS = [
    "#3B5BDB", "#C0392B", "#27AE60", "#E67E22",
    "#8E44AD", "#16A085", "#2C3E50", "#D35400",
  ];

  const filteredBoards = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return boards;
    return boards.filter((b) => b.name.toLowerCase().includes(term));
  }, [boards, searchTerm]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const initials = inviteEmail.slice(0, 2).toUpperCase();
    const colors = ["#E67E22", "#16A085", "#8E44AD", "#C0392B", "#2980B9"];
    const color = colors[members.length % colors.length];
    setMembers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        initials,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        color,
      },
    ]);
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    setBoards((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newBoardName.trim(),
        description: newBoardDesc.trim() || "No description",
        color: newBoardColor,
        updatedAt: "Just now",
      },
    ]);
    setNewBoardName("");
    setNewBoardDesc("");
    setNewBoardColor("#3B5BDB");
    setIsNewBoardOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userInitials="JD"
          notificationCount={2}
        />

        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Back link */}
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>

          {/* Project header card */}
          <div className="mb-8 rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{PROJECT_NAME}</h1>
                <p className="mt-0.5 text-sm text-slate-500">Project workspace</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 rounded-full px-4 text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>

            {/* Members row */}
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Project Members
              </p>
              <div className="flex items-center gap-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    title={`${m.name} (${m.role})`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </div>
                ))}
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Boards section */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Boards</h2>
            <Button
              onClick={() => setIsNewBoardOpen(true)}
              className="flex items-center gap-2 rounded-full px-5"
            >
              <Plus className="h-4 w-4" />
              New Board
            </Button>
          </div>

          {filteredBoards.length === 0 && (
            <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400">No boards yet. Create your first board!</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/dashboard/board/${board.id}`)}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Color header */}
                <div
                  className="h-28 w-full transition-opacity group-hover:opacity-90"
                  style={{ backgroundColor: board.color }}
                />
                <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-900">{board.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{board.description}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {board.updatedAt}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Invite Member Modal ── */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Invite Member to Project</h2>
                <p className="text-sm text-slate-500">Add new members to collaborate on this project</p>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="ml-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 ring-0 ring-primary/10 focus-within:border-primary focus-within:ring-2">
                  <span className="text-slate-400 text-sm">✉</span>
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Member", "Admin"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition ${
                        inviteRole === role
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        inviteRole === role ? "bg-primary/10" : "bg-slate-100"
                      }`}>
                        <span className="text-base">{role === "Member" ? "👤" : "👑"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{role}</p>
                        <p className="text-xs text-slate-500">
                          {role === "Member" ? "Can view and edit" : "Full access"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full rounded-xl py-2.5" onClick={handleInvite}>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </div>

            {/* Current Members */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Current Members ({members.length})
              </p>
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{m.name}</p>
                      <p className="text-xs text-slate-500 truncate">{m.email}</p>
                    </div>
                    {m.role === "Admin" && (
                      <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsInviteOpen(false)}
              className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── New Board Modal ── */}
      {isNewBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Create New Board</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Board Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Planning"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="What is this board for?"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Board Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewBoardColor(color)}
                      className={`h-8 w-8 rounded-lg transition ${
                        newBoardColor === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {/* Color preview */}
                <div
                  className="h-16 w-full rounded-lg mt-2 transition-colors"
                  style={{ backgroundColor: newBoardColor }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewBoardOpen(false)} className="px-4">
                Cancel
              </Button>
              <Button className="px-4" onClick={handleCreateBoard}>
                Create Board
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
