"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@/components/migrated/types";

interface BoardHeaderProps {
  projectName: string;
  boardName: string;
  projectId: string;
  projectMembers: TeamMember[];
  currentUserId: string | null;
  activeUserIds?: string[];
}

export default function BoardHeader({ projectName, boardName, projectId, projectMembers, currentUserId, activeUserIds = [] }: BoardHeaderProps) {
  const router = useRouter();

  return (
    <header className="shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(projectId ? `/dashboard/project/${projectId}` : "/dashboard")}
          className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{projectName ? `${projectName} - ${boardName}` : boardName}</h1>
          <p className="text-xs text-gray-500">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center">
        {projectMembers.map((member, i) => {
          const isActive = activeUserIds.includes(member.id);
          return (
            <div
              key={member.id}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-xs font-semibold text-white ring-2 ring-white transition-transform hover:scale-110 ${i > 0 ? "-ml-2" : ""}`}
              title={`${member.name}${member.id === currentUserId ? " (you)" : ""} — ${isActive ? "active" : "idle"}`}
            >
              {member.avatar}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                  isActive ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>
          );
        })}
      </div>
    </header>
  );
}
