"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, ArrowRight, Plus } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateTeamModal from "@/components/migrated/CreateTeamModal";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
  role: "owner" | "admin" | "member";
}

export default function TeamsListPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/teams`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      const userId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("taskflow_user") || "{}").id : null;
      setTeams(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.teams.map((t: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const myMembership = t.members.find((m: any) => m.user?._id === userId);
          return {
            id: t._id,
            name: t.name,
            description: t.description || "",
            memberCount: t.members.length,
            projectCount: t.projects?.length || 0,
            role: (myMembership?.role || "member") as "owner" | "admin" | "member",
          };
        })
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (newTeam: { name: string; description: string; image: string }) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ name: newTeam.name, description: newTeam.description }),
      });
      if (!res.ok) {
        const data = await res.json();
        window.alert(data.message || "Failed to create team");
        return;
      }
      fetchTeams();
    } catch {
      window.alert("Failed to create team");
    }
  };

  const filteredTeams = teams;

  const getRoleBadge = (role: Team["role"]) => {
    if (role === "owner") {
      return <span className="rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Owner</span>;
    }
    if (role === "admin") {
      return <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Admin</span>;
    }
    return <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Member</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#f8f0ff]">
      <Sidebar activeItem="Teams" />
      <div className="flex flex-1 flex-col">
        <Navbar
          title="Your Teams"
          subtitle="Select a team to manage members and projects"
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#5a189a] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3c096c]"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </button>
          }
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {filteredTeams.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-md">
              <Users className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-semibold text-gray-900">No teams yet</h3>
              <p className="text-sm text-gray-500">Create a team to collaborate with others</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/dashboard/teams/${team.id}`} className="group">
                <div className="h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                  <div className="relative h-32 bg-gray-200">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5a189a] to-[#9d4edd]">
                      <Users className="h-12 w-12 text-white opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#5a189a]">{team.name}</h3>
                      {getRoleBadge(team.role)}
                    </div>

                    {team.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">{team.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{team.memberCount} {team.memberCount === 1 ? "member" : "members"}</span>
                        </div>
                        <span>{team.projectCount} {team.projectCount === 1 ? "project" : "projects"}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#5a189a]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateTeam} />}
    </div>
  );
}