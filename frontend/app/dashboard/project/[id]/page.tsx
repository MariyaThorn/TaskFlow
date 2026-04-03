"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, Clock, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateBoardModal from "@/components/migrated/CreateBoardModal";
import InviteMemberModal from "@/components/migrated/InviteMemberModal";
import type { ProjectMember } from "@/components/migrated/types";

interface Board {
  id: string;
  name: string;
  description: string;
  lastActivity: string;
  color: string;
}

const initialProjectMembers: ProjectMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "JD",
    color: "from-blue-500 to-blue-600",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    avatar: "SS",
    color: "from-green-500 to-green-600",
    role: "member",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar: "MC",
    color: "from-purple-500 to-purple-600",
    role: "member",
    status: "active",
  },
];

const initialBoards: Board[] = [
  {
    id: "1",
    name: "Sprint Planning",
    description: "Plan and track current sprint tasks",
    lastActivity: "2 hours ago",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "2",
    name: "Bug Tracker",
    description: "Track and prioritize bugs",
    lastActivity: "5 hours ago",
    color: "from-red-500 to-red-600",
  },
  {
    id: "3",
    name: "Feature Requests",
    description: "Manage incoming feature requests",
    lastActivity: "1 day ago",
    color: "from-green-500 to-green-600",
  },
];

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const [boards, setBoards] = useState(initialBoards);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState(initialProjectMembers);
  const [searchTerm, setSearchTerm] = useState("");

  const projectName = "Product Development";

  const filteredBoards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.description.toLowerCase().includes(query),
    );
  }, [boards, searchTerm]);

  const handleCreateBoard = (newBoard: { name: string; description: string; color: string }) => {
    const board: Board = {
      id: Date.now().toString(),
      ...newBoard,
      lastActivity: "Just now",
    };
    setBoards((prev) => [...prev, board]);
  };

  const handleInviteMember = (newMember: { email: string; role: "admin" | "member" }) => {
    const memberColors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-orange-500 to-orange-600",
      "from-teal-500 to-teal-600",
    ];

    const member: ProjectMember = {
      id: Date.now().toString(),
      name: newMember.email.split("@")[0],
      email: newMember.email,
      avatar: newMember.email.substring(0, 2).toUpperCase(),
      color: memberColors[projectMembers.length % memberColors.length],
      role: newMember.role,
      status: "pending",
    };

    setProjectMembers((prev) => [...prev, member]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={2} />

        <main className="flex-1 overflow-y-auto p-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{projectName}</h1>
                <p className="text-gray-600">Project workspace</p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <UserPlus className="h-5 w-5" />
                Invite Member
              </button>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">Project Members</h3>
              <div className="flex items-center gap-2">
                {projectMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-sm font-semibold text-white shadow-md transition-transform hover:scale-110`}
                    title={member.name}
                  >
                    {member.avatar}
                  </div>
                ))}
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#4F46E5] hover:text-[#4F46E5]"
                >
                  <Plus className="h-5 w-5" />
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
                <div className={`relative h-24 bg-gradient-to-br ${board.color}`}>
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                </div>

                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#4F46E5]">
                    {board.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{board.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
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
