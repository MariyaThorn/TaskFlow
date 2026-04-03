"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users, LayoutGrid, Clock } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import CreateProjectModal from "@/components/migrated/CreateProjectModal";

interface Project {
  id: string;
  name: string;
  teamName: string;
  boardCount: number;
  lastUpdated: string;
  image?: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Product Development",
    teamName: "Engineering",
    boardCount: 5,
    lastUpdated: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1672385277648-85eddc237a2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc3Mjk0NTg3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    name: "Marketing Campaign Q1",
    teamName: "Marketing",
    boardCount: 3,
    lastUpdated: "5 hours ago",
    image:
      "https://images.unsplash.com/photo-1542744174-a35e40ade835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBjYW1wYWlnbiUyMGNyZWF0aXZlfGVufDF8fHx8MTc3Mjk2MjgyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    name: "Design System",
    teamName: "Design",
    boardCount: 4,
    lastUpdated: "1 day ago",
    image:
      "https://images.unsplash.com/photo-1772272935464-2e90d8218987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBzeXN0ZW0lMjB1aXxlbnwxfHx8fDE3NzI5Njk4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateProject = (newProject: { name: string; teamName: string; image: string }) => {
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      teamName: newProject.teamName,
      image: newProject.image,
      boardCount: 0,
      lastUpdated: "Just now",
    };
    setProjects((prev) => [...prev, project]);
  };

  const filteredProjects = projects.filter((project) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return project.name.toLowerCase().includes(query) || project.teamName.toLowerCase().includes(query);
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Projects" />
      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={2} />

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
                    {project.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
                        <LayoutGrid className="h-12 w-12 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-[#4F46E5]">
                      {project.name}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{project.teamName}</span>
                      </div>

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
              </Link>
            ))}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateProject} />
      )}
    </div>
  );
}
