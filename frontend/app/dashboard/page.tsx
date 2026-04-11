"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, LayoutGrid, Clock } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateProjectModal from "@/components/migrated/CreateProjectModal";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Project {
  id: string;
  name: string;
  memberCount: number;
  updatedAt: string;
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
        data.projects.map((p: Record<string, unknown>) => ({
          id: p._id,
          name: p.name,
          memberCount: Array.isArray(p.members) ? p.members.length : 0,
          updatedAt: p.updatedAt,
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Projects" />
      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={0} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600">All projects you&apos;re a member of</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]"
            >
              <Plus className="h-5 w-5" />
              Create New Project
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/project/${project.id}`} className="group">
                <div className="h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl">
                  <div className="relative h-32 bg-gray-200">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
                      <LayoutGrid className="h-12 w-12 text-white opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#4F46E5]">
                      {project.name}
                    </h3>

                    <div className="space-y-3">
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
