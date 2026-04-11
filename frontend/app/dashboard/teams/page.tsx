"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, Plus } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateTeamModal from "@/components/migrated/CreateTeamModal";

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
  image?: string;
  role: "owner" | "admin" | "member";
}

const initialTeams: Team[] = [];

export default function TeamsListPage() {
  const [teams, setTeams] = useState(initialTeams);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateTeam = (newTeam: { name: string; description: string; image: string }) => {
    const team: Team = {
      id: Date.now().toString(),
      ...newTeam,
      memberCount: 1,
      projectCount: 0,
      role: "owner",
    };
    setTeams((prev) => [...prev, team]);
  };

  const filteredTeams = teams.filter((team) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return team.name.toLowerCase().includes(query) || team.description.toLowerCase().includes(query);
  });

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Teams" />
      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={0} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Teams</h1>
              <p className="text-gray-600">Select a team to manage members and projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]"
            >
              <Plus className="h-5 w-5" />
              Create Team
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/dashboard/teams/${team.id}`} className="group">
                <div className="h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                  <div className="relative h-32 bg-gray-200">
                    {team.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={team.image} alt={team.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
                        <Users className="h-12 w-12 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#4F46E5]">{team.name}</h3>
                      {getRoleBadge(team.role)}
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{team.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{team.memberCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{team.projectCount} projects</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#4F46E5]" />
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
