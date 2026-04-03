"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Mail, Crown, UserMinus, LayoutGrid, Clock, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar: string;
  status: "active" | "pending";
  color: string;
}

interface TeamProject {
  id: string;
  name: string;
  boardCount: number;
  lastUpdated: string;
  color: string;
}

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    avatar: "JD",
    status: "active",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    role: "member",
    avatar: "SS",
    status: "active",
    color: "from-purple-500 to-purple-600",
  },
];

const teamProjects: TeamProject[] = [
  {
    id: "1",
    name: "Product Development",
    boardCount: 5,
    lastUpdated: "2 hours ago",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "2",
    name: "Design System",
    boardCount: 4,
    lastUpdated: "1 day ago",
    color: "from-purple-500 to-purple-600",
  },
];

export default function TeamDetailPage() {
  const [activeTab, setActiveTab] = useState<"members" | "projects">("members");
  const [members, setMembers] = useState(initialMembers);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const teamName = "Engineering Team";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "member",
      avatar: inviteEmail.substring(0, 2).toUpperCase(),
      status: "pending",
      color: "from-gray-500 to-gray-600",
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setShowInviteForm(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleChangeRole = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, role: member.role === "admin" ? "member" : "admin" }
          : member,
      ),
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Teams" />
      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={2} />

        <main className="flex-1 overflow-y-auto p-8">
          <Link href="/dashboard/teams" className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Teams</span>
          </Link>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{teamName}</h1>
            <p className="text-gray-600">Manage your team members and projects</p>
          </div>

          <div className="mb-8 border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab("members")}
                className={`border-b-2 px-1 pb-4 font-medium transition-colors ${
                  activeTab === "members"
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`border-b-2 px-1 pb-4 font-medium transition-colors ${
                  activeTab === "projects"
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Projects
              </button>
            </nav>
          </div>

          {activeTab === "members" && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm text-gray-600">Total Members</p>
                      <p className="text-3xl font-bold text-gray-900">{members.filter((m) => m.status === "active").length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <Crown className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm text-gray-600">Pending Invites</p>
                      <p className="text-3xl font-bold text-gray-900">{members.filter((m) => m.status === "pending").length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <Mail className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm text-gray-600">Admins</p>
                      <p className="text-3xl font-bold text-gray-900">{members.filter((m) => m.role === "admin").length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                      <Crown className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Invite Team Members</h2>
                </div>

                {showInviteForm ? (
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        required
                        autoFocus
                      />
                      <button type="submit" className="rounded-xl bg-[#4F46E5] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]">
                        Send Invite
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteEmail("");
                        }}
                        className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <Plus className="h-5 w-5" />
                    Invite new member
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Members</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <div key={member.id} className="p-6 transition-colors hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${member.color} font-semibold text-white`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{member.name}</h3>
                              {member.role === "admin" && (
                                <span className="rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Admin</span>
                              )}
                              {member.status === "pending" && (
                                <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">Pending</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {member.id !== "1" && (
                            <>
                              <button
                                onClick={() => handleChangeRole(member.id)}
                                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                              >
                                {member.role === "admin" ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="rounded-xl p-2 text-red-600 transition-colors hover:bg-red-50"
                              >
                                <UserMinus className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <>
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Team Projects</h2>
                  <button className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]">
                    <Plus className="h-5 w-5" />
                    New Project
                  </button>
                </div>
                <p className="text-sm text-gray-600">Projects that belong to this team</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teamProjects.map((project) => (
                  <div key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                    <div className={`h-24 bg-gradient-to-br ${project.color}`} />
                    <div className="p-6">
                      <h3 className="mb-4 text-xl font-semibold text-gray-900">{project.name}</h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <LayoutGrid className="h-4 w-4" />
                          <span>
                            {project.boardCount} {project.boardCount === 1 ? "board" : "boards"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Updated {project.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
