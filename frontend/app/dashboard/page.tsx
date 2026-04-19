"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, LayoutGrid, Clock } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateProjectModal from "@/components/migrated/CreateProjectModal";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;
const BACKEND_URL = API_URL?.replace("/api", "") || "http://localhost:3000";

interface Project {
  id: string;
  name: string;
  memberCount: number;
  updatedAt: string;
  teamName?: string;
  color?: string;
  backgroundImage?: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setProjects(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.projects.map((p: any) => ({
          id: p._id,
          name: p.name,
          memberCount: Array.isArray(p.members) ? p.members.length : 0,
          updatedAt: p.updatedAt,
          teamName: p.team?.name || undefined,
          color: p.color || "from-purple-500 to-purple-600",
          backgroundImage: p.backgroundImage ? `${BACKEND_URL}${p.backgroundImage}` : undefined,
        }))
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const filteredProjects = projects.filter((project) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return project.name.toLowerCase().includes(query);
  });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex min-h-screen bg-[#f8f0ff]">
      <Sidebar activeItem="Projects" />
      <div className="flex flex-1 flex-col">
        <Navbar
          title="Projects"
          subtitle="All projects you're a member of"
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#5a189a] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3c096c]"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          }
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          notificationCount={0}
          onInvitationAccepted={fetchProjects}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/project/${project.id}`} className="group">
                <div className="h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                  <div className="relative h-32 bg-gray-200">
                    {project.backgroundImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.backgroundImage} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                      </>
                    ) : (
                      <>
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${project.color || "from-purple-500 to-purple-600"}`}>
                          <LayoutGrid className="h-12 w-12 text-white opacity-50" />
                        </div>
                        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                      </>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#5a189a]">
                      {project.name}
                    </h3>

                    <div className="space-y-3">
                      {project.teamName && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#5a189a]/10 px-2.5 py-0.5 text-xs font-medium text-[#5a189a]">
                            <Users className="h-3 w-3" />
                            from {project.teamName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{project.memberCount} {project.memberCount === 1 ? "member" : "members"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Updated {timeAgo(project.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreate={handleProjectCreated} />
      )}
    </div>
  );
}
