"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import Navbar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";

type Project = {
  id: number;
  name: string;
  team: string;
  boards: number;
  updated: string;
};

const INITIAL_PROJECTS: Project[] = [];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTeam, setNewProjectTeam] = useState("");

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (p) => p.name.toLowerCase().includes(term) || p.team.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

    setProjects((prev) => [
      {
        id: nextId,
        name: newProjectName.trim(),
        team: newProjectTeam || "Unassigned",
        boards: 0,
        updated: "Just now",
      },
      ...prev,
    ]);
    setIsCreateOpen(false);
    setNewProjectName("");
    setNewProjectTeam("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeItem="Projects" />

      <div className="flex flex-1 flex-col">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userInitials="JD"
          notificationCount={0}
        />

        {/* Page header */}
        <div className="flex items-start justify-between py-5 px-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500 mb-7">All projects you&apos;re a member of</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-full px-5"
          >
            <Plus className="h-4 w-4" />
            Create New Project
          </Button>
        </div>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="flex flex-1 items-center justify-center px-8">
            <p className="text-center text-sm text-slate-500">
              Click &quot;Create New Project&quot; button to start your task!
            </p>
          </div>
        )}

        {/* Projects grid */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-32 w-full bg-slate-200/80" />

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
                  <h2 className="text-sm font-semibold text-slate-900">{project.name}</h2>
                  <p className="text-xs text-slate-500">{project.team}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{project.boards} boards</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.updated}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Create Project</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="project-name">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  placeholder="e.g. Product Development"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 ring-primary/10 focus:border-primary focus:ring-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="team">
                  Team
                </label>
                <select
                  id="team"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-0 ring-primary/10 focus:border-primary focus:ring-2"
                  value={newProjectTeam}
                  onChange={(e) => setNewProjectTeam(e.target.value)}
                >
                  <option value="" disabled>Select a team</option>
                  <option value="engineering">Engineering</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="px-4">
                Cancel
              </Button>
              <Button className="px-4" onClick={handleCreateProject}>
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}